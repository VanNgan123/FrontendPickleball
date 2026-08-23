import axiosPickleball from "../api/axiosPickleball";

export interface Notification {
  _id: string;
  userId: string;
  type: "order_status" | "new_order" | "coupon";
  title: string;
  message: string;
  orderId?: string | null;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  status: string;
  notifications: Notification[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  status: string;
  count: number;
}

export interface NotificationParams {
  page?: number;
  limit?: number;
}

const notificationService = {
  getNotifications: async (
    params: NotificationParams = {}
  ): Promise<NotificationListResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await axiosPickleball.get(`/api/notifications${qs}`);
    return res as unknown as NotificationListResponse;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const res = await axiosPickleball.get("/api/notifications/unread-count");
    return res as unknown as UnreadCountResponse;
  },

  markAsRead: async (id: string): Promise<{ status: string }> => {
    const res = await axiosPickleball.put(`/api/notifications/${id}/read`);
    return res as unknown as { status: string };
  },

  markAllAsRead: async (): Promise<{ status: string; updatedCount: number }> => {
    const res = await axiosPickleball.put("/api/notifications/read-all");
    return res as unknown as { status: string; updatedCount: number };
  },
};

export default notificationService;
