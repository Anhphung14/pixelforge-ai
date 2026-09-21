"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  ImageIcon,
  Layers3,
  LoaderCircle,
  RefreshCcw,
  ScanFace,
  Sparkles,
  SunMedium,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

import ImageComparison from "@/components/image-comparison";
import ImageUploader from "@/components/image-uploader";
import {
  enhanceImage,
  type FaceRestorer,
  type ModelType,
  type UpscaleScale,
} from "@/lib/api";

const MAX_INPUT_DIMENSION = 1600;

type Dimensions = { width: number; height: number };

function ToggleCard({
  active,
  description,
  disabled,
  icon,
  label,
  onClick,
  tone = "blue",
}: {
  active: boolean;
  description: string;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: "blue" | "cyan" | "sky";
}) {
  const tones = {
    blue: "border-blue-400/60 bg-blue-400/10 text-blue-100 shadow-blue-500/10",
    cyan: "border-cyan-400/60 bg-cyan-400/10 text-cyan-100 shadow-cyan-500/10",
    sky: "border-sky-400/60 bg-sky-400/10 text-sky-100 shadow-sky-500/10",
  };

  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`group relative flex min-h-28 flex-col items-start rounded-2xl border p-4 text-left transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? `${tones[tone]} shadow-lg`
          : "border-white/8 bg-white/[0.025] text-zinc-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <span className="mb-4 flex w-full items-center justify-between">
        <span className="rounded-xl border border-white/10 bg-black/20 p-2.5">{icon}</span>
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
            active ? "border-current bg-current" : "border-zinc-600"
          }`}
        >
          {active && <Check size={13} className="text-[#0b0b10]" strokeWidth={3} />}
        </span>
      </span>
      <span className="text-sm font-semibold text-white">{label}</span>
      <span className="mt-1 text-xs leading-5 text-zinc-500">{description}</span>
    </button>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const isVi = language === "vi";
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [scale, setScale] = useState<UpscaleScale>(4);
  const [modelType, setModelType] = useState<ModelType>("general");
  const [faceEnhance, setFaceEnhance] = useState(false);
  const [faceRestorer, setFaceRestorer] = useState<FaceRestorer>("codeformer");
  const [fidelity, setFidelity] = useState(0.5);
  const [lowLightEnhance, setLowLightEnhance] = useState(false);
  const [lowLightStrength, setLowLightStrength] = useState(0.6);
  const [freshnessEnhance, setFreshnessEnhance] = useState(false);
  const [freshnessStrength, setFreshnessStrength] = useState(0.55);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (!loading) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [loading]);

  useEffect(() => () => {
    if (original) URL.revokeObjectURL(original);
  }, [original]);

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result);
  }, [result]);

  const effectiveDimensions = useMemo(() => {
    if (!dimensions) return null;
    const ratio = Math.min(1, MAX_INPUT_DIMENSION / Math.max(dimensions.width, dimensions.height));
    return {
      width: Math.round(dimensions.width * ratio * scale),
      height: Math.round(dimensions.height * ratio * scale),
      resized: ratio < 1,
    };
  }, [dimensions, scale]);

  const enabledEnhancements = [freshnessEnhance, lowLightEnhance, faceEnhance].filter(Boolean).length;

  function setAllEnhancements(enabled: boolean) {
    setFreshnessEnhance(enabled);
    setLowLightEnhance(enabled);
    setFaceEnhance(enabled);
  }

  function selectFile(selected: File) {
    abortRef.current?.abort();
    const objectUrl = URL.createObjectURL(selected);
    setFile(selected);
    setOriginal(objectUrl);
    setResult(null);
    setDimensions(null);
    setError("");

    const img = new window.Image();
    img.onload = () => setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => setError(isVi ? "Không thể đọc kích thước ảnh này." : "Unable to read this image.");
    img.src = objectUrl;
  }

  function clearFile() {
    abortRef.current?.abort();
    setFile(null);
    setOriginal(null);
    setResult(null);
    setDimensions(null);
    setError("");
  }

  async function handleEnhance() {
    if (!file || loading) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setElapsed(0);
    setError("");

    try {
      const blob = await enhanceImage(file, {
        scale,
        modelType,
        faceEnhance,
        faceRestorer,
        fidelity,
        lowLightEnhance,
        lowLightStrength,
        freshnessEnhance,
        freshnessStrength,
        signal: controller.signal,
      });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError(isVi ? "Đã hủy xử lý ảnh." : "Image processing was cancelled.");
      } else {
        setError(err instanceof Error ? err.message : isVi ? "Không thể xử lý ảnh. Vui lòng thử lại." : "Unable to process the image. Please try again.");
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  }

  function cancelEnhance() {
    abortRef.current?.abort();
  }

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#03060b] text-white">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="relative mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        <nav className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25">
              <WandSparkles size={20} />
            </span>
            <div>
              <p className="font-bold tracking-[-0.02em]">PixelForge AI</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Image intelligence studio</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs text-cyan-300 md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
              {isVi ? "Xử lý riêng tư trên máy" : "Private on-device processing"}
            </span>
            <div className="flex rounded-xl border border-white/10 bg-white/[0.035] p-1" aria-label="Language selector">
              {(["vi", "en"] as const).map((value) => (
                <button key={value} type="button" aria-pressed={language === value} onClick={() => setLanguage(value)} className={`rounded-lg px-3 py-1.5 text-[11px] font-bold tracking-wider transition ${language === value ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-white"}`}>{value.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </nav>

        <header className="mx-auto mb-10 max-w-3xl text-center lg:mb-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1.5 text-xs font-semibold text-blue-300">
            <Sparkles size={14} />
            {isVi ? "Không chỉ phóng to — tái tạo lại từng chi tiết" : "More than upscaling — rebuild every detail"}
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-7xl">
            {isVi ? "Tái định nghĩa chất lượng" : "Redefine image quality"}
            <span className="gradient-text">{isVi ? " bằng AI." : " with AI."}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-7 text-zinc-400 sm:text-base">
            {isVi ? "Làm nét, phục hồi khuôn mặt, cân bằng ánh sáng và làm tươi màu ảnh bằng các mô hình AI chuyên biệt." : "Sharpen details, restore faces, balance lighting and revive colors with purpose-built AI models."}
          </p>
        </header>

        {!original ? (
          <div className="mx-auto max-w-4xl">
            <ImageUploader onFileSelect={selectFile} language={language} />
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-zinc-500 sm:grid-cols-4">
              {(isVi ? ["Tối đa 10 MB", "JPG · PNG · WebP", "2× hoặc 4×", "Không lưu ảnh"] : ["Up to 10 MB", "JPG · PNG · WebP", "2× or 4×", "No image storage"]).map((item) => (
                <div key={item} className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3">
                  <Check size={13} className="text-blue-400" /> {item}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <section className="studio-shell">
            <div className="studio-preview">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded-xl border border-white/10 bg-white/5 p-2 text-blue-300"><ImageIcon size={18} /></span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file?.name}</p>
                    <p className="text-xs text-zinc-500">
                      {dimensions ? `${dimensions.width} × ${dimensions.height} px` : isVi ? "Đang đọc ảnh…" : "Reading image…"}
                      {file ? ` · ${(file.size / 1024 / 1024).toFixed(2)} MB` : ""}
                    </p>
                  </div>
                </div>
                <button type="button" disabled={loading} onClick={clearFile} className="icon-button" aria-label={isVi ? "Xóa ảnh" : "Remove image"}>
                  <X size={17} />
                </button>
              </div>

              <div className="preview-canvas">
                {result ? (
                  <ImageComparison before={original} after={result} language={language} />
                ) : (
                  // Blob URLs are generated locally and should not pass through the Next image optimizer.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={original} alt={isVi ? "Ảnh gốc đã tải lên" : "Uploaded original"} className="max-h-[650px] w-full object-contain" />
                )}
                {loading && (
                  <div className="absolute inset-0 z-30 grid place-items-center bg-[#09090e]/75 backdrop-blur-sm">
                    <div className="text-center">
                      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-blue-400/30 bg-blue-500/10 shadow-xl shadow-blue-500/10">
                        <LoaderCircle className="animate-spin text-blue-300" size={28} />
                      </span>
                      <p className="mt-4 text-sm font-semibold">{isVi ? "AI đang tái tạo ảnh" : "AI is rebuilding your image"}</p>
                      <p className="mt-1 text-xs text-zinc-400">{isVi ? `Đã xử lý trong ${elapsed} giây` : `Processing for ${elapsed} seconds`}</p>
                      <button type="button" onClick={cancelEnhance} className="mt-4 text-xs text-zinc-400 underline decoration-zinc-600 underline-offset-4 hover:text-white">{isVi ? "Hủy xử lý" : "Cancel"}</button>
                    </div>
                  </div>
                )}
              </div>

              {effectiveDimensions && (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="rounded-lg bg-white/5 px-2.5 py-1.5">{isVi ? "Ảnh gốc" : "Original"} {dimensions?.width} × {dimensions?.height}</span>
                  <ArrowRight size={13} />
                  <span className="rounded-lg bg-blue-400/10 px-2.5 py-1.5 font-medium text-blue-300">
                    {isVi ? "Đầu ra dự kiến" : "Expected output"} {effectiveDimensions.width} × {effectiveDimensions.height}
                  </span>
                  {effectiveDimensions.resized && <span className="text-cyan-300">{isVi ? "Ảnh được tối ưu về 1600 px trước khi xử lý" : "Image is optimized to 1600 px before processing"}</span>}
                </div>
              )}
            </div>

            <aside className="studio-controls">
              <div className="mb-7">
                <p className="eyebrow">01 · {isVi ? "Định dạng ảnh" : "Image type"}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(["general", "anime"] as ModelType[]).map((type) => (
                    <button key={type} type="button" disabled={loading} onClick={() => setModelType(type)} className={`segmented ${modelType === type ? "segmented-active" : ""}`}>
                      <Layers3 size={15} /> {type === "general" ? (isVi ? "Ảnh chụp" : "Photography") : "Anime / 2D"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-7">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">02 · {isVi ? "Độ phân giải" : "Resolution"}</p>
                  <span className="text-xs text-zinc-500">{isVi ? "Phóng lớn" : "Upscale"}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {([2, 4] as UpscaleScale[]).map((value) => (
                    <button key={value} type="button" disabled={loading} onClick={() => setScale(value)} className={`scale-option ${scale === value ? "scale-option-active" : ""}`}>
                      <span className="text-lg font-semibold">{value}×</span>
                      <span className="text-[10px] text-zinc-500">{value === 2 ? (isVi ? "Nhanh & nhẹ" : "Fast & light") : (isVi ? "Chi tiết tối đa" : "Maximum detail")}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-7">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">03 · {isVi ? "Nâng cấp thông minh" : "AI enhancements"}</p>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      {isVi ? "Có thể kết hợp nhiều chức năng cùng lúc" : "Combine multiple enhancements in one process"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-blue-400/20 bg-blue-400/5 px-2.5 py-1 text-[10px] font-bold text-blue-300">
                      {enabledEnhancements}/3 {isVi ? "đã bật" : "enabled"}
                    </span>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setAllEnhancements(enabledEnhancements !== 3)}
                      className="text-[10px] font-semibold text-slate-400 transition hover:text-cyan-300 disabled:opacity-50"
                    >
                      {enabledEnhancements === 3
                        ? (isVi ? "Tắt tất cả" : "Clear all")
                        : (isVi ? "Bật tất cả" : "Enable all")}
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <ToggleCard active={freshnessEnhance} disabled={loading} onClick={() => setFreshnessEnhance((value) => !value)} icon={<RefreshCcw size={18} className="text-cyan-300" />} label={isVi ? "Làm tươi" : "Refresh"} description={isVi ? "Màu trong và sống động" : "Clean, vivid colors"} tone="cyan" />
                  <ToggleCard active={lowLightEnhance} disabled={loading} onClick={() => setLowLightEnhance((value) => !value)} icon={<SunMedium size={18} className="text-sky-300" />} label={isVi ? "Làm sáng" : "Relight"} description={isVi ? "Cứu chi tiết vùng tối" : "Recover dark details"} tone="sky" />
                  <ToggleCard active={faceEnhance} disabled={loading} onClick={() => setFaceEnhance((value) => !value)} icon={<ScanFace size={18} className="text-blue-300" />} label={isVi ? "Khuôn mặt" : "Face restore"} description={isVi ? "Phục hồi ngũ quan" : "Rebuild facial details"} />
                </div>
              </div>

              {(freshnessEnhance || lowLightEnhance || faceEnhance) && (
                <div className="mb-7 space-y-5 rounded-2xl border border-white/8 bg-black/20 p-4">
                  {freshnessEnhance && (
                    <RangeControl label={isVi ? "Độ tươi màu" : "Color freshness"} value={freshnessStrength} onChange={setFreshnessStrength} disabled={loading} accent="cyan" />
                  )}
                  {lowLightEnhance && (
                    <RangeControl label={isVi ? "Cường độ làm sáng" : "Relight intensity"} value={lowLightStrength} onChange={setLowLightStrength} disabled={loading} accent="sky" min={0.1} />
                  )}
                  {faceEnhance && (
                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs"><span className="text-zinc-400">{isVi ? "Phục hồi khuôn mặt" : "Face restoration"}</span><span className="text-blue-300">{faceRestorer === "codeformer" ? "CodeFormer" : "GFPGAN"}</span></div>
                      <div className="grid grid-cols-2 gap-2">
                        {(["codeformer", "gfpgan"] as FaceRestorer[]).map((restorer) => <button key={restorer} type="button" disabled={loading} onClick={() => setFaceRestorer(restorer)} className={`mini-segment ${faceRestorer === restorer ? "mini-segment-active" : ""}`}>{restorer === "codeformer" ? (isVi ? "Ảnh mờ nặng" : "Severe blur") : (isVi ? "Tự nhiên" : "Natural")}</button>)}
                      </div>
                      {faceRestorer === "codeformer" && <div className="mt-4"><RangeControl label={isVi ? "Giữ nét nhận dạng" : "Identity fidelity"} value={fidelity} onChange={setFidelity} disabled={loading} accent="blue" min={0.2} max={0.8} /></div>}
                    </div>
                  )}
                </div>
              )}

              {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2.5 text-xs leading-5 text-red-300">{error}</p>}

              <button type="button" onClick={handleEnhance} disabled={loading} className="primary-action">
                {loading ? <LoaderCircle size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                {loading ? (isVi ? "Đang xử lý…" : "Processing…") : result ? (isVi ? "Tạo lại phiên bản mới" : "Generate another version") : (isVi ? "Nâng cấp ảnh ngay" : "Enhance image now")}
              </button>
              {result && <a href={result} download="pixelforge-enhanced.png" className="secondary-action"><Download size={18} /> {isVi ? "Tải ảnh chất lượng cao" : "Download high-quality image"}</a>}
            </aside>
          </section>
        )}

        <footer className="mt-12 border-t border-white/5 py-7 text-center text-xs text-zinc-600">
          Real-ESRGAN · CodeFormer · Retinexformer · {isVi ? "Xử lý cục bộ, không lưu trữ ảnh" : "Local processing, no image storage"}
        </footer>
      </div>
    </main>
  );
}

function RangeControl({
  accent,
  disabled,
  label,
  max = 1,
  min = 0.1,
  onChange,
  value,
}: {
  accent: "blue" | "cyan" | "sky";
  disabled: boolean;
  label: string;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  value: number;
}) {
  const valueTone = {
    blue: "text-blue-300",
    cyan: "text-cyan-300",
    sky: "text-sky-300",
  }[accent];
  const rangeTone = {
    blue: "text-blue-400 accent-blue-400",
    cyan: "text-cyan-400 accent-cyan-400",
    sky: "text-sky-400 accent-sky-400",
  }[accent];

  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-xs"><span className="text-zinc-400">{label}</span><span className={valueTone}>{Math.round(value * 100)}%</span></span>
      <input type="range" min={min} max={max} step="0.05" disabled={disabled} value={value} onChange={(event) => onChange(Number(event.target.value))} className={`range-control ${rangeTone}`} />
    </label>
  );
}
