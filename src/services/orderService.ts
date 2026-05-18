import axiosPickleball from "../api/axiosPickleball";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

export interface CreateOrderPayload {
  userId: string;
  items: {
    productId: string;
    qty: number;
    price: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: "COD" | "VNPay" | "Momo" | "BankTransfer";
  total: number;
}

export interface CreateOrderFromCartPayload {
  userId: string;
  shippingAddress: ShippingAddress;
  paymentMethod: "COD" | "VNPay" | "Momo" | "BankTransfer";
}

export interface Order {
  _id: string;
  userId: string;
  items: {
    productId: {
      _id: string;
      name: string;
      image: string[];
      price: number;
    };
    qty: number;
    price: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  total: number;
  status: "Pending" | "Confirmed" | "Shipping" | "Completed" | "Cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  status: string;
  message: string;
  data: Order;
}

export interface OrderListResponse {
  status: string;
  data: Order[];
}

const orderService = {
  // Tao don hang tu gio hang
  createOrderFromCart: async (
    payload: CreateOrderFromCartPayload
  ): Promise<OrderResponse> => {
    const response = await axiosPickleball.post(
      "/api/orders/from-cart",
      payload
    );
    return response as unknown as OrderResponse;
  },

  // Tao don hang truc tiep
  createOrder: async (
    payload: CreateOrderPayload
  ): Promise<OrderResponse> => {
    const response = await axiosPickleball.post("/api/orders", payload);
    return response as unknown as OrderResponse;
  },

  // Lay don hang cua user hien tai
  getMyOrders: async (): Promise<OrderListResponse> => {
    const response = await axiosPickleball.get("/api/orders/my-orders");
    return response as unknown as OrderListResponse;
  },

  // Lay chi tiet don hang theo ID
  getOrderById: async (id: string): Promise<OrderResponse> => {
    const response = await axiosPickleball.get(`/api/orders/${id}`);
    return response as unknown as OrderResponse;
  },
};

export default orderService;
