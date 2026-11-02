export const BRAND_NAME = "Pickleball Bạch Đằng";
export const BRAND_SHORT_NAME = "Bạch Đằng Pickleball";

export const FREE_SHIPPING_THRESHOLD = 2_000_000;
export const STANDARD_SHIPPING_FEE = 30_000;
export const RETURN_WINDOW_DAYS = 7;

export const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE?.trim() || "";
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL?.trim() || "";
export const ZALO_URL = import.meta.env.VITE_ZALO_URL?.trim() || "";
export const FACEBOOK_URL = import.meta.env.VITE_FACEBOOK_URL?.trim() || "";
export const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL?.trim() || "";
export const YOUTUBE_URL = import.meta.env.VITE_YOUTUBE_URL?.trim() || "";

export const formatCurrency = (value: number) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

export const calculateShippingFee = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? STANDARD_SHIPPING_FEE : 0;
