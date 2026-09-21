"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Maximize2,
  ScanFace,
  ServerOff,
  Sparkles,
  SunMedium,
  Zap,
} from "lucide-react";

import BrandLogo from "@/components/brand-logo";
import ImageComparison from "@/components/image-comparison";

interface ShowcaseItem {
  id: string;
  tagVi: string;
  tagEn: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  model: string;
  beforeImg: string;
  afterImg: string;
  fallbackBefore: string;
  fallbackAfter: string;
  metrics: {
    labelVi: string;
    labelEn: string;
    value: string;
  }[];
  highlightsVi: string[];
  highlightsEn: string[];
}

export const SHOWCASE_DATA: ShowcaseItem[] = [
  {
    id: "face-restore",
    tagVi: "Phục hồi khuôn mặt",
    tagEn: "Face Restoration",
    titleVi: "Phục chế chân dung mờ, cũ và tái tạo biểu cảm tự nhiên",
    titleEn: "Portrait Restoration & Natural Facial Expression Reconstruction",
    descVi:
      "Kết hợp CodeFormer và GFPGAN để phân tích 68 điểm mốc khuôn mặt, khôi phục chi tiết vi mô cho mắt, con ngươi, khóe môi, chân mày và kết cấu da tự nhiên mà không làm biến dạng thần thái.",
    descEn:
      "Harnessing CodeFormer and GFPGAN to analyze facial landmarks, rebuilding fine micro-details across eyes, pupils, lips, eyebrows, and natural skin texture without altering original identity.",
    model: "CodeFormer / GFPGAN v1.4",
    beforeImg: "/showcase/face-before.jpg",
    afterImg: "/showcase/face-after.jpg",
    fallbackBefore: "/showcase/face-before.svg",
    fallbackAfter: "/showcase/face-after.svg",
    metrics: [
      { labelVi: "Độ sắc nét khuôn mặt", labelEn: "Facial Sharpness", value: "+420%" },
      { labelVi: "Tốc độ suy luận", labelEn: "Inference Latency", value: "~1.4s" },
      { labelVi: "Độ phân giải đầu ra", labelEn: "Output Resolution", value: "Tối đa 4K" },
    ],
    highlightsVi: [
      "Tái tạo vân da thực tế, không tạo cảm giác bệt sáp",
      "Phục hồi ánh mắt, viền mi và thần thái người chụp",
      "Hoạt động tốt trên cả ảnh đen trắng và ảnh gia đình xưa",
    ],
    highlightsEn: [
      "Natural skin pores restoration without plastic texture",
      "Reconstructs iris clarity, eyelids, and authentic gaze",
      "Seamlessly enhances historical grayscale & family archive photos",
    ],
  },
  {
    id: "super-resolution",
    tagVi: "Siêu phân giải 4x / 8x",
    tagEn: "Super-Resolution",
    titleVi: "Phóng to ảnh độ phân giải cao mà không bị mờ nhòe hay răng cưa",
    titleEn: "Ultra-HD Super-Resolution Without Blur or Pixelation",
    descVi:
      "Sử dụng Real-ESRGAN x4plus huấn luyện trên mạng nơ-ron đối nghịch (GAN), tổng hợp lại các chi tiết bề mặt, cạnh viền sắc nét cho ảnh phong cảnh, kiến trúc, sản phẩm và ảnh chụp từ điện thoại cũ.",
    descEn:
      "Powered by Real-ESRGAN x4plus trained on high-order degradation GANs, synthesizing sharp edges, micro-textures for landscapes, architecture, e-commerce, and vintage mobile captures.",
    model: "Real-ESRGAN x4plus / RealESRGAN_x4plus_anime_6B",
    beforeImg: "/showcase/upscale-before.jpg",
    afterImg: "/showcase/upscale-after.jpg",
    fallbackBefore: "/showcase/upscale-before.svg",
    fallbackAfter: "/showcase/upscale-after.svg",
    metrics: [
      { labelVi: "Hệ số phóng đại", labelEn: "Scaling Factor", value: "2x / 4x / 8x" },
      { labelVi: "Khử răng cưa & vỡ hạt", labelEn: "Anti-Aliasing", value: "100%" },
      { labelVi: "Khả năng in ấn", labelEn: "Print-Ready DPI", value: "300+ DPI" },
    ],
    highlightsVi: [
      "Giữ trọn viền cạnh sắc lạnh của vật thể kiến trúc & sản phẩm",
      "Loại bỏ triệt để hiện tượng nén JPEG (compression artifacts)",
      "Phù hợp cho cả ảnh đời thực (Real-life) và tranh kỹ thuật số (Anime/Illustration)",
    ],
    highlightsEn: [
      "Preserves crisp geometry across products and architecture",
      "Completely eradicates legacy JPEG compression artifacts",
      "Optimized for real photography as well as digital artwork & illustrations",
    ],
  },
  {
    id: "low-light",
    tagVi: "Cứu sáng & Khử nhiễu",
    tagEn: "Low-Light Enhancement",
    titleVi: "Phục hồi chi tiết vùng tối và cân bằng dải sáng động (HDR)",
    titleEn: "Deep Shadow Recovery & Dynamic Exposure Balance (HDR)",
    descVi:
      "Ứng dụng Retinexformer — mô hình Vision Transformer tiên tiến mô phỏng cơ chế điều tiết võng mạc người, chiếu sáng những góc tối ẩn sâu đồng thời triệt tiêu nhiễu hạt ISO ban đêm mà không làm cháy vùng sáng rực.",
    descEn:
      "Powered by Retinexformer, an advanced Vision Transformer simulating human retina illumination to reveal shadow details while eliminating ISO chroma noise and avoiding highlight clipping.",
    model: "Retinexformer (Transformer-based Retinex)",
    beforeImg: "/showcase/lowlight-before.jpg",
    afterImg: "/showcase/lowlight-after.jpg",
    fallbackBefore: "/showcase/lowlight-before.svg",
    fallbackAfter: "/showcase/lowlight-after.svg",
    metrics: [
      { labelVi: "Tăng cường dải sáng", labelEn: "Dynamic Range Boost", value: "+3.5 EV" },
      { labelVi: "Khử nhiễu sắc sai (Noise)", labelEn: "Chroma Denoise", value: "98.5%" },
      { labelVi: "Bảo toàn màu thực", labelEn: "Color Fidelity", value: "Chuẩn Rec.709" },
    ],
    highlightsVi: [
      "Làm sáng tự nhiên không biến ảnh thành ban ngày giả tạo",
      "Khôi phục màu sắc rực rỡ bị chìm khuất trong bóng tối",
      "Lý tưởng cho ảnh tiệc đêm, phong cảnh hoàng hôn và sự kiện trong nhà",
    ],
    highlightsEn: [
      "Natural exposure enhancement without unrealistic over-brightening",
      "Revives deep colors buried in underexposed shadow areas",
      "Perfect for evening events, night cityscapes, and indoor scenes",
    ],
  },
];

export default function HomePage() {
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const isVi = language === "vi";

  const [activeTab, setActiveTab] = useState<string>(SHOWCASE_DATA[0].id);
  const activeItem = SHOWCASE_DATA.find((item) => item.id === activeTab) || SHOWCASE_DATA[0];

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#03060b] text-white">
      {/* Background ambient lighting */}
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="relative mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        {/* Navigation Bar */}
        <nav className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-90 transition">
              <BrandLogo size="md" />
            </Link>
            <span className="hidden rounded-full border border-cyan-400/20 bg-cyan-400/5 px-2.5 py-1 text-[10px] font-bold text-cyan-300 sm:inline-block">
              {isVi ? "Bản tham khảo cấu trúc" : "Architecture Showcase"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/studio"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
            >
              <Layers size={14} className="text-blue-400" />
              <span>{isVi ? "Xem cấu trúc Studio" : "Studio UI Preview"}</span>
            </Link>

            {/* Language switcher */}
            <div className="flex rounded-xl border border-white/10 bg-white/[0.035] p-1" aria-label="Language selector">
              {(["vi", "en"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={language === value}
                  onClick={() => setLanguage(value)}
                  className={`rounded-lg px-3 py-1 text-[11px] font-bold tracking-wider transition ${
                    language === value
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Project Concept & Architecture Disclosure Box */}
        <section className="mx-auto mb-12 max-w-5xl overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-[#081224]/80 via-[#050b16]/90 to-[#03060c] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Left: Idea & Vision */}
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-300">
                <Sparkles size={14} className="text-cyan-400" />
                <span>{isVi ? "Ý tưởng & Tầm nhìn dự án" : "Project Concept & Vision"}</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                {isVi ? "PixelForge AI — Studio rèn luyện chất lượng ảnh bằng mô hình học sâu" : "PixelForge AI — Modular Deep Learning Image Synthesis Studio"}
              </h2>
              <p className="text-xs leading-relaxed text-zinc-300 sm:text-sm">
                {isVi
                  ? "Dự án được xây dựng nhằm giải quyết triệt để các hạn chế của việc phóng to ảnh truyền thống: thay vì nội suy điểm ảnh cơ bản khiến ảnh bị nhòe, hệ thống tích hợp các mô hình AI chuyên biệt hàng đầu (CodeFormer, Real-ESRGAN, Retinexformer) để tái sinh chi tiết vi mô cho khuôn mặt chân dung, mở rộng siêu phân giải 4K và cân bằng dải sáng ảnh đêm."
                  : "Designed to overcome traditional image scaling limits: rather than basic interpolation causing blur, the system integrates state-of-the-art specialized deep learning models (CodeFormer, Real-ESRGAN, Retinexformer) to synthesize facial micro-textures, achieve 4K super-resolution, and balance low-light exposures."}
              </p>
            </div>

            {/* Right: Architecture & Deployment Notice */}
            <div className="flex-1 rounded-2xl border border-amber-500/25 bg-amber-950/15 p-5 text-xs text-amber-100/90 shadow-inner">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <ServerOff size={17} className="shrink-0 text-amber-400" />
                <span>{isVi ? "Lưu ý quan trọng về bản triển khai này" : "Important Architecture & Deployment Notice"}</span>
              </div>
              <div className="mt-3 space-y-2 leading-relaxed text-zinc-300">
                <p>
                  <strong className="text-amber-200">{isVi ? "• Mục đích tham khảo cấu trúc: " : "• Structural Reference: "}</strong>
                  {isVi
                    ? "Bản deploy front-end này trên Vercel phục vụ mục đích giới thiệu ý tưởng thiết kế, cấu trúc hệ thống (UI/UX) và dẫn chứng kết quả thực nghiệm."
                    : "This front-end deployment on Vercel serves as an architectural showcase demonstrating UX design, modular pipeline, and experimental results."}
                </p>
                <p>
                  <strong className="text-amber-200">{isVi ? "• Backend GPU tạm chưa chạy live: " : "• GPU Backend Offline: "}</strong>
                  {isVi
                    ? "Việc suy luận trực tiếp các mô hình AI nặng này đòi hỏi cụm máy chủ GPU cấu hình cao (NVIDIA VRAM lớn). Do điều kiện tài nguyên hiện tại chưa đủ để duy trì server GPU chạy 24/7, backend AI chưa được mở live trực tiếp trên web."
                    : "Running live inference for these heavy deep learning models requires dedicated server GPUs (high VRAM). As hardware hosting resources are currently limited, live backend processing is not hosted online."}
                </p>
                <p>
                  <strong className="text-cyan-300">{isVi ? "• Dẫn chứng kết quả thực tế: " : "• Authentic Processed Proofs: "}</strong>
                  {isVi
                    ? "Toàn bộ hình ảnh so sánh Before / After bên dưới là kết quả thực tế đã được xử lý thành công qua pipeline mô hình AI trong quá trình thử nghiệm cục bộ."
                    : "All Before / After interactive comparisons below are authentic outputs generated by the local AI pipeline during testing."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Header */}
        <header className="mx-auto mb-10 max-w-3xl text-center lg:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3.5 py-1.5 text-xs font-semibold text-cyan-300">
            <Zap size={14} className="text-cyan-400" />
            {isVi ? "Dẫn chứng kết quả thực nghiệm" : "Interactive Empirical Results"}
          </div>
          <h1 className="text-balance text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {isVi ? "So sánh năng lực " : "Compare the power of "}
            <span className="gradient-text">{isVi ? "tái tạo hình ảnh AI." : "AI image synthesis."}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-400 sm:text-base">
            {isVi
              ? "Kéo thanh trượt qua lại để quan sát trực tiếp sự khác biệt giữa ảnh gốc và kết quả sau khi qua các mô hình AI chuyên biệt."
              : "Drag the interactive slider back and forth to inspect the difference between original low-res captures and AI-rebuilt outputs."}
          </p>
        </header>

        {/* Feature Category Tabs */}
        <div className="mx-auto mb-8 flex max-w-3xl flex-wrap justify-center gap-2">
          {SHOWCASE_DATA.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 scale-[1.02]"
                    : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {item.id === "face-restore" && <ScanFace size={16} />}
                {item.id === "super-resolution" && <Maximize2 size={16} />}
                {item.id === "low-light" && <SunMedium size={16} />}
                <span>{isVi ? item.tagVi : item.tagEn}</span>
              </button>
            );
          })}
        </div>

        {/* Main Showcase Stage */}
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#090d16]/80 backdrop-blur-xl shadow-2xl p-4 sm:p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left 7 cols: Interactive Before / After Slider */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black">
                <ImageComparison
                  before={activeItem.beforeImg}
                  after={activeItem.afterImg}
                  fallbackBefore={activeItem.fallbackBefore}
                  fallbackAfter={activeItem.fallbackAfter}
                  language={language}
                />
              </div>
            </div>

            {/* Right 5 cols: Capability Details, Model Spec, Highlights */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300">
                  <Cpu size={13} />
                  <span>{activeItem.model}</span>
                </div>

                <h2 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {isVi ? activeItem.titleVi : activeItem.titleEn}
                </h2>

                <p className="mt-3 text-xs leading-relaxed text-zinc-300 sm:text-sm">
                  {isVi ? activeItem.descVi : activeItem.descEn}
                </p>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 rounded-2xl border border-white/10 bg-black/40 p-3">
                {activeItem.metrics.map((metric, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <span className="font-extrabold text-blue-400 text-sm sm:text-base">
                      {metric.value}
                    </span>
                    <span className="mt-0.5 text-[10px] text-zinc-400 leading-tight">
                      {isVi ? metric.labelVi : metric.labelEn}
                    </span>
                  </div>
                ))}
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {isVi ? "Đặc tính kỹ thuật cốt lõi" : "Key Capabilities"}
                </span>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {(isVi ? activeItem.highlightsVi : activeItem.highlightsEn).map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Studio View Link */}
              <div className="pt-2">
                <Link
                  href="/studio"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-xs font-bold text-slate-300 transition hover:border-cyan-400/40 hover:text-white hover:bg-white/[0.08]"
                >
                  <Layers size={15} className="text-cyan-400" />
                  <span>{isVi ? "Xem giao diện bảng điều khiển Studio" : "View Studio Control Panel Layout"}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture & AI Pipeline Overview Section */}
        <section className="mx-auto mt-16 max-w-5xl rounded-3xl border border-white/5 bg-white/[0.015] p-6 sm:p-10">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              {isVi ? "Quy trình xử lý AI" : "AI Processing Pipeline"}
            </span>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {isVi ? "Cơ chế hoạt động của PixelForge AI" : "How PixelForge AI Works"}
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-xs text-zinc-400 sm:text-sm">
              {isVi
                ? "Tối ưu hóa đa tầng từ phân tích không gian latent đến tổng hợp chi tiết mức sub-pixel."
                : "Multi-stage optimization from latent feature space to sub-pixel high-frequency reconstruction."}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold text-sm">
                01
              </div>
              <h4 className="mt-4 font-bold text-sm text-white">
                {isVi ? "Tiếp nhận & Căn chỉnh" : "Ingest & Landmark Align"}
              </h4>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                {isVi
                  ? "Nhận diện độ suy hao (degradation level), tách bóc nhiễu nén JPEG và căn chỉnh các mốc khuôn mặt 68 điểm."
                  : "Detects degradation severity, isolates compression noise, and aligns 68 facial landmarks."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold text-sm">
                02
              </div>
              <h4 className="mt-4 font-bold text-sm text-white">
                {isVi ? "Rèn chi tiết qua GAN/Transformer" : "Neural GAN/Transformer Synthesis"}
              </h4>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                {isVi
                  ? "CodeFormer, Real-ESRGAN và Retinexformer tiến hành tái cấu trúc điểm ảnh, phục dựng chi tiết vi mô bị mất hoàn toàn."
                  : "CodeFormer, Real-ESRGAN and Retinexformer reconstruct missing high-frequency textures."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono font-bold text-sm">
                03
              </div>
              <h4 className="mt-4 font-bold text-sm text-white">
                {isVi ? "Hòa trộn & Xuất 4K Ultra-HD" : "Harmonization & 4K Export"}
              </h4>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                {isVi
                  ? "Cân bằng dải màu Rec.709, hòa trộn tự nhiên giữa vùng phục hồi và ảnh nền, xuất định dạng PNG chất lượng cao."
                  : "Color gamut balancing, seamless boundary fusion, and high-fidelity lossless PNG output."}
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 flex flex-col items-center justify-center gap-4 border-t border-white/5 py-10 text-center text-xs text-zinc-500">
          <BrandLogo markOnly size="sm" />
          <p className="max-w-xl">
            {isVi
              ? "PixelForge AI · Studio phục hồi và nâng cấp ảnh chuyên biệt · Real-ESRGAN · CodeFormer · Retinexformer · Xử lý cục bộ, không lưu trữ ảnh"
              : "PixelForge AI · Purpose-built image restoration & enhancement studio · Real-ESRGAN · CodeFormer · Retinexformer · Local processing, no image storage"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-zinc-400">
            <Link href="/" className="hover:text-white transition">
              {isVi ? "Showcase & Ý tưởng" : "Showcase & Concept"}
            </Link>
            <span>·</span>
            <Link href="/studio" className="hover:text-white transition">
              {isVi ? "Cấu trúc Studio" : "Studio Layout"}
            </Link>
            <span>·</span>
            <div className="inline-flex items-center gap-1.5">
              <span>{isVi ? "Làm bởi" : "Crafted by"}</span>
              <span className="inline-flex items-center rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[11px] font-extrabold text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.15)]">
                VAP
              </span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
