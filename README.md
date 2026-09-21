# PixelForge AI 🎨✨

> **Turn pixels into possibilities.**  
> An open-source, full-stack AI studio for next-generation **Super-Resolution**, **Severe Blur Face Restoration**, **Low-Light Enhancement**, and **Natural Color Refresh**.

---

## 🌟 Overview

**PixelForge AI** is an end-to-end image enhancement platform engineered to solve real-world photographic degradation. Rather than relying on simple edge-sharpening filters, PixelForge AI orchestrates state-of-the-art deep learning architectures to:
- **Upscale & Restore Resolution**: 2× and 4× super-resolution preserving micro-textures and fine details.
- **Deblur & Reconstruct Faces**: Accurately restore heavily blurred, out-of-focus, or pixelated faces using quantized vector codebook priors (**CodeFormer** & **GFPGAN**), recovering natural pupils, eyelashes, and skin textures without uncanny artifacts.
- **Illuminate Dark & Night Photos**: Recover underexposed shadow details, contrast, and natural colors using illumination-guided transformers (**Retinexformer**), equipped with intelligent highlight protection to prevent harsh glare.
- **Refresh Faded Photos**: Restore color vibrancy, tonal separation, and subtle contrast with a highlight-aware color pipeline designed to preserve natural-looking skin and bright regions.
- **Optimized for Personal Hardware**: Tailored for Apple Silicon (Metal / MPS) and NVIDIA GPUs (CUDA) with automated memory reclamation, thread throttling, and smooth background execution.

### Studio Experience

- **Vietnamese and English UI** with instant `VI / EN` switching.
- **Multi-effect processing**: combine Color Refresh, Low-Light Enhancement, and Face Restoration in a single run.
- **Professional blue-on-black interface** optimized for desktop and mobile.
- **Accurate output-size estimates** that account for the backend input limit.
- **Before/after comparison**, elapsed processing time, request cancellation, and high-quality downloads.
- **Keyboard-accessible upload area**, visible focus states, and reduced-motion support.

---

## 🚀 Key Features

### 1. 🔍 Super-Resolution Upscaling (Real-ESRGAN)
- **General Realistic Photo Mode**: Powered by `RealESRGAN_x4plus` (`RRDBNet`, 23 blocks) for photography, nature, architectural textures, and products.
- **Anime & 2D Illustration Mode**: Powered by `RealESRGAN_x4plus_anime_6B` to deliver crisp line art, smooth vector-like shading, and zero chromatic ringing or high-frequency grain.
- **Artifact-Free Tiling**: Configured with 512px tiles, 32px padding, and 10px pre-padding to eliminate boundary seams and edge distortion.

### 2. 👤 Severe Blur Face Restoration (CodeFormer & GFPGAN)
- **Discrete Codebook Prior (CodeFormer - NeurIPS)**: Bypasses the limitations of traditional GAN inversion on heavily blurred images. It projects degraded facial features onto high-quality discrete codebook vectors, reconstructing sharp, anatomically accurate eyes, teeth, and skin.
- **Adjustable Fidelity ($w$) Slider**:
  - `w = 0.20 - 0.35` (**High Restoration**): For heavily blurred or out-of-focus portraits.
  - `w = 0.50 - 0.60` (**Balanced**): Ideal balance between sharpness and identity preservation.
  - `w = 0.80 - 1.00` (**High Fidelity**): For slightly degraded photos to retain maximum original likeness.
- **GFPGAN Option**: StyleGAN2-based face restoration available on-demand.

### 3. 🌙 Low-Light Enhancement (Retinexformer - ICCV 2023)
- **One-Stage Retinex-based Transformer**: Decomposes degraded images into illumination and reflectance representations via Illumination-Guided Multi-head Self-Attention (IG-MSA).
- **Highlight-Aware Blending (Anti-Glare)**: Protects regions that are already well-lit while amplifying deep shadows, preventing washed-out skies and over-exposed skin.
- **Interactive Brightness Slider**: Smooth control from 10% to 100% illumination intensity.

### 4. 🌈 Natural Color Refresh

- **Controlled Vibrance**: Increases color separation without applying an aggressive global saturation filter.
- **Subtle Tonal Recovery**: Adds gentle contrast and brightness to faded or flat photos.
- **Highlight Protection**: Automatically reduces the effect in bright areas to protect skies, lamps, and skin tones.
- **Adjustable Strength**: Interactive control from 10% to 100%.
- **Composable Pipeline**: Can run together with Retinexformer and CodeFormer/GFPGAN before super-resolution.

### 5. ⚡ Hardware & Resource Optimization
- **Apple Silicon MPS Acceleration**: Native PyTorch Metal Performance Shaders (MPS) execution on Apple Silicon M-series chips.
- **Auto Memory Reclamation**: Proactive `torch.mps.empty_cache()` and garbage collection after every inference call to keep macOS RAM footprint minimal.
- **CPU Thread Throttling**: Restricts CPU thread spikes to prevent overheating and fan noise.
- **Low-Priority Process Mode (`nice -n 10`)**: Keeps UI, browser, and desktop interactions silky smooth while processing heavy AI jobs in the background.
- **Serialized Model Inference**: Protects mutable face-restoration state and reduces GPU memory contention when multiple requests arrive simultaneously.

---

## 🛠️ Tech Stack & Architecture

```
[ Frontend: Next.js 16 + React 19 + Tailwind CSS ]
                      │  REST API (HTTP / FormData)
                      ▼
[ Backend: FastAPI + Uvicorn (MPS / CUDA Accelerated) ]
                      │
  ┌───────────────────┼──────────────────────────┐
  ▼                   ▼                          ▼
[ Retinexformer ]   [ Real-ESRGAN ]            [ CodeFormer / GFPGAN ]
(Low-Light Boost)   (Super-Resolution 2x/4x)   (Face Landmark Restoration)
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), [Pillow](https://python-pillow.org/), [OpenCV](https://opencv.org/) |
| **Deep Learning** | [PyTorch](https://pytorch.org/) (MPS & CUDA), [BasicSR](https://github.com/XPixelGroup/BasicSR), [Einops](https://github.com/arogozhnikov/einops) |
| **AI Models** | **Real-ESRGAN** (Super-Resolution), **CodeFormer** (Face Restoration), **GFPGAN v1.4**, **Retinexformer** (Low-Light) |

---

## 📂 Project Structure

```
pixelforge-ai/
├── apps/
│   └── web/                    # Next.js frontend web application
│       ├── app/                # Next.js App Router (page.tsx, layout.tsx)
│       ├── src/components/     # UI components (Uploader, Before/After Comparison)
│       └── src/lib/api.ts      # Client-side API connector
├── services/
│   └── ai-api/                 # Python FastAPI inference backend
│       ├── app/
│       │   ├── archs/          # Neural network architectures (Retinexformer, etc.)
│       │   ├── enhancer.py     # Unified ImageEnhancer engine
│       │   └── main.py         # FastAPI routes & endpoints
│       └── models/             # Pretrained weights (.pth files)
├── start_backend.sh            # One-click backend startup script (with port & memory handling)
└── README.md
```

---

## 📦 Model Weights Setup

Place the desired model weights inside the `services/ai-api/models/` directory:

| Model | File Name | Size | Purpose | Source |
| :--- | :--- | :--- | :--- | :--- |
| **Real-ESRGAN** | `RealESRGAN_x4plus.pth` | 64 MB | Realistic 4× upscaling | [Xinntao/Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) |
| **Real-ESRGAN Anime** | `RealESRGAN_x4plus_anime_6B.pth` | 17 MB | 2D / Illustration 4× upscaling | [Xinntao/Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) |
| **CodeFormer** | `codeformer.pth` | 359 MB | Severe blur facial reconstruction | [sczhou/CodeFormer](https://github.com/sczhou/CodeFormer) |
| **GFPGAN** | `GFPGANv1.4.pth` | 332 MB | Face restoration | [TencentARC/GFPGAN](https://github.com/TencentARC/GFPGAN) |
| **Retinexformer** | `LOL_v2_real.pth` | 10 MB | Low-light / night photo enhancement | [caiyuanhao1998/Retinexformer](https://github.com/caiyuanhao1998/Retinexformer) |

---

## 🚦 Getting Started

### Prerequisites
- **macOS** (Apple Silicon M1/M2/M3/M4 recommended) or **Linux** with NVIDIA GPU.
- **Python 3.11+**
- **Node.js 18+** & `npm`

### 1. Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/Anhphung14/pixelforge-ai.git
cd pixelforge-ai

# 2. Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Install dependencies
pip install -r services/ai-api/requirements.txt # or install torch, torchvision, fastapi, uvicorn, basicsr, realesrgan, gfpgan, codeformer-pip, einops

# 4. Start the backend with the automated launch script
chmod +x start_backend.sh
./start_backend.sh
```

The API will be live at `http://127.0.0.1:8000`. You can verify health status at `http://127.0.0.1:8000/health`.

### 2. Frontend Setup

```bash
cd apps/web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 API Reference

### `POST /api/v1/enhance`

Enhance an image using the unified AI pipeline.

#### Query Parameters:
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `scale` | `int` | `4` | Upscale factor (`2` or `4`). |
| `model_type` | `string` | `"general"` | Model type: `"general"` (realistic) or `"anime"` (2D art). |
| `face_enhance` | `bool` | `false` | Enable facial reconstruction. |
| `face_restorer`| `string` | `"codeformer"` | Facial engine: `"codeformer"` or `"gfpgan"`. |
| `fidelity` | `float` | `0.5` | CodeFormer fidelity ($0.0$ to $1.0$). Lower values yield higher generative restoration. |
| `low_light_enhance` | `bool` | `false` | Enable Retinexformer low-light boost. |
| `low_light_strength`| `float` | `0.6` | Retinexformer intensity (`0.1` to `1.0`) with highlight protection. |
| `freshness_enhance` | `bool` | `false` | Enable natural color, contrast, and vibrance refresh. |
| `freshness_strength` | `float` | `0.55` | Color refresh intensity (`0.1` to `1.0`). |
| `strength` | `float` | `1.0` | Output sharpness blending factor ($1.0$ = 100% AI resolution). |

#### Request Body:
- `file`: Multipart image (`image/jpeg`, `image/png`, `image/webp`).

#### Response:
- `image/png` stream of the restored high-resolution image.

#### Combined enhancement example

The enhancement options are independent and can be combined in one request:

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/enhance?scale=4&freshness_enhance=true&freshness_strength=0.55&low_light_enhance=true&low_light_strength=0.6&face_enhance=true&face_restorer=codeformer&fidelity=0.5" \
  -F "file=@photo.jpg" \
  --output pixelforge-enhanced.png
```

The processing order is:

```text
Input validation
  → resize guard (maximum input edge: 1600 px)
  → low-light enhancement (optional)
  → natural color refresh (optional)
  → face restoration (optional)
  → Real-ESRGAN super-resolution
  → PNG output
```

> Images with an edge larger than 1600 px are proportionally resized before AI processing to control memory usage. The web interface reflects this limit in its output-size estimate.

---

## 👏 Acknowledgments

PixelForge AI is built upon groundbreaking open-source research:
- [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) - Xintao Wang et al.
- [CodeFormer](https://github.com/sczhou/CodeFormer) - Shangchen Zhou et al. (NeurIPS 2022)
- [Retinexformer](https://github.com/caiyuanhao1998/Retinexformer) - Yuanhao Cai et al. (ICCV 2023)
- [GFPGAN](https://github.com/TencentARC/GFPGAN) - Xintao Wang et al.
- [BasicSR](https://github.com/XPixelGroup/BasicSR) - Open-source image and video restoration toolbox.

---

## 📄 License
This project is licensed under the [Apache-2.0 License](LICENSE).
