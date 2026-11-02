import axiosPickleball from "../api/axiosPickleball";

interface CreatePaymentResponse {
  status: string;
  paymentUrl: string;
  orderUrl?: string;
  message?: string;
}

const paymentService = {
  createZaloPayUrl: async (orderId: string): Promise<CreatePaymentResponse> => {
    const response = await axiosPickleball.post(
      "/api/payments/zalopay/create-payment-url",
      { orderId }
    );

    return response as unknown as CreatePaymentResponse;
  },
};

export default paymentService;
