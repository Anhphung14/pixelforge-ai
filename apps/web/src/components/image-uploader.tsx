
"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

type Props = {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
};

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_SIZE = 10 * 1024 * 1024;

export default function ImageUploader({
  onFileSelect,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function validateFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG and WebP are supported.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Maximum file size is 10 MB.");
      return;
    }

    setError("");
    onFileSelect(file);
  }

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);

          if (disabled) return;

          const file = event.dataTransfer.files[0];

          if (file) validateFile(file);
        }}
        className={`
          rounded-2xl border-2 border-dashed
          p-10 text-center transition
          ${
            dragging
              ? "border-violet-400 bg-violet-500/10"
              : "border-zinc-700 bg-zinc-900"
          }
        `}
      >
        <UploadCloud
          size={40}
          className="mx-auto mb-4 text-violet-400"
        />

        <h3 className="text-lg font-semibold">
          Upload your image
        </h3>

        <p className="mt-2 text-sm text-zinc-400">
          Drag and drop an image here
        </p>

        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-xl bg-violet-600 px-6 py-3 font-medium text-white hover:bg-violet-500 disabled:opacity-50"
        >
          Choose Image
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) validateFile(file);

            event.target.value = "";
          }}
        />

        <p className="mt-4 text-xs text-zinc-500">
          JPG, PNG, WebP · Maximum 10 MB
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}