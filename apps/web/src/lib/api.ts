
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

export type UpscaleScale = 2 | 4;
export type ModelType = "general" | "anime";
export type FaceRestorer = "codeformer" | "gfpgan";

export interface EnhanceOptions {
  scale?: UpscaleScale;
  faceEnhance?: boolean;
  faceRestorer?: FaceRestorer;
  fidelity?: number;
  lowLightEnhance?: boolean;
  lowLightStrength?: number;
  freshnessEnhance?: boolean;
  freshnessStrength?: number;
  modelType?: ModelType;
  strength?: number;
  signal?: AbortSignal;
}

export async function enhanceImage(
  file: File,
  options: EnhanceOptions = {}
): Promise<Blob> {
  const {
    scale = 4,
    faceEnhance = false,
    faceRestorer = "codeformer",
    fidelity = 0.5,
    lowLightEnhance = false,
    lowLightStrength = 0.6,
    freshnessEnhance = false,
    freshnessStrength = 0.55,
    modelType = "general",
    strength = 1.0,
    signal,
  } = options;

  const formData = new FormData();
  formData.append("file", file);

  const queryParams = new URLSearchParams({
    scale: scale.toString(),
    face_enhance: faceEnhance.toString(),
    face_restorer: faceRestorer,
    fidelity: fidelity.toString(),
    low_light_enhance: lowLightEnhance.toString(),
    low_light_strength: lowLightStrength.toString(),
    freshness_enhance: freshnessEnhance.toString(),
    freshness_strength: freshnessStrength.toString(),
    model_type: modelType,
    strength: strength.toString(),
  });

  const response = await fetch(
    `${API_URL}/api/v1/enhance?${queryParams.toString()}`,
    {
      method: "POST",
      body: formData,
      signal,
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => null);

    throw new Error(
      error?.detail ??
        `Enhancement failed (${response.status})`
    );
  }

  return response.blob();
}
