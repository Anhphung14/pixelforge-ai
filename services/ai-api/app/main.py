
from contextlib import asynccontextmanager
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image, UnidentifiedImageError

from app.enhancer import ImageEnhancer


MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_PIXELS = 12_000_000

enhancer = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global enhancer
    enhancer = ImageEnhancer()
    yield
    enhancer = None


app = FastAPI(
    title="PixelForge AI API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/v1/enhance")
def enhance_image(
    file: UploadFile = File(...),
    scale: int = 4,
):
    if scale not in (2, 4):
        raise HTTPException(
            status_code=400,
            detail="Scale must be 2 or 4",
        )

    if file.content_type not in (
        "image/jpeg",
        "image/png",
        "image/webp",
    ):
        raise HTTPException(
            status_code=400,
            detail="Unsupported image type",
        )

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

    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=400,
            detail="Invalid image",
        )

    try:
        result = enhancer.enhance(image, scale)

        buffer = BytesIO()
        result.save(buffer, format="PNG")
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="image/png",
            headers={
                "Content-Disposition":
                    'attachment; filename="enhanced.png"'
            },
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Image enhancement failed",
        )