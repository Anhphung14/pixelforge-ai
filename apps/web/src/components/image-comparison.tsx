"use client";

import { useEffect, useState } from "react";
import { ChevronsLeftRight } from "lucide-react";

type Props = {
  before: string;
  after: string;
  language: "vi" | "en";
  fallbackBefore?: string;
  fallbackAfter?: string;
};

export default function ImageComparison({
  before,
  after,
  language,
  fallbackBefore,
  fallbackAfter,
}: Props) {
  const [position, setPosition] = useState(50);
  const [currentBefore, setCurrentBefore] = useState(before);
  const [currentAfter, setCurrentAfter] = useState(after);
  const isVi = language === "vi";

  useEffect(() => {
    setCurrentBefore(before);
  }, [before]);

  useEffect(() => {
    setCurrentAfter(after);
  }, [after]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#050507]">
      <div className="relative w-full">
        {/* Blob URLs are local previews and should bypass the Next image optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentBefore}
          alt={isVi ? "Ảnh gốc" : "Original image"}
          onError={() => {
            if (fallbackBefore && currentBefore !== fallbackBefore) {
              setCurrentBefore(fallbackBefore);
            }
          }}
          className="block max-h-[650px] w-full object-contain"
        />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentAfter}
            alt={isVi ? "Ảnh đã nâng cấp" : "Enhanced image"}
            onError={() => {
              if (fallbackAfter && currentAfter !== fallbackAfter) {
                setCurrentAfter(fallbackAfter);
              }
            }}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white/90 shadow-[0_0_16px_rgba(255,255,255,.6)]" style={{ left: `${position}%` }}>
          <div className="absolute top-1/2 left-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-zinc-950/90 shadow-xl backdrop-blur">
            <ChevronsLeftRight size={19} />
          </div>
        </div>
        <span className="comparison-label left-4">{isVi ? "Đã nâng cấp" : "Enhanced"}</span>
        <span className="comparison-label right-4">{isVi ? "Ảnh gốc" : "Original"}</span>
        <input type="range" min={0} max={100} value={position} onChange={(event) => setPosition(Number(event.target.value))} aria-label={isVi ? "So sánh ảnh gốc và ảnh đã nâng cấp" : "Compare original and enhanced images"} className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0" />
      </div>
    </div>
  );
}
