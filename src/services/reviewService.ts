import axiosPickleball from "../api/axiosPickleball";

interface CreateReviewPayload {
  productId: string;
  rating: number;
  comment: string;
}

const reviewService = {
  createReview: async (payload: CreateReviewPayload) => {
    const response = await axiosPickleball.post("/api/reviews", payload);
    return response as unknown as { status: string; message: string; data: unknown };
  },
};

export default reviewService;
