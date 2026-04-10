import { apiFetch } from "../http";
import type { ApiPoi } from "./poi";

export type MerchantPoi = ApiPoi & { id: string };

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type MerchantProfile = {
  id?: string;
  business_name?: string;
  email?: string;
  subscription_status?: string;
};

export type MerchantPromotion = {
  id?: string;
  poi_id?: string;
  title?: string;
  discount_type?: "PERCENTAGE" | "FIXED";
  discount_value?: number;
  max_usage?: number;
  start_time?: string;
  end_time?: string;
  status?: string;
};

export type MerchantContentPayload = {
  language_code?: string;
  language?: string;
  source_lang?: string;
  title?: string;
  description?: string;
  text?: string;
  voice?: string;
  audio_url?: string;
  audioUrl?: string;
};

export type TtsVoice = {
  id?: string;
  name?: string;
  locale?: string;
  gender?: string;
};

export type TtsCredits = {
  remaining?: number;
  total?: number;
};

type ListResponse<T> = { data?: T };

export async function getMerchantProfile(): Promise<MerchantProfile> {
  const res = await apiFetch<ListResponse<MerchantProfile> | MerchantProfile>("/merchants/profile");
  return (res as ListResponse<MerchantProfile>).data ?? (res as MerchantProfile);
}

export async function updateMerchantProfile(payload: Json) {
  return apiFetch("/merchants/profile", {
    method: "PUT",
    json: payload,
  });
}

export async function createMerchantPoi(payload: Json) {
  return apiFetch("/merchants/pois", {
    method: "POST",
    json: payload,
  });
}

export async function getMerchantPois(): Promise<MerchantPoi[]> {
  const res = await apiFetch<ListResponse<MerchantPoi[]> | MerchantPoi[]>("/merchants/pois");
  return (res as ListResponse<MerchantPoi[]>).data ?? (res as MerchantPoi[]);
}

export async function getMerchantPoiById(poiId: string): Promise<MerchantPoi> {
  const res = await apiFetch<ListResponse<MerchantPoi> | MerchantPoi>(
    `/merchants/pois/${encodeURIComponent(poiId)}`
  );
  return (res as ListResponse<MerchantPoi>).data ?? (res as MerchantPoi);
}

export async function updateMerchantPoi(poiId: string, payload: Json) {
  return apiFetch(`/merchants/pois/${encodeURIComponent(poiId)}`, {
    method: "PUT",
    json: payload,
  });
}

export async function deleteMerchantPoi(poiId: string) {
  return apiFetch(`/merchants/pois/${encodeURIComponent(poiId)}`, {
    method: "DELETE",
  });
}

export async function getMerchantPromotions(): Promise<MerchantPromotion[]> {
  const res = await apiFetch<ListResponse<MerchantPromotion[]> | MerchantPromotion[]>("/promotions");
  return (res as ListResponse<MerchantPromotion[]>).data ?? (res as MerchantPromotion[]);
}

export async function createMerchantPromotion(payload: Json) {
  return apiFetch("/promotions", {
    method: "POST",
    json: payload,
  });
}

export async function updatePromotion(promotionId: string, payload: Json) {
  return apiFetch(`/promotions/${encodeURIComponent(promotionId)}`, {
    method: "PUT",
    json: payload,
  });
}

export async function deletePromotion(promotionId: string) {
  return apiFetch(`/promotions/${encodeURIComponent(promotionId)}`, {
    method: "DELETE",
  });
}

export async function updatePoiContent(poiId: string, payload: MerchantContentPayload) {
  return apiFetch(`/pois/${encodeURIComponent(poiId)}/contents`, {
    method: "POST",
    json: payload,
  });
}

export async function updatePoiContentByLanguage(
  poiId: string,
  languageCode: string,
  payload: MerchantContentPayload
) {
  return apiFetch(`/pois/${encodeURIComponent(poiId)}/contents/${encodeURIComponent(languageCode)}`, {
    method: "PUT",
    json: payload,
  });
}

export async function generatePoiAudio(poiId: string, languageCode: string) {
  return apiFetch(
    `/pois/${encodeURIComponent(poiId)}/contents/${encodeURIComponent(languageCode)}/generate-audio`,
    { method: "POST" }
  );
}

export async function translateAndCreatePoiContent(poiId: string, payload: MerchantContentPayload) {
  return apiFetch(`/pois/${encodeURIComponent(poiId)}/translate-and-create`, {
    method: "POST",
    json: payload,
  });
}

export async function getTtsCredits(): Promise<TtsCredits> {
  const res = await apiFetch<ListResponse<TtsCredits> | TtsCredits>("/pois/tts/credits");
  return (res as ListResponse<TtsCredits>).data ?? (res as TtsCredits);
}

export async function getTtsVoices(): Promise<TtsVoice[]> {
  const res = await apiFetch<ListResponse<TtsVoice[]> | TtsVoice[]>("/pois/tts/voices");
  return (res as ListResponse<TtsVoice[]>).data ?? (res as TtsVoice[]);
}
