
"use client";

import { useState } from "react";

type Props = {
  before: string;
  after: string;
};

export default function ImageComparison({
  before,
  after,
}: Props) {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-900">
      <div className="relative w-full">
        <img
          src={before}
          alt="Original image"
          className="block h-auto w-full"
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: `inset(0 ${100 - position}% 0 0)`,
          }}
        >
          <img
            src={after}
            alt="Enhanced image"
            className="h-full w-full object-fill"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white"
          style={{
            left: `${position}%`,
          }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-zinc-900 text-white shadow-lg">
            ↔
          </div>
        </div>

        <span className="pointer-events-none absolute top-4 left-4 rounded-lg bg-black/70 px-3 py-1 text-sm">
          Enhanced
        </span>

        <span className="pointer-events-none absolute top-4 right-4 rounded-lg bg-black/70 px-3 py-1 text-sm">
          Original
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) =>
            setPosition(Number(event.target.value))
          }
          aria-label="Compare original and enhanced images"
          className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
    </div>
  );
}