// src/lib/comfy.ts
import { env } from "./env";

export type ComfyJobRequest = {
  prompt: string;
  width: number;
  height: number;
  steps?: number;
  cfgScale?: number;
  seed?: number | null;
  negativePrompt?: string | null;
  webhookUrl?: string | null;
};

export type ComfyJobResult = {
  imageUrl: string;     // URL final (pode ser do seu storage)
  metadata?: Record<string, any>;
};

async function fetchWithTimeout(url: string, options: RequestInit, ms = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function submitComfyJob(payload: ComfyJobRequest): Promise<ComfyJobResult> {
  const res = await fetchWithTimeout(`${env.server.COMFYUI_API_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Secret": env.server.COMFYUI_WEBHOOK_SECRET,
    },
    body: JSON.stringify(payload),
  }, 45000);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ComfyUI error ${res.status}: ${body}`);
  }

  const data = await res.json();
  // Estruture conforme sua API do ComfyUI retorna
  return {
    imageUrl: data.imageUrl ?? "",
    metadata: data.metadata ?? {},
  };
}
