import axios from "axios";
import type { AxiosError } from "axios";
import axiosPickleball from "../api/axiosPickleball";

const agentApiUrl =
  import.meta.env.VITE_AGENT_API_URL ?? "http://localhost:8001";

const agentApi = axios.create({
  baseURL: agentApiUrl,
  timeout: 120000,
  withCredentials: true,
});

agentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAgentAuthToken = () => localStorage.getItem("accessToken") ?? "";

export interface AgentProductCard {
  product_id: string;
  name: string;
  price: number;
  sale_price?: number | null;
  stock: number;
  brand?: string;
  image?: string | null;
  description?: string;
  categories?: unknown[];
  specs?: Record<string, unknown>;
}

export interface AgentConfirmation {
  required: boolean;
  tool_name: string;
  title: string;
  message: string;
  args: Record<string, unknown>;
  confirm_label: string;
  cancel_label: string;
}

export interface AgentMetadata {
  order_ids?: string[];
  payment_url?: string;
  total_ms?: number;
  first_token_ms?: number | null;
  tool_calls?: string[];
  checkout_form?: {
    product_id: string;
    quantity: number;
  };
}

export interface AgentCheckoutPreviewPayload {
  session_id: string;
  shipping_address: {
    fullName: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    city: string;
  };
  payment_method: "COD" | "ZaloPay";
  coupon_code?: string;
  product_id?: string;
  quantity?: number;
}

export interface AgentChatResponse {
  answer: string;
  session_id: string;
  products?: AgentProductCard[];
  confirmation?: AgentConfirmation;
  metadata?: AgentMetadata;
}

export interface AgentChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatbotPublicConfig {
  enabled: boolean;
  mode: "ai" | "staff" | "offline";
  offlineMessage: string;
  staffReplyMessage: string;
}

export const getChatbotPublicConfig = async (): Promise<ChatbotPublicConfig> => {
  const response = (await axiosPickleball.get(
    "/api/chatbot/public-config"
  )) as { data?: ChatbotPublicConfig };

  return response.data ?? {
    enabled: true,
    mode: "ai",
    offlineMessage: "Hiện chatbot đang tạm ngưng. Nhân viên hỗ trợ sẽ phản hồi bạn sớm nhất.",
    staffReplyMessage: "Live chat với nhân viên chưa khả dụng. Vui lòng mở Trung tâm trợ giúp để chọn kênh liên hệ phù hợp.",
  };
};

export const sendAgentMessage = async (
  payload: AgentChatRequest
): Promise<AgentChatResponse> => {
  const response = await agentApi.post<AgentChatResponse>(
    "/agent/chat",
    payload
  );
  return response.data;
};

export interface AgentStreamHandlers {
  onSession?: (sessionId: string) => void;
  onStatus?: (message: string, tool?: string) => void;
  onToken?: (text: string) => void;
}

export const sendAgentMessageStream = async (
  payload: AgentChatRequest,
  handlers: AgentStreamHandlers,
  signal?: AbortSignal
): Promise<AgentChatResponse> => {
  const token = getAgentAuthToken();
  const response = await fetch(`${agentApiUrl.replace(/\/+$/, "")}/agent/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok || !response.body) {
    let message = "Không thể kết nối với trợ lý.";
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) message = body.detail;
    } catch {
      // Keep the safe fallback message.
    }
    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: AgentChatResponse | null = null;

  const processBlock = (block: string) => {
    const data = block
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (!data) return;

    const event = JSON.parse(data) as {
      type: string;
      session_id?: string;
      message?: string;
      text?: string;
      tool?: string;
      payload?: AgentChatResponse;
    };

    if (event.type === "session" && event.session_id) {
      handlers.onSession?.(event.session_id);
    }
    if (event.type === "status" && event.message) {
      handlers.onStatus?.(event.message, event.tool);
    }
    if (event.type === "token" && event.text) {
      handlers.onToken?.(event.text);
    }
    if (event.type === "result" && event.payload) {
      finalResult = event.payload;
    }
    if (event.type === "error") {
      throw new Error(event.message || "Trợ lý không thể xử lý yêu cầu.");
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    blocks.forEach(processBlock);
    if (done) break;
  }
  if (buffer.trim()) processBlock(buffer);
  if (!finalResult) throw new Error("Luồng phản hồi kết thúc trước khi có kết quả.");
  return finalResult;
};

export const clearAgentSession = async (sessionId: string): Promise<void> => {
  await agentApi.post("/agent/clear", { session_id: sessionId });
};

export const previewAgentCheckout = async (
  payload: AgentCheckoutPreviewPayload
): Promise<AgentChatResponse> => {
  const response = await agentApi.post<AgentChatResponse>(
    "/agent/checkout/preview",
    payload
  );
  return response.data;
};

export const getAgentErrorMessage = (error: unknown) => {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Đã dừng tạo câu trả lời.";
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (!axios.isAxiosError(error)) {
    return "Không thể kết nối với trợ lý. Vui lòng thử lại sau.";
  }

  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
  const detail = axiosError.response?.data?.detail;
  const message = axiosError.response?.data?.message;

  if (typeof detail === "string" && detail.trim()) return detail;
  if (typeof message === "string" && message.trim()) return message;

  if (
    axiosError.code === "ECONNABORTED" ||
    axiosError.response?.status === 504 ||
    axiosError.code === "ERR_BAD_RESPONSE"
  ) {
    return "Trợ lý đang xử lý chậm hơn bình thường do AI cần thời gian trả lời. Bạn vui lòng thử lại sau vài giây hoặc hỏi lại theo cách ngắn hơn.";
  }

  return "Không thể kết nối với trợ lý. Vui lòng thử lại sau.";
};
