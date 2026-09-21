import React from "react";

type LogoSize = "sm" | "md" | "lg";

interface BrandLogoProps {
  size?: LogoSize;
  showSubtitle?: boolean;
  markOnly?: boolean;
  className?: string;
}

export function BrandLogoMark({ size = "md", className = "" }: { size?: LogoSize; className?: string }) {
  const dimensions = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  }[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 group ${dimensions} ${className}`}>
      {/* Ambient background glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-blue-600/30 blur-xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 pointer-events-none" />

      {/* SVG Logomark */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-[0_8px_20px_rgba(0,102,255,0.35)] transition-transform duration-300 group-hover:scale-[1.03]"
      >
        <defs>
          {/* Obsidian Black Gradients */}
          <linearGradient id="pf-dark-base" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e2638" />
            <stop offset="40%" stopColor="#0d111c" />
            <stop offset="100%" stopColor="#04060a" />
          </linearGradient>

          <linearGradient id="pf-dark-facet" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2a354d" />
            <stop offset="50%" stopColor="#131926" />
            <stop offset="100%" stopColor="#080b12" />
          </linearGradient>

          {/* Electric / Neon Blue Gradients */}
          <linearGradient id="pf-blue-core" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="30%" stopColor="#0080ff" />
            <stop offset="80%" stopColor="#004cd6" />
            <stop offset="100%" stopColor="#002b80" />
          </linearGradient>

          <linearGradient id="pf-cyan-glow" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="45%" stopColor="#00d2ff" />
            <stop offset="100%" stopColor="#0055ff" />
          </linearGradient>

          <linearGradient id="pf-metal-rim" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.7" />
          </linearGradient>

          <filter id="pf-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Dark Obsidian Hex-Shield Base */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="24"
          fill="url(#pf-dark-base)"
          stroke="#1e293b"
          strokeWidth="1.5"
        />

        {/* Rim lighting border */}
        <rect
          x="5.5"
          y="5.5"
          width="89"
          height="89"
          rx="22.5"
          fill="none"
          stroke="url(#pf-metal-rim)"
          strokeWidth="1"
          strokeOpacity="0.6"
        />

        {/* --- GEOMETRIC MONOGRAM: P & F FORGE --- */}
        {/* 'P' Pillar & Upper Facet (Deep titanium with blue edge) */}
        {/* Left vertical stem of P */}
        <path
          d="M 22 24 L 37 24 L 37 76 L 22 76 Z"
          fill="url(#pf-dark-facet)"
          stroke="#0080ff"
          strokeWidth="1"
          strokeOpacity="0.7"
        />

        {/* Left Stem Specular Accent Line */}
        <line
          x1="24"
          y1="26"
          x2="24"
          y2="74"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />

        {/* 'P' Loop Outer Structure */}
        <path
          d="M 37 24 L 58 24 C 67 24 73 30 73 38 C 73 46 67 52 58 52 L 37 52 Z"
          fill="url(#pf-dark-facet)"
          stroke="url(#pf-blue-core)"
          strokeWidth="1.5"
        />

        {/* 'P' Loop Inner Cutout (Void with glowing core) */}
        <path
          d="M 37 34 L 54 34 C 57 34 60 36 60 38 C 60 40 57 42 54 42 L 37 42 Z"
          fill="#060913"
          stroke="#00d2ff"
          strokeWidth="1.2"
        />

        {/* 'F' Dynamic Forge Blades / Wings (Cyan & Electric Blue) */}
        {/* Upper F Horizon Blade */}
        <path
          d="M 52 24 L 78 24 L 70 34 L 48 34 Z"
          fill="url(#pf-cyan-glow)"
          filter="url(#pf-neon-glow)"
          opacity="0.95"
        />

        {/* Middle F Forge Wing / Diagonal Cut */}
        <path
          d="M 46 44 L 75 44 L 66 54 L 40 54 Z"
          fill="url(#pf-blue-core)"
          stroke="#38bdf8"
          strokeWidth="1"
        />

        {/* Lower F Speed Fin / Precision Pixel Anvil */}
        <path
          d="M 44 60 L 68 60 L 59 70 L 40 70 Z"
          fill="url(#pf-cyan-glow)"
          opacity="0.9"
        />

        {/* Precision Pixel Node in Bottom-Right (Symbolizing AI Forge synthesis) */}
        <rect
          x="72"
          y="62"
          width="8"
          height="8"
          rx="2"
          fill="#38bdf8"
          className="animate-pulse"
          stroke="#ffffff"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}

export default function BrandLogo({
  size = "md",
  showSubtitle = true,
  markOnly = false,
  className = "",
}: BrandLogoProps) {
  const textSizes = {
    sm: "text-base tracking-tight",
    md: "text-lg tracking-tight",
    lg: "text-2xl tracking-tight",
  }[size];

  const subSizes = {
    sm: "text-[8px] tracking-[0.22em]",
    md: "text-[9px] tracking-[0.24em]",
    lg: "text-[11px] tracking-[0.26em]",
  }[size];

  if (markOnly) {
    return <BrandLogoMark size={size} className={className} />;
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <BrandLogoMark size={size} />

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          {/* 'Pixel' in sharp modern silver/white */}
          <span className={`font-black font-sans text-slate-100 ${textSizes}`}>
            PIXEL
          </span>

          {/* 'FORGE' in electric blue gradient */}
          <span
            className={`font-black font-sans bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(56,189,248,0.4)] ${textSizes}`}
          >
            FORGE
          </span>

          {/* Micro Cyber AI badge */}
          <span className="ml-1 inline-flex items-center justify-center rounded-md border border-cyan-400/40 bg-gradient-to-b from-blue-950/80 to-black/90 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.25)]">
            AI
          </span>
        </div>

        {showSubtitle && (
          <p className={`mt-1 font-semibold uppercase text-slate-400/80 ${subSizes}`}>
            IMAGE INTELLIGENCE STUDIO
          </p>
        )}
      </div>
    </div>
  );
}
