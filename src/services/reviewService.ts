import axiosPickleball from "../api/axiosPickleball";
import type { ProductRatingSummary, ProductReview } from "../types";

interface CreateReviewPayload {
  productId: string;
  rating: number;
  comment: string;
  images?: File[];
}

const reviewService = {
  createReview: async (payload: CreateReviewPayload) => {
    const formData = new FormData();
    formData.append("productId", payload.productId);
    formData.append("rating", String(payload.rating));
    formData.append("comment", payload.comment);
    payload.images?.forEach((image) => formData.append("images", image));

    return axiosPickleball.post("/api/reviews", formData) as unknown as Promise<{
      status: string;
      message: string;
      data: ProductReview;
    }>;
  },

  getProductReviews: async (productId: string) =>
    axiosPickleball.get(`/api/reviews/product/${productId}`) as unknown as Promise<{
      status: string;
      data: ProductReview[];
    }>,

  getProductRating: async (productId: string) =>
    axiosPickleball.get(`/api/reviews/rating/${productId}`) as unknown as Promise<{
      status: string;
      data: ProductRatingSummary;
    }>,
};

export default reviewService;
