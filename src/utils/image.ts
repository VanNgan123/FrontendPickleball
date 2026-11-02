import type { SyntheticEvent } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const PRODUCT_PLACEHOLDER = "/product-placeholder.svg";

export const resolveImageUrl = (imagePath?: string | null) => {
  if (!imagePath) return PRODUCT_PLACEHOLDER;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  const baseUrl = API_URL.replace(/\/+$/, "");
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path.replace(/\\/g, "/")}`;
};

export const useImageFallback = (
  event: SyntheticEvent<HTMLImageElement>
) => {
  const image = event.currentTarget;
  if (image.src.endsWith(PRODUCT_PLACEHOLDER)) return;
  image.onerror = null;
  image.src = PRODUCT_PLACEHOLDER;
};
