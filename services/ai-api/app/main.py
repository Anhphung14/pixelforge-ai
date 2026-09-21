
from contextlib import asynccontextmanager
from io import BytesIO
import logging
from pathlib import Path
import sys
from threading import Lock

# Ensure services/ai-api directory is in Python path
API_DIR = Path(__file__).resolve().parent.parent
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))

# Ensure root workspace is in Python path
ROOT_DIR = API_DIR.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
    Query,
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from PIL import Image, UnidentifiedImageError

from app.enhancer import ImageEnhancer


# ==========================================
# Configuration
# ==========================================

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_PIXELS = 12_000_000

ALLOWED_IMAGE_TYPES = (
    "image/jpeg",
    "image/png",
    "image/webp",
)

logger = logging.getLogger(__name__)

enhancer: ImageEnhancer | None = None
inference_lock = Lock()


# ==========================================
# Application Lifespan
# ==========================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    global enhancer

    logger.info("Loading Real-ESRGAN model...")

    enhancer = ImageEnhancer()

    logger.info("Real-ESRGAN model loaded successfully.")

    yield

    enhancer = None


# ==========================================
# FastAPI Application
# ==========================================

app = FastAPI(
    title="PixelForge AI API",
    description="AI-powered image enhancement API",
    version="1.1.0",
    lifespan=lifespan,
)


# ==========================================
# CORS Configuration
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ==========================================
# Health Check
# ==========================================

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "PixelForge AI",
        "model_loaded": enhancer is not None,
        "retinexformer_available": enhancer.is_retinexformer_available() if enhancer else False,
    }


# ==========================================
# Image Enhancement
# ==========================================

@app.post("/api/v1/enhance")
def enhance_image(
    file: UploadFile = File(...),

    scale: int = Query(
        default=4,
        description="Image upscale factor: 2 or 4",
    ),

    strength: float = Query(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="AI enhancement strength: 0.0 to 1.0",
    ),

    model_type: str = Query(
        default="general",
        description="Model type: general or anime",
    ),

    face_enhance: bool = Query(
        default=False,
        description="Enable face restoration",
    ),

    face_restorer: str = Query(
        default="codeformer",
        description="Face restoration model: codeformer or gfpgan",
    ),

    fidelity: float = Query(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="CodeFormer fidelity: 0.0 (high restoration) to 1.0 (high fidelity)",
    ),

    low_light_enhance: bool = Query(
        default=False,
        description="Enable Retinexformer AI low-light enhancement",
    ),

    low_light_strength: float = Query(
        default=0.6,
        ge=0.1,
        le=1.0,
        description="Retinexformer brightness intensity: 0.1 to 1.0",
    ),

    freshness_enhance: bool = Query(
        default=False,
        description="Enable natural color and contrast refresh",
    ),

    freshness_strength: float = Query(
        default=0.55,
        ge=0.1,
        le=1.0,
        description="Freshness intensity: 0.1 to 1.0",
    ),
):
    # --------------------------------------
    # 1. Validate scale and model_type
    # --------------------------------------

    if scale not in (2, 4):
        raise HTTPException(
            status_code=400,
            detail="Scale must be 2 or 4",
        )

    if model_type not in ("general", "anime"):
        raise HTTPException(
            status_code=400,
            detail="Model type must be 'general' or 'anime'",
        )

    if face_restorer not in ("codeformer", "gfpgan"):
        raise HTTPException(
            status_code=400,
            detail="Face restorer must be 'codeformer' or 'gfpgan'",
        )

    # --------------------------------------
    # 2. Validate file type
    # --------------------------------------

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image type. Use JPG, PNG or WebP.",
        )

    # --------------------------------------
    # 3. Read and validate image
    # --------------------------------------

    try:
        data = file.file.read(MAX_UPLOAD_BYTES + 1)

        if len(data) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=413,
                detail="Image exceeds 10 MB",
            )

        image = Image.open(BytesIO(data))

        if image.width * image.height > MAX_PIXELS:
            raise HTTPException(
                status_code=413,
                detail="Image dimensions are too large",
            )

        image.load()

        image = image.convert("RGB")

    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted image",
        )

    finally:
        file.file.close()

    # --------------------------------------
    # 4. Check AI model
    # --------------------------------------

    if enhancer is None:
        raise HTTPException(
            status_code=503,
            detail="AI model is not ready",
        )

    # --------------------------------------
    # 5. Run AI enhancement
    # --------------------------------------

    try:
        logger.info(
            "Processing image: scale=%s, strength=%s, model_type=%s, face_enhance=%s, face_restorer=%s, fidelity=%s, low_light_enhance=%s, low_light_strength=%s",
            scale,
            strength,
            model_type,
            face_enhance,
            face_restorer,
            fidelity,
            low_light_enhance,
            low_light_strength,
        )

        # The loaded restoration helpers keep mutable state and GPU inference can
        # easily exhaust memory when multiple requests run concurrently.
        with inference_lock:
            result = enhancer.enhance(
                image=image,
                scale=scale,
                strength=strength,
                model_type=model_type,
                face_enhance=face_enhance,
                face_restorer=face_restorer,
                fidelity=fidelity,
                low_light_enhance=low_light_enhance,
                low_light_strength=low_light_strength,
                freshness_enhance=freshness_enhance,
                freshness_strength=freshness_strength,
            )

        # ----------------------------------
        # 6. Convert result to PNG
        # ----------------------------------

        buffer = BytesIO()

        result.save(
            buffer,
            format="PNG",
        )

        buffer.seek(0)

        logger.info(
            "Image enhanced successfully: %s x %s",
            result.width,
            result.height,
        )

        # ----------------------------------
        # 7. Return enhanced image
        # ----------------------------------

        return StreamingResponse(
            buffer,
            media_type="image/png",
            headers={
                "Content-Disposition":
                    'attachment; filename="pixelforge-enhanced.png"'
            },
        )

    except FileNotFoundError as e:
        logger.warning("Required model file missing: %s", e)
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception:
        logger.exception("Image enhancement failed")

        raise HTTPException(
            status_code=500,
            detail="Image enhancement failed",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
