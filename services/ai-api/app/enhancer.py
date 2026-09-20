import gc
import logging
import os
from pathlib import Path
from typing import Literal

import cv2
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision.transforms.functional import normalize

from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer
from gfpgan import GFPGANer
from codeformer.basicsr.utils import img2tensor, tensor2img
from codeformer.basicsr.utils.registry import ARCH_REGISTRY
from facexlib.utils.face_restoration_helper import FaceRestoreHelper

from app.archs.retinexformer_arch import RetinexFormer

logger = logging.getLogger(__name__)

# Limit CPU threads for PyTorch to prevent 100% CPU spikes and keep macOS responsive
num_cores = os.cpu_count() or 4
max_threads = max(1, min(4, num_cores // 2))
torch.set_num_threads(max_threads)
logger.info(f"PyTorch CPU threads limited to: {max_threads} (total cores: {num_cores})")


def clean_memory():
    """Release GPU and Python memory to keep system light."""
    gc.collect()
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()
    elif torch.cuda.is_available():
        torch.cuda.empty_cache()


BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"

GENERAL_MODEL_PATH = MODELS_DIR / "RealESRGAN_x4plus.pth"
ANIME_MODEL_PATH = MODELS_DIR / "RealESRGAN_x4plus_anime_6B.pth"
GFPGAN_MODEL_PATH = MODELS_DIR / "GFPGANv1.4.pth"
CODEFORMER_MODEL_PATH = MODELS_DIR / "codeformer.pth"

RETINEX_CANDIDATE_PATHS = [
    MODELS_DIR / "LOL_v2_real.pth",
    MODELS_DIR / "RetinexFormer_LOL_v2_real.pth",
    MODELS_DIR / "LOL_v1.pth",
    MODELS_DIR / "RetinexFormer_LOL_v1.pth",
    MODELS_DIR / "retinexformer.pth",
]

ModelType = Literal["general", "anime"]
FaceRestorerType = Literal["codeformer", "gfpgan", "none"]
MAX_INPUT_DIMENSION = 1600


def get_optimal_device() -> torch.device:
    if torch.backends.mps.is_available():
        return torch.device("mps")
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


class ImageEnhancer:
    def __init__(self):
        self.device = get_optimal_device()
        logger.info(f"ImageEnhancer initialized on device: {self.device}")

        self._general_upsampler: RealESRGANer | None = None
        self._anime_upsampler: RealESRGANer | None = None
        self._gfpgan_enhancer: GFPGANer | None = None
        self._codeformer_net = None
        self._face_helper: FaceRestoreHelper | None = None
        self._retinexformer: RetinexFormer | None = None

        # Pre-load general model by default
        self._get_general_upsampler()

    def get_retinexformer_path(self) -> Path | None:
        for path in RETINEX_CANDIDATE_PATHS:
            if path.exists():
                return path
        return None

    def is_retinexformer_available(self) -> bool:
        return self.get_retinexformer_path() is not None

    def _get_general_upsampler(self) -> RealESRGANer:
        if self._general_upsampler is None:
            if not GENERAL_MODEL_PATH.exists():
                raise FileNotFoundError(f"Model not found at {GENERAL_MODEL_PATH}")

            model = RRDBNet(
                num_in_ch=3,
                num_out_ch=3,
                num_feat=64,
                num_block=23,
                num_grow_ch=32,
                scale=4,
            )
            self._general_upsampler = RealESRGANer(
                scale=4,
                model_path=str(GENERAL_MODEL_PATH),
                model=model,
                tile=512,
                tile_pad=32,
                pre_pad=10,
                half=False,
                device=self.device,
            )
            logger.info("RealESRGAN General model loaded.")
        return self._general_upsampler

    def _get_anime_upsampler(self) -> RealESRGANer:
        if self._anime_upsampler is None:
            if not ANIME_MODEL_PATH.exists():
                logger.warning(f"Anime model not found at {ANIME_MODEL_PATH}, falling back to general model.")
                return self._get_general_upsampler()

            model = RRDBNet(
                num_in_ch=3,
                num_out_ch=3,
                num_feat=64,
                num_block=6,
                num_grow_ch=32,
                scale=4,
            )
            self._anime_upsampler = RealESRGANer(
                scale=4,
                model_path=str(ANIME_MODEL_PATH),
                model=model,
                tile=512,
                tile_pad=32,
                pre_pad=10,
                half=False,
                device=self.device,
            )
            logger.info("RealESRGAN Anime 6B model loaded.")
        return self._anime_upsampler

    def _get_codeformer(self):
        if self._codeformer_net is None:
            if not CODEFORMER_MODEL_PATH.exists():
                raise FileNotFoundError(f"CodeFormer model not found at {CODEFORMER_MODEL_PATH}")

            logger.info("Loading CodeFormer network...")
            self._codeformer_net = ARCH_REGISTRY.get("CodeFormer")(
                dim_embd=512,
                codebook_size=1024,
                n_head=8,
                n_layers=9,
                connect_list=["32", "64", "128", "256"],
            ).to(self.device)

            checkpoint = torch.load(str(CODEFORMER_MODEL_PATH), map_location="cpu")["params_ema"]
            self._codeformer_net.load_state_dict(checkpoint)
            self._codeformer_net.eval()
            logger.info("CodeFormer network loaded successfully.")
        return self._codeformer_net

    def _get_face_helper(self, upscale: int) -> FaceRestoreHelper:
        if self._face_helper is None or self._face_helper.upscale_factor != upscale:
            self._face_helper = FaceRestoreHelper(
                upscale_factor=upscale,
                face_size=512,
                crop_ratio=(1, 1),
                det_model="retinaface_resnet50",
                save_ext="png",
                use_parse=True,
                device=self.device,
                model_rootpath="gfpgan/weights",
            )
        return self._face_helper

    def _get_gfpgan(self, upscale: int, bg_upsampler: RealESRGANer) -> GFPGANer | None:
        if not GFPGAN_MODEL_PATH.exists():
            logger.warning(f"GFPGAN model not found at {GFPGAN_MODEL_PATH}")
            return None

        if self._gfpgan_enhancer is None:
            logger.info("Loading GFPGAN face restoration model...")
            self._gfpgan_enhancer = GFPGANer(
                model_path=str(GFPGAN_MODEL_PATH),
                upscale=upscale,
                arch="clean",
                channel_multiplier=2,
                bg_upsampler=bg_upsampler,
                device=self.device,
            )
            logger.info("GFPGAN model loaded.")
        else:
            self._gfpgan_enhancer.upscale = upscale
            self._gfpgan_enhancer.bg_upsampler = bg_upsampler

        return self._gfpgan_enhancer

    def _get_retinexformer(self) -> RetinexFormer:
        if self._retinexformer is None:
            model_path = self.get_retinexformer_path()
            if model_path is None:
                raise FileNotFoundError(
                    f"Retinexformer weights not found. Please place weights (e.g., LOL_v2_real.pth) in {MODELS_DIR}"
                )

            logger.info(f"Loading Retinexformer from {model_path.name}...")
            model = RetinexFormer(
                in_channels=3,
                out_channels=3,
                n_feat=40,
                stage=1,
                num_blocks=[1, 2, 2],
            ).to(self.device)

            ckpt = torch.load(str(model_path), map_location="cpu")
            weights = ckpt["params"] if isinstance(ckpt, dict) and "params" in ckpt else ckpt
            model.load_state_dict(weights, strict=True)
            model.eval()
            self._retinexformer = model
            logger.info("Retinexformer model loaded successfully.")
        return self._retinexformer

    def enhance_low_light(self, image: Image.Image, strength: float = 0.6) -> Image.Image:
        """
        Enhance low-light underexposed image using Retinexformer with highlight protection.
        """
        model = self._get_retinexformer()

        orig_rgb = image.convert("RGB")
        rgb = np.array(orig_rgb).astype(np.float32) / 255.0
        tensor = torch.from_numpy(rgb).permute(2, 0, 1).unsqueeze(0).to(self.device)

        # Pad to multiple of 8 for transformer stages
        _, _, h, w = tensor.shape
        pad_h = (8 - h % 8) % 8
        pad_w = (8 - w % 8) % 8
        if pad_h > 0 or pad_w > 0:
            tensor = F.pad(tensor, (0, pad_w, 0, pad_h), mode="reflect")

        with torch.no_grad():
            out = model(tensor)

        # Unpad and clamp
        out = out[:, :, :h, :w]
        out = torch.clamp(out, 0.0, 1.0)
        out_np = (out.squeeze(0).permute(1, 2, 0).cpu().numpy() * 255.0).round().astype(np.float32)

        # If strength is 1.0, return raw Retinexformer output
        if strength >= 0.999:
            return Image.fromarray(np.clip(out_np, 0, 255).astype(np.uint8))

        # Smart highlight-aware blending to prevent over-exposure and harsh glare
        orig_np = np.array(orig_rgb).astype(np.float32)
        # Compute normalized luminance of original image: Y = 0.299R + 0.587G + 0.114B
        lum = (0.299 * orig_np[..., 0] + 0.587 * orig_np[..., 1] + 0.114 * orig_np[..., 2]) / 255.0

        # Protect bright areas from blowing out: darker areas get more boost
        boost_weight = np.clip((1.0 - 0.5 * lum)[..., None] * strength, 0.0, 1.0)
        blended = orig_np * (1.0 - boost_weight) + out_np * boost_weight
        return Image.fromarray(np.clip(blended, 0, 255).astype(np.uint8))

    def _restore_faces_codeformer(
        self,
        bgr: np.ndarray,
        upsampler: RealESRGANer,
        scale: int,
        fidelity: float = 0.5,
    ) -> np.ndarray:
        face_helper = self._get_face_helper(upscale=scale)
        face_helper.clean_all()
        face_helper.read_image(bgr)

        # Detect landmarks
        num_faces = face_helper.get_face_landmarks_5(
            only_center_face=False,
            resize=640,
            eye_dist_threshold=5,
        )

        # If no faces detected, fallback to standard background upsampler
        if num_faces == 0:
            logger.info("No faces detected by RetinaFace, returning Real-ESRGAN upscale.")
            return upsampler.enhance(bgr, outscale=scale)[0]

        logger.info(f"Detected {num_faces} face(s). Restoring with CodeFormer (fidelity={fidelity})...")
        face_helper.align_warp_face()

        codeformer = self._get_codeformer()

        for cropped_face in face_helper.cropped_faces:
            cropped_face_t = img2tensor(cropped_face / 255.0, bgr2rgb=True, float32=True)
            normalize(cropped_face_t, (0.5, 0.5, 0.5), (0.5, 0.5, 0.5), inplace=True)
            cropped_face_t = cropped_face_t.unsqueeze(0).to(self.device)

            try:
                with torch.no_grad():
                    output = codeformer(cropped_face_t, w=fidelity, adain=True)[0]
                    restored_face = tensor2img(output, rgb2bgr=True, min_max=(-1, 1)).astype("uint8")
            except Exception as e:
                logger.error(f"CodeFormer inference error: {e}")
                restored_face = cropped_face

            face_helper.add_restored_face(restored_face)

        # Upsample background with Real-ESRGAN
        bg_img, _ = upsampler.enhance(bgr, outscale=scale)

        # Paste restored faces onto upsampled background
        face_helper.get_inverse_affine(None)
        restored_img = face_helper.paste_faces_to_input_image(upsample_img=bg_img)
        return restored_img

    def enhance(
        self,
        image: Image.Image,
        scale: int = 4,
        strength: float = 1.0,
        model_type: ModelType = "general",
        face_enhance: bool = False,
        face_restorer: FaceRestorerType = "codeformer",
        fidelity: float = 0.5,
        low_light_enhance: bool = False,
        low_light_strength: float = 0.6,
    ) -> Image.Image:
        try:
            if scale not in (2, 4):
                raise ValueError("Scale must be 2 or 4")

            if not 0.0 <= strength <= 1.0:
                raise ValueError("Strength must be between 0 and 1")

            if not 0.0 <= fidelity <= 1.0:
                raise ValueError("Fidelity must be between 0 and 1")

            if not 0.0 <= low_light_strength <= 1.0:
                raise ValueError("Low-light strength must be between 0 and 1")

            # Prevent memory explosion: downscale if input image is excessively large
            if max(image.width, image.height) > MAX_INPUT_DIMENSION:
                ratio = MAX_INPUT_DIMENSION / max(image.width, image.height)
                new_w = max(1, int(image.width * ratio))
                new_h = max(1, int(image.height * ratio))
                logger.info(f"Resizing input image from {image.size} to ({new_w}, {new_h}) to prevent memory overload")
                image = image.resize((new_w, new_h), Image.Resampling.LANCZOS)

            # Step 1: Low-light enhancement with Retinexformer (if requested)
            if low_light_enhance:
                if not self.is_retinexformer_available():
                    raise FileNotFoundError(
                        "Retinexformer model file not found in services/ai-api/models. "
                        "Please ensure LOL_v2_real.pth is placed in the models directory."
                    )
                logger.info(f"Applying Retinexformer low-light enhancement (strength={low_light_strength})...")
                image = self.enhance_low_light(image, strength=low_light_strength)

            # Step 2: Select RealESRGAN upsampler
            if model_type == "anime":
                upsampler = self._get_anime_upsampler()
            else:
                upsampler = self._get_general_upsampler()

            rgb = np.array(image.convert("RGB"))
            bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)

            output = None

            # Step 3: Face restoration (if requested)
            if face_enhance:
                if face_restorer == "codeformer":
                    try:
                        output = self._restore_faces_codeformer(
                            bgr=bgr,
                            upsampler=upsampler,
                            scale=scale,
                            fidelity=fidelity,
                        )
                    except Exception as e:
                        logger.error(f"CodeFormer face restoration failed: {e}. Falling back...")
                        output = None
                elif face_restorer == "gfpgan":
                    try:
                        gfpgan = self._get_gfpgan(upscale=scale, bg_upsampler=upsampler)
                        if gfpgan is not None:
                            _, _, output = gfpgan.enhance(
                                bgr,
                                has_aligned=False,
                                only_center_face=False,
                                paste_back=True,
                            )
                    except Exception as e:
                        logger.error(f"GFPGAN failed: {e}. Falling back...")
                        output = None

            if output is None:
                output, _ = upsampler.enhance(bgr, outscale=scale)

            result_rgb = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
            enhanced = Image.fromarray(result_rgb)

            # If strength is 1.0 (default), return full AI enhanced image directly
            if strength >= 0.999:
                return enhanced

            # Otherwise, blend gently with resized original
            original_resized = image.convert("RGB").resize(
                enhanced.size,
                Image.Resampling.LANCZOS,
            )
            return Image.blend(original_resized, enhanced, strength)
        finally:
            # Clean MPS cache and garbage collect after processing
            clean_memory()