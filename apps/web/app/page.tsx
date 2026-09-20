"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Download,
  ImageIcon,
  LoaderCircle,
  ScanFace,
  Layers,
  Sliders,
  Sun,
} from "lucide-react";

import ImageUploader from "@/components/image-uploader";
import ImageComparison from "@/components/image-comparison";

import {
  enhanceImage,
  type UpscaleScale,
  type ModelType,
  type FaceRestorer,
} from "@/lib/api";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [scale, setScale] = useState<UpscaleScale>(4);
  const [modelType, setModelType] = useState<ModelType>("general");
  const [faceEnhance, setFaceEnhance] = useState(false);
  const [faceRestorer, setFaceRestorer] = useState<FaceRestorer>("codeformer");
  const [fidelity, setFidelity] = useState<number>(0.5);
  const [lowLightEnhance, setLowLightEnhance] = useState(false);
  const [lowLightStrength, setLowLightStrength] = useState<number>(0.6);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (original) URL.revokeObjectURL(original);
    };
  }, [original]);

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result);
    };
  }, [result]);

  function selectFile(selected: File) {
    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setOriginal(objectUrl);
    setResult(null);
    setError("");

    // Calculate dimensions
    const img = new window.Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;
  }

  async function handleEnhance() {
    if (!file || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const blob = await enhanceImage(file, {
        scale,
        modelType,
        faceEnhance,
        faceRestorer,
        fidelity,
        lowLightEnhance,
        lowLightStrength,
      });

      const resultUrl = URL.createObjectURL(blob);
      setResult(resultUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090f] px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            <Sparkles size={16} />
            AI Super-Resolution & CodeFormer Deblur Restoration
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            PixelForge
            <span className="text-violet-400"> AI</span>
          </h1>

          <p className="mt-4 text-zinc-400">
            Turn pixels into possibilities. Khôi phục độ nét cao và khử mờ khuôn mặt với CodeFormer AI.
          </p>
        </header>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5 md:p-8">
          <ImageUploader
            onFileSelect={selectFile}
            disabled={loading}
          />

          {original && (
            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ImageIcon
                    size={20}
                    className="text-violet-400"
                  />
                  <h2 className="text-xl font-semibold">
                    Image Preview
                  </h2>
                </div>

                {dimensions && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="rounded-md bg-zinc-800 px-2 py-1">
                      Gốc: {dimensions.width} × {dimensions.height} px
                    </span>
                    <span>➔</span>
                    <span className="rounded-md bg-violet-950/60 px-2 py-1 font-medium text-violet-300">
                      Mục tiêu: {dimensions.width * scale} × {dimensions.height * scale} px ({scale}×)
                    </span>
                  </div>
                )}
              </div>

              {result ? (
                <ImageComparison
                  before={original}
                  after={result}
                />
              ) : (
                <div className="flex min-h-64 items-center justify-center rounded-2xl bg-zinc-950 p-4">
                  <img
                    src={original}
                    alt="Uploaded image"
                    className="max-h-[500px] max-w-full object-contain"
                  />
                </div>
              )}

              {/* Controls bar */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                {/* Scale selection */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="scale"
                    className="text-sm font-medium text-zinc-400"
                  >
                    Upscale
                  </label>

                  <select
                    id="scale"
                    value={scale}
                    disabled={loading}
                    onChange={(event) =>
                      setScale(
                        Number(event.target.value) as UpscaleScale
                      )
                    }
                    className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm font-medium focus:border-violet-500 focus:outline-none"
                  >
                    <option value={2}>2×</option>
                    <option value={4}>4×</option>
                  </select>
                </div>

                {/* Model Type */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="modelType"
                    className="flex items-center gap-1 text-sm font-medium text-zinc-400"
                  >
                    <Layers size={15} />
                    Chế độ
                  </label>

                  <select
                    id="modelType"
                    value={modelType}
                    disabled={loading}
                    onChange={(event) =>
                      setModelType(event.target.value as ModelType)
                    }
                    className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm font-medium focus:border-violet-500 focus:outline-none"
                  >
                    <option value="general">Ảnh chụp thực tế</option>
                    <option value="anime">Anime / Đồ họa 2D</option>
                  </select>
                </div>

                {/* Low Light Enhancement Toggle (Retinexformer) */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setLowLightEnhance((prev) => !prev)}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition ${
                    lowLightEnhance
                      ? "border-amber-500 bg-amber-500/20 text-amber-200 shadow-sm shadow-amber-500/30"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                  }`}
                  title="Làm sáng ảnh thiếu sáng, tăng độ tương phản và chi tiết vùng tối bằng Retinexformer AI"
                >
                  <Sun size={16} className={lowLightEnhance ? "text-amber-400" : "text-zinc-400"} />
                  <span>Làm sáng ảnh</span>
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      lowLightEnhance ? "bg-amber-400" : "bg-zinc-600"
                    }`}
                  />
                </button>

                {/* Face Restoration Toggle */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setFaceEnhance((prev) => !prev)}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition ${
                    faceEnhance
                      ? "border-violet-500 bg-violet-500/20 text-violet-200 shadow-sm shadow-violet-500/30"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                  }`}
                  title="Khôi phục ngũ quan, mắt, mũi, da tự nhiên cho ảnh mờ/vỡ hạt"
                >
                  <ScanFace size={16} className={faceEnhance ? "text-violet-400" : "text-zinc-400"} />
                  <span>Làm rõ khuôn mặt</span>
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      faceEnhance ? "bg-violet-400" : "bg-zinc-600"
                    }`}
                  />
                </button>

                {/* Enhance button */}
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={loading}
                  className="ml-auto flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Sparkles size={18} />
                  )}

                  {loading
                    ? "Enhancing..."
                    : "Enhance Image"}
                </button>

                {result && (
                  <a
                    href={result}
                    download="pixelforge-enhanced.png"
                    className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 font-semibold transition hover:bg-zinc-700"
                  >
                    <Download size={18} />
                    Download
                  </a>
                )}
              </div>

              {/* Sub-panel for Low-Light brightness options */}
              {lowLightEnhance && (
                <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4 transition">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Sun size={16} className="text-amber-400" />
                      <span className="text-xs font-semibold text-amber-200">
                        Cường độ làm sáng:
                      </span>
                      <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">
                        {Math.round(lowLightStrength * 100)}%
                      </span>
                    </div>

                    {/* Presets and Slider */}
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        disabled={loading}
                        value={lowLightStrength}
                        onChange={(e) => setLowLightStrength(parseFloat(e.target.value))}
                        className="h-1.5 w-32 cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-amber-500"
                        title="Kéo để chỉnh độ sáng vừa mắt"
                      />

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => setLowLightStrength(0.35)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                            lowLightStrength <= 0.4
                              ? "border border-amber-500/60 bg-amber-500/30 text-amber-200"
                              : "border border-transparent bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                          }`}
                          title="Sáng nhẹ, chống chói tối đa"
                        >
                          Sáng nhẹ (35%)
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => setLowLightStrength(0.6)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                            lowLightStrength > 0.4 && lowLightStrength <= 0.75
                              ? "border border-amber-500/60 bg-amber-500/30 text-amber-200"
                              : "border border-transparent bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                          }`}
                          title="Độ sáng tự nhiên, cân bằng nhất"
                        >
                          Tự nhiên (60%)
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => setLowLightStrength(1.0)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                            lowLightStrength > 0.75
                              ? "border border-amber-500/60 bg-amber-500/30 text-amber-200"
                              : "border border-transparent bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                          }`}
                          title="Làm sáng tối đa cho ảnh cực tối"
                        >
                          Rất tối (100%)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-panel for Face Restoration options */}
              {faceEnhance && (
                <div className="mt-4 rounded-2xl border border-violet-500/20 bg-violet-950/20 p-4 transition">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Face Engine */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-violet-300">
                        Thuật toán:
                      </span>
                      <div className="flex rounded-lg bg-zinc-900/80 p-0.5 border border-zinc-800">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => setFaceRestorer("codeformer")}
                          className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                            faceRestorer === "codeformer"
                              ? "bg-violet-600 text-white shadow"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          CodeFormer (Trị mờ nặng)
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => setFaceRestorer("gfpgan")}
                          className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                            faceRestorer === "gfpgan"
                              ? "bg-violet-600 text-white shadow"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          GFPGAN
                        </button>
                      </div>
                    </div>

                    {/* Fidelity settings (for CodeFormer) */}
                    {faceRestorer === "codeformer" && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-violet-300">
                          <Sliders size={13} />
                          <span>Mức độ tái tạo mắt & da:</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => setFidelity(0.2)}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                              fidelity <= 0.3
                                ? "bg-violet-500/30 text-violet-200 border border-violet-500/50"
                                : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-transparent"
                            }`}
                            title="Tái tạo ngũ quan mạnh nhất cho ảnh out nét hoặc mờ tịt"
                          >
                            Cực mạnh (Ảnh rất mờ)
                          </button>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => setFidelity(0.5)}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                              fidelity > 0.3 && fidelity <= 0.6
                                ? "bg-violet-500/30 text-violet-200 border border-violet-500/50"
                                : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-transparent"
                            }`}
                            title="Cân bằng giữa tái tạo nét và giữ đặc điểm nhận dạng"
                          >
                            Cân bằng
                          </button>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => setFidelity(0.8)}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                              fidelity > 0.6
                                ? "bg-violet-500/30 text-violet-200 border border-violet-500/50"
                                : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-transparent"
                            }`}
                            title="Giữ tối đa nét gốc cho ảnh đã tương đối rõ"
                          >
                            Giữ nét gốc
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {loading && (
                <p role="status" className="mt-4 text-sm text-violet-300">
                  AI is processing your image
                  {lowLightEnhance ? " with Retinexformer Low-Light" : ""}
                  {faceEnhance ? ` + ${faceRestorer === "codeformer" ? "CodeFormer" : "GFPGAN"}` : ""}
                  . Please wait...
                </p>
              )}

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-400">
                  {error}
                </p>
              )}
            </div>
          )}
        </section>

        <footer className="mt-10 text-center text-sm text-zinc-500">
          Powered by Real-ESRGAN, CodeFormer & Retinexformer · Built with Next.js and FastAPI
        </footer>
      </div>
    </main>
  );
}