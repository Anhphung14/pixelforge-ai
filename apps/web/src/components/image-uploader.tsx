"use client";

import { useRef, useState } from "react";
import { ArrowUp, ImagePlus, ShieldCheck } from "lucide-react";

type Props = { onFileSelect: (file: File) => void; disabled?: boolean; language: "vi" | "en" };

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export default function ImageUploader({ onFileSelect, disabled = false, language }: Props) {
  const isVi = language === "vi";
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function validateFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) return setError(isVi ? "Vui lòng chọn ảnh JPG, PNG hoặc WebP." : "Please choose a JPG, PNG or WebP image.");
    if (file.size > MAX_SIZE) return setError(isVi ? "Ảnh vượt quá giới hạn 10 MB." : "The image exceeds the 10 MB limit.");
    setError("");
    onFileSelect(file);
  }

  function openPicker() {
    if (!disabled) inputRef.current?.click();
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled && event.dataTransfer.files[0]) validateFile(event.dataTransfer.files[0]);
        }}
        className={`upload-zone ${dragging ? "upload-zone-active" : ""}`}
      >
        <div className="upload-grid" />
        <div className="relative">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-blue-400/30 bg-blue-400/10 text-blue-300 shadow-2xl shadow-blue-500/20">
            <ImagePlus size={28} />
          </span>
          <h2 className="mt-6 text-xl font-bold tracking-[-0.025em] sm:text-2xl">{isVi ? "Thả một bức ảnh vào đây" : "Drop an image here"}</h2>
          <p className="mt-2 text-sm text-zinc-500">{isVi ? "hoặc chọn ảnh từ thiết bị để bắt đầu" : "or choose one from your device to begin"}</p>
          <button type="button" disabled={disabled} onClick={(event) => { event.stopPropagation(); openPicker(); }} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-400 disabled:opacity-50">
            <ArrowUp size={16} /> {isVi ? "Chọn ảnh" : "Choose image"}
          </button>
          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-zinc-600"><ShieldCheck size={14} /> {isVi ? "Ảnh chỉ được gửi tới AI chạy trên máy của bạn" : "Your image stays with the AI running on your device"}</div>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} className="sr-only" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) validateFile(selected); event.target.value = ""; }} />
      {error && <p role="alert" className="mt-3 text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}
