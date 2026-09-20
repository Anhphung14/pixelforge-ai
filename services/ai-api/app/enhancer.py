
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "RealESRGAN_x4plus.pth"


class ImageEnhancer:
    def __init__(self):
        model = RRDBNet(
            num_in_ch=3,
            num_out_ch=3,
            num_feat=64,
            num_block=23,
            num_grow_ch=32,
            scale=4,
        )

        self.upsampler = RealESRGANer(
            scale=4,
            model_path=str(MODEL_PATH),
            model=model,
            tile=256,
            tile_pad=10,
            pre_pad=0,
            half=False,
        )

    def enhance(
        self,
        image: Image.Image,
        scale: int = 4,
    ) -> Image.Image:

        rgb = np.array(image.convert("RGB"))

        bgr = cv2.cvtColor(
            rgb,
            cv2.COLOR_RGB2BGR,
        )

        output, _ = self.upsampler.enhance(
            bgr,
            outscale=scale,
        )

        result = cv2.cvtColor(
            output,
            cv2.COLOR_BGR2RGB,
        )

        return Image.fromarray(result)