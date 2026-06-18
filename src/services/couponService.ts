import axiosPickleball from "../api/axiosPickleball";

export interface ValidateCouponPayload {
  code: string;
  orderAmount: number;
  productIds?: string[];
  categoryIds?: string[];
}

export interface CouponResult {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount: number;
}

export interface CalculateDiscountResult {
  couponCode: string;
  discountAmount: number;
  finalAmount: number;
  originalAmount: number;
}

const couponService = {
  validateCoupon: async (
    payload: ValidateCouponPayload
  ): Promise<CouponResult> => {
    const response = await axiosPickleball.post(
      "/api/coupons/validate",
      payload
    );
    return (response as { data: CouponResult }).data;
  },

  calculateDiscount: async (
    code: string,
    orderAmount: number,
    productIds?: string[],
    categoryIds?: string[]
  ): Promise<CalculateDiscountResult> => {
    const response = await axiosPickleball.post(
      "/api/coupons/calculate-discount",
      {
        code,
        orderAmount,
        productIds,
        categoryIds,
      }
    );
    return (response as { data: CalculateDiscountResult }).data;
  },
};

export default couponService;
