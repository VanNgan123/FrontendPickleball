import axiosPickleball from "../api/axiosPickleball";

interface CreateVNPayResponse {
  status: string;
  paymentUrl: string;
  message?: string;
}

const paymentService = {
  createVNPayUrl: async (orderId: string): Promise<CreateVNPayResponse> => {
    const response = await axiosPickleball.post(
      "/api/payments/vnpay/create-payment-url",
      { orderId }
    );

    return response as unknown as CreateVNPayResponse;
  },
};

export default paymentService;
