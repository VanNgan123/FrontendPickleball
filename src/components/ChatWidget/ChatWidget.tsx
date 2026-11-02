import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  clearAgentSession,
  getAgentAuthToken,
  getAgentErrorMessage,
  getChatbotPublicConfig,
  previewAgentCheckout,
  sendAgentMessageStream,
  type AgentChatRequest,
  type AgentConfirmation,
  type AgentMetadata,
  type AgentProductCard,
  type ChatbotPublicConfig,
} from "../../services/agentService";
import type { RootState } from "../../store/store";
import CheckoutForm, { type CheckoutFormValue } from "./CheckoutForm";
import {
  AGENT_SESSION_AUTH_STORAGE_KEY,
  AGENT_SESSION_STORAGE_KEY,
  CHAT_STORAGE_CLEARED_EVENT,
  CHAT_MESSAGES_STORAGE_KEY,
  CHAT_OPEN_STORAGE_KEY,
  CHAT_OPEN_REQUESTED_EVENT,
} from "../../utils/chatStorage";
import { useImageFallback } from "../../utils/image";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: AgentProductCard[];
  confirmation?: AgentConfirmation;
  metadata?: AgentMetadata;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")}đ`;

const resolveImageUrl = (image?: string | null) => {
  if (!image) return "/product-placeholder.svg";
  if (image.startsWith("http")) return image;
  const baseUrl = API_URL.replace(/\/+$/, "");
  const path = image.startsWith("/") ? image : `/${image}`;
  return `${baseUrl}${path.replace(/\\/g, "/")}`;
};

const createWelcomeMessage = (content?: string): ChatMessage => ({
  id: `welcome-${Date.now()}`,
  role: "assistant",
  content:
    content ??
    "Xin chào! Mình có thể tư vấn sản phẩm, kiểm tra giỏ hàng, đơn hàng, coupon và phí vận chuyển. Bạn muốn tìm sản phẩm nào?",
});

const QUICK_PROMPTS = [
  "Tư vấn vợt cho người mới",
  "Tìm vợt dưới 2 triệu",
  "Kiểm tra giỏ hàng",
  "Xem đơn hàng của tôi",
];

const loadStoredMessages = () => {
  try {
    const rawMessages = sessionStorage.getItem(CHAT_MESSAGES_STORAGE_KEY);
    if (!rawMessages) return [createWelcomeMessage()];

    const parsedMessages = JSON.parse(rawMessages);
    if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) {
      return [createWelcomeMessage()];
    }

    const validMessages = parsedMessages.filter(
      (item): item is ChatMessage =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
    );

    return validMessages.length > 0
      ? validMessages.slice(-60)
      : [createWelcomeMessage()];
  } catch {
    return [createWelcomeMessage()];
  }
};

const ChatWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFocusedFlow = ["/login", "/signup", "/checkout"].some((path) =>
    location.pathname.startsWith(path)
  );
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [open, setOpen] = useState(
    () => sessionStorage.getItem(CHAT_OPEN_STORAGE_KEY) === "true"
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamStatus, setStreamStatus] = useState("");
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotPublicConfig>({
    enabled: true,
    mode: "ai",
    offlineMessage: "Hiện chatbot đang tạm ngưng. Nhân viên hỗ trợ sẽ phản hồi bạn sớm nhất.",
    staffReplyMessage: "Live chat với nhân viên chưa khả dụng. Vui lòng mở Trung tâm trợ giúp để chọn kênh liên hệ phù hợp.",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sessionId, setSessionId] = useState(() =>
    sessionStorage.getItem(AGENT_SESSION_STORAGE_KEY) ?? ""
  );
  const [messages, setMessages] = useState<ChatMessage[]>(loadStoredMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchChatbotConfig = async () => {
      try {
        const config = await getChatbotPublicConfig();
        setChatbotConfig(config);
        if (!config.enabled || config.mode === "offline") {
          setMessages((current) => {
            const hasSystemOfflineBanner = current.some(
              (item) => item.role === "assistant" && item.content === config.offlineMessage
            );
            if (hasSystemOfflineBanner) return current;
            return [
              ...current,
              {
                id: `${Date.now()}-offline`,
                role: "assistant",
                content: config.offlineMessage,
              },
            ];
          });
        }
      } catch {
        setChatbotConfig({
          enabled: true,
          mode: "ai",
          offlineMessage: "Hiện chatbot đang tạm ngưng. Nhân viên hỗ trợ sẽ phản hồi bạn sớm nhất.",
          staffReplyMessage: "Live chat với nhân viên chưa khả dụng. Vui lòng mở Trung tâm trợ giúp để chọn kênh liên hệ phù hợp.",
        });
      }
    };

    void fetchChatbotConfig();
  }, []);

  useEffect(() => {
    const handleOpenRequested = () => setOpen(true);
    window.addEventListener(CHAT_OPEN_REQUESTED_EVENT, handleOpenRequested);
    return () => window.removeEventListener(CHAT_OPEN_REQUESTED_EVENT, handleOpenRequested);
  }, []);

  useEffect(() => {
    sessionStorage.setItem(CHAT_OPEN_STORAGE_KEY, String(open));
  }, [open]);

  useEffect(() => {
    if (isFocusedFlow) setOpen(false);
  }, [isFocusedFlow]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    sessionStorage.setItem(CHAT_MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const handleChatStorageCleared = () => {
      setOpen(false);
      setSessionId("");
      setMessage("");
      setError("");
      setNotice("");
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      setStreamStatus("");
      setMessages([createWelcomeMessage()]);
    };

    window.addEventListener(CHAT_STORAGE_CLEARED_EVENT, handleChatStorageCleared);
    return () => {
      window.removeEventListener(
        CHAT_STORAGE_CLEARED_EVENT,
        handleChatStorageCleared
      );
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    []
  );

  const getActiveSessionPayload = () => {
    const currentAuthToken = getAgentAuthToken();
    const sessionAuthToken =
      sessionStorage.getItem(AGENT_SESSION_AUTH_STORAGE_KEY) ?? "";

    if (sessionId && currentAuthToken !== sessionAuthToken) {
      sessionStorage.removeItem(AGENT_SESSION_STORAGE_KEY);
      setSessionId("");
      return {};
    }

    return sessionId ? { session_id: sessionId } : {};
  };

  const appendUserMessage = (content: string) => {
    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-user`,
        role: "user",
        content,
      },
    ]);
  };

  const submitToAgent = async (
    payload: AgentChatRequest,
    displayText: string = payload.message
  ) => {
    setError("");
    setNotice("");
    appendUserMessage(displayText);

    if (!chatbotConfig.enabled) {
      setLoading(false);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: chatbotConfig.offlineMessage,
        },
      ]);
      return;
    }

    if (chatbotConfig.mode === "offline") {
      setLoading(false);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: chatbotConfig.offlineMessage,
        },
      ]);
      return;
    }

    if (chatbotConfig.mode === "staff") {
      setLoading(false);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: "Live chat với nhân viên chưa khả dụng. Vui lòng mở Trung tâm trợ giúp để chọn kênh liên hệ phù hợp.",
        },
      ]);
      return;
    }

    setLoading(true);
    setStreamStatus("Đang kết nối với trợ lý...");
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const assistantMessageId = `${Date.now()}-assistant-stream`;
    let hasStreamedText = false;

    try {
      const response = await sendAgentMessageStream(
        payload,
        {
          onSession: (newSessionId) => {
            setSessionId(newSessionId);
            sessionStorage.setItem(AGENT_SESSION_STORAGE_KEY, newSessionId);
            sessionStorage.setItem(
              AGENT_SESSION_AUTH_STORAGE_KEY,
              getAgentAuthToken()
            );
          },
          onStatus: (status) => setStreamStatus(status),
          onToken: (text) => {
            if (!hasStreamedText) {
              hasStreamedText = true;
              setMessages((current) => [
                ...current,
                {
                  id: assistantMessageId,
                  role: "assistant",
                  content: text,
                },
              ]);
              return;
            }
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantMessageId
                  ? { ...item, content: item.content + text }
                  : item
              )
            );
          },
        },
        controller.signal
      );

      if (response.session_id) {
        setSessionId(response.session_id);
        sessionStorage.setItem(AGENT_SESSION_STORAGE_KEY, response.session_id);
        sessionStorage.setItem(AGENT_SESSION_AUTH_STORAGE_KEY, getAgentAuthToken());
      }

      const finalMessage: ChatMessage = {
        id: hasStreamedText ? assistantMessageId : `${Date.now()}-assistant`,
        role: "assistant",
        content: response.answer,
        products: response.products ?? [],
        confirmation: response.confirmation,
        metadata: response.metadata,
      };
      setMessages((current) =>
        hasStreamedText
          ? current.map((item) =>
              item.id === assistantMessageId ? finalMessage : item
            )
          : [...current, finalMessage]
      );
    } catch (err) {
      const friendlyMessage = getAgentErrorMessage(err);
      const wasAborted = controller.signal.aborted;
      if (wasAborted) {
        return;
      }
      const isSlowResponse =
        friendlyMessage.includes("xử lý chậm") ||
        friendlyMessage.includes("thử lại sau vài giây");

      setError(isSlowResponse ? "" : friendlyMessage);

      if (isSlowResponse) {
        setMessages((current) => [
          ...current,
          {
            id: `${Date.now()}-assistant-timeout`,
            role: "assistant",
            content: friendlyMessage,
          },
        ]);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setLoading(false);
      setStreamStatus("");
    }
  };

  const handleStopGenerating = () => {
    setNotice("Đã dừng phản hồi");
    abortControllerRef.current?.abort();
  };

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || loading) return;
    setMessage("");
    await submitToAgent(
      {
        message: trimmedMessage,
        ...getActiveSessionPayload(),
      },
      trimmedMessage
    );
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (loading) return;
    await submitToAgent({ message: prompt, ...getActiveSessionPayload() }, prompt);
  };

  const handleRetry = async () => {
    const lastUserMessage = [...messages].reverse().find((item) => item.role === "user");
    if (!lastUserMessage || loading) return;
    await submitToAgent(
      { message: lastUserMessage.content, ...getActiveSessionPayload() },
      `Thử lại: ${lastUserMessage.content}`
    );
  };

  const handleAddToCart = async (product: AgentProductCard) => {
    const action = `__ACTION__:add_to_cart product_id=${product.product_id} quantity=1`;
    await submitToAgent(
      {
        message: action,
        ...getActiveSessionPayload(),
      },
      `Thêm ${product.name} vào giỏ hàng`
    );
  };

  const handleViewDetail = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleOpenPayment = (paymentUrl: string) => {
    try {
      const url = new URL(paymentUrl);
      if (!["https:", "http:"].includes(url.protocol)) return;
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    } catch {
      setError("Link ZaloPay không hợp lệ. Vui lòng tạo lại link.");
    }
  };

  const handleConfirmationChoice = async (confirm: boolean) => {
    await submitToAgent(
      {
        message: confirm ? "xác nhận" : "hủy",
        ...getActiveSessionPayload(),
      },
      confirm ? "Xác nhận" : "Hủy"
    );
  };

  const handleCheckoutPreview = async (
    value: CheckoutFormValue,
    checkoutContext: NonNullable<AgentMetadata["checkout_form"]>
  ) => {
    const activeSessionId =
      sessionId || sessionStorage.getItem(AGENT_SESSION_STORAGE_KEY) || "";
    if (!activeSessionId) {
      setError("Phiên trò chuyện chưa sẵn sàng. Vui lòng thử lại.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await previewAgentCheckout({
        session_id: activeSessionId,
        shipping_address: {
          fullName: value.fullName.trim(),
          phone: value.phone,
          address: value.address.trim(),
          ward: value.ward.trim(),
          district: value.district.trim(),
          city: value.city.trim(),
        },
        payment_method: value.paymentMethod,
        coupon_code: value.couponCode.trim() || undefined,
        product_id: checkoutContext.product_id,
        quantity: value.quantity,
      });
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-user-checkout-preview`,
          role: "user",
          content: "Đã gửi thông tin giao hàng để xem trước đơn hàng",
        },
        {
          id: `${Date.now()}-assistant-checkout-preview`,
          role: "assistant",
          content: response.answer,
          products: response.products ?? [],
          confirmation: response.confirmation,
          metadata: response.metadata,
        },
      ]);
    } catch (err) {
      setError(getAgentErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = async () => {
    abortControllerRef.current?.abort();
    if (sessionId) {
      try {
        await clearAgentSession(sessionId);
      } catch {
        // Local reset still allows a fresh visible conversation.
      }
    }

    sessionStorage.removeItem(AGENT_SESSION_STORAGE_KEY);
    sessionStorage.setItem(AGENT_SESSION_AUTH_STORAGE_KEY, getAgentAuthToken());
    setSessionId("");
    setError("");
    setNotice("");
    setMessages([
      createWelcomeMessage(
        "Cuộc trò chuyện mới đã bắt đầu. Mình có thể giúp gì cho bạn?"
      ),
    ]);
  };

  return (
    <>
      {open && !isFocusedFlow && (
        <Paper
          role="dialog"
          aria-label="Trợ lý Pickleball"
          elevation={10}
          sx={{
            position: "fixed",
            right: { xs: 10, sm: 24 },
            bottom: { xs: location.pathname.startsWith("/product/") ? 144 : 76, sm: 88 },
            zIndex: 1300,
            width: { xs: "calc(100vw - 20px)", sm: 410 },
            height: { xs: "min(590px, calc(100dvh - 112px))", sm: 600 },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: { xs: "22px", sm: "24px" },
            border: "1px solid rgba(15,23,42,0.08)",
            boxShadow: "0 28px 72px rgba(15,23,42,0.22), 0 4px 16px rgba(15,23,42,0.08)",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 2,
              py: 1.6,
              color: "white",
              background: "linear-gradient(135deg, #0F172A 0%, #0F766E 100%)",
              position: "relative",
              overflow: "hidden",
              "&::after": {
                content: '""',
                position: "absolute",
                width: 140,
                height: 140,
                borderRadius: "50%",
                bgcolor: "rgba(190,242,100,0.10)",
                right: -48,
                top: -88,
              },
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "14px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
                }}
              >
                <SmartToyRoundedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box sx={{ lineHeight: 1.15 }}>
                <Typography variant="subtitle1" fontWeight={850} sx={{ lineHeight: 1.25 }}>
                  Trợ lý Bạch Đằng
                </Typography>
                <Stack direction="row" spacing={0.7} alignItems="center" sx={{ mt: 0.25 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#BEF264", boxShadow: "0 0 0 3px rgba(190,242,100,0.13)" }} />
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.82)", fontWeight: 600 }}>
                    Trực tuyến • Phản hồi bằng AI
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.4} sx={{ position: "relative", zIndex: 1 }}>
              <IconButton
                aria-label="Bắt đầu cuộc trò chuyện mới"
                title="Cuộc trò chuyện mới"
                onClick={handleNewConversation}
                sx={{ color: "inherit", width: 36, height: 36, bgcolor: "rgba(255,255,255,0.08)", "&:hover": { bgcolor: "rgba(255,255,255,0.16)" } }}
              >
                <RestartAltRoundedIcon />
              </IconButton>
              <IconButton
                aria-label="Đóng trợ lý"
                title="Đóng trợ lý"
                onClick={() => setOpen(false)}
                sx={{ color: "inherit", width: 36, height: 36, bgcolor: "rgba(255,255,255,0.08)", "&:hover": { bgcolor: "rgba(255,255,255,0.16)" } }}
              >
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>

          <Stack
            spacing={1.5}
            aria-live="polite"
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              bgcolor: "#F8FAFC",
              backgroundImage: "radial-gradient(circle at 100% 0%, rgba(132,204,22,0.07), transparent 30%)",
              scrollbarWidth: "thin",
              scrollbarColor: "#CBD5E1 transparent",
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-thumb": { bgcolor: "#CBD5E1", borderRadius: 99 },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                alignSelf: "center",
                color: "#94A3B8",
                bgcolor: "rgba(255,255,255,0.9)",
                border: "1px solid #E2E8F0",
                borderRadius: 99,
                px: 1.2,
                py: 0.35,
                fontWeight: 650,
              }}
            >
              Hôm nay
            </Typography>
            {messages.map((chatMessage) => (
              <Box
                key={chatMessage.id}
                sx={{
                  alignSelf:
                    chatMessage.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "100%",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    chatMessage.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Stack
                  direction={chatMessage.role === "user" ? "row-reverse" : "row"}
                  spacing={0.9}
                  alignItems="flex-end"
                  sx={{ maxWidth: "92%" }}
                >
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      flexShrink: 0,
                      bgcolor: chatMessage.role === "user" ? "#E2E8F0" : "#0F766E",
                      color: chatMessage.role === "user" ? "#475569" : "#fff",
                      fontSize: 12,
                      fontWeight: 850,
                      boxShadow: "0 3px 10px rgba(15,23,42,0.10)",
                    }}
                  >
                    {chatMessage.role === "user"
                      ? authUser?.name?.charAt(0).toUpperCase() || "B"
                      : <SmartToyRoundedIcon sx={{ fontSize: 17 }} />}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 0.4,
                        px: 0.3,
                        textAlign: chatMessage.role === "user" ? "right" : "left",
                        color: "#94A3B8",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                      }}
                    >
                      {chatMessage.role === "user" ? "Bạn" : "Trợ lý AI"}
                    </Typography>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1.15,
                        borderRadius: chatMessage.role === "user"
                          ? "17px 17px 5px 17px"
                          : "17px 17px 17px 5px",
                        background: chatMessage.role === "user"
                          ? "linear-gradient(135deg, #0F766E, #0D5F59)"
                          : "#FFFFFF",
                        border: chatMessage.role === "user" ? "none" : "1px solid #E2E8F0",
                        color: chatMessage.role === "user" ? "white" : "#0F172A",
                        boxShadow: chatMessage.role === "user"
                          ? "0 8px 18px rgba(15,118,110,0.18)"
                          : "0 5px 16px rgba(15,23,42,0.06)",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      <Typography variant="body2" sx={{ lineHeight: 1.55 }}>
                        {chatMessage.content}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                {chatMessage.confirmation && (
                  <Paper
                    variant="outlined"
                    sx={{
                      mt: 1,
                      p: 1.5,
                      borderRadius: 3,
                      width: "100%",
                      maxWidth: "calc(100% - 39px)",
                      ml: chatMessage.role === "assistant" ? "39px" : 0,
                      bgcolor: "#FFFBEB",
                      borderColor: "#FDE68A",
                      boxShadow: "0 5px 16px rgba(146,64,14,0.06)",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      {chatMessage.confirmation.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                      {chatMessage.confirmation.message}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => void handleConfirmationChoice(true)}
                      >
                        {chatMessage.confirmation.confirm_label}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => void handleConfirmationChoice(false)}
                      >
                        {chatMessage.confirmation.cancel_label}
                      </Button>
                    </Stack>
                  </Paper>
                )}

                {chatMessage.products && chatMessage.products.length > 0 && (
                  <Stack
                    spacing={1}
                    sx={{
                      mt: 1,
                      width: "calc(100% - 39px)",
                      maxWidth: "calc(100% - 39px)",
                      ml: chatMessage.role === "assistant" ? "39px" : 0,
                    }}
                  >
                    {chatMessage.products.map((product) => {
                      const effectivePrice =
                        product.sale_price && product.sale_price > 0
                          ? product.sale_price
                          : product.price;
                      const hasSalePrice =
                        Boolean(product.sale_price) &&
                        Number(product.sale_price) < Number(product.price);
                      const inStock = Number(product.stock) > 0;

                      return (
                        <Paper
                          key={product.product_id}
                          variant="outlined"
                          sx={{
                            width: "100%",
                            overflow: "hidden",
                            borderRadius: 3,
                            bgcolor: "background.paper",
                            borderColor: "#E2E8F0",
                            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.25}
                            sx={{ p: 1, alignItems: "stretch" }}
                          >
                            <Box
                              component="img"
                              src={resolveImageUrl(product.image)}
                              alt={product.name}
                              onError={useImageFallback}
                              loading="lazy"
                              sx={{
                                width: 86,
                                height: 104,
                                flex: "0 0 86px",
                                objectFit: "contain",
                                p: 0.5,
                                display: "block",
                                bgcolor: "grey.50",
                                borderRadius: 2,
                                border: 1,
                                borderColor: "divider",
                              }}
                            />
                            <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
                              <Stack spacing={0.25}>
                                {product.brand && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      lineHeight: 1.2,
                                      textTransform: "uppercase",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {product.brand}
                                  </Typography>
                                )}
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    lineHeight: 1.35,
                                  }}
                                >
                                  {product.name}
                                </Typography>
                              </Stack>

                              <Stack
                                direction="row"
                                spacing={0.75}
                                alignItems="center"
                                flexWrap="wrap"
                                useFlexGap
                              >
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={800}
                                  color={hasSalePrice ? "error.main" : "primary.main"}
                                  sx={{ lineHeight: 1.2 }}
                                >
                                  {formatPrice(effectivePrice)}
                                </Typography>
                                {hasSalePrice && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      textDecoration: "line-through",
                                      color: "text.secondary",
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {formatPrice(product.price)}
                                  </Typography>
                                )}
                              </Stack>

                              <Chip
                                size="small"
                                label={
                                  inStock
                                    ? `Còn ${product.stock} sản phẩm`
                                    : "Tạm hết hàng"
                                }
                                color={inStock ? "success" : "default"}
                                variant={inStock ? "outlined" : "filled"}
                                sx={{
                                  alignSelf: "flex-start",
                                  height: 22,
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              />

                              <Stack direction="row" spacing={0.75} sx={{ mt: "auto" }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<OpenInNewRoundedIcon fontSize="small" />}
                                  onClick={() => handleViewDetail(product.product_id)}
                                  sx={{
                                    minWidth: 0,
                                    flex: 1,
                                    px: 1,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Chi tiết
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<ShoppingCartRoundedIcon fontSize="small" />}
                                  disabled={!inStock}
                                  onClick={() => void handleAddToCart(product)}
                                  sx={{
                                    minWidth: 0,
                                    flex: 1,
                                    px: 1,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Thêm giỏ
                                </Button>
                              </Stack>
                            </Stack>
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}

                {chatMessage.metadata?.payment_url && (
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<OpenInNewRoundedIcon fontSize="small" />}
                    onClick={() =>
                      handleOpenPayment(chatMessage.metadata!.payment_url!)
                    }
                    sx={{ mt: 1, maxWidth: "88%" }}
                  >
                    Mở ZaloPay để tự thanh toán
                  </Button>
                )}

                {chatMessage.metadata?.checkout_form &&
                  messages[messages.length - 1]?.id === chatMessage.id && (
                    <CheckoutForm
                      initialQuantity={chatMessage.metadata.checkout_form.quantity}
                      defaultName={authUser?.name}
                      disabled={loading}
                      onSubmit={(value) =>
                        handleCheckoutPreview(
                          value,
                          chatMessage.metadata!.checkout_form!
                        )
                      }
                    />
                  )}

              </Box>
            ))}

            {messages.length === 1 && !loading && chatbotConfig.enabled && chatbotConfig.mode === "ai" && (
              <Box sx={{ pl: { xs: 0, sm: "39px" } }}>
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 800, display: "block", mb: 0.8 }}>
                  Bạn có thể hỏi nhanh
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 0.75 }}>
                  {QUICK_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outlined"
                      onClick={() => void handleQuickPrompt(prompt)}
                      endIcon={<Box component="span" sx={{ fontSize: 16, lineHeight: 1 }}>›</Box>}
                      sx={{
                        justifyContent: "space-between",
                        minHeight: 48,
                        px: 1.2,
                        py: 0.8,
                        textAlign: "left",
                        lineHeight: 1.35,
                        fontSize: "0.75rem",
                        fontWeight: 750,
                        color: "#334155",
                        bgcolor: "#fff",
                        borderColor: "#E2E8F0",
                        borderRadius: 2.5,
                        "&:hover": { bgcolor: "#F0FDFA", borderColor: "#5EEAD4", color: "#0F766E" },
                      }}
                    >
                      {prompt}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {loading && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  alignSelf: "flex-start",
                  ml: "39px",
                  px: 1.3,
                  py: 0.9,
                  bgcolor: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: "16px 16px 16px 5px",
                  boxShadow: "0 5px 16px rgba(15,23,42,0.06)",
                }}
              >
                <CircularProgress size={15} aria-label="Đang xử lý" />
                <Typography variant="caption" color="text.secondary">
                  {streamStatus || "Đang xử lý..."}
                </Typography>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<StopCircleRoundedIcon fontSize="small" />}
                  onClick={handleStopGenerating}
                  sx={{ minWidth: 0, px: 0.7, color: "#64748B" }}
                >
                  Dừng
                </Button>
              </Stack>
            )}
            {notice && !loading && (
              <Chip
                size="small"
                label={notice}
                onDelete={() => setNotice("")}
                sx={{ alignSelf: "center", bgcolor: "#E2E8F0", color: "#475569", fontWeight: 650 }}
              />
            )}
            <div ref={messagesEndRef} />
          </Stack>

          {error && (
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mx: 1.5, mt: 1, px: 1.25, py: 0.8, bgcolor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 2 }}>
              <Typography color="error" variant="caption" sx={{ lineHeight: 1.35 }}>{error}</Typography>
              <Button size="small" onClick={() => void handleRetry()} disabled={loading} sx={{ flexShrink: 0 }}>Thử lại</Button>
            </Stack>
          )}

          <Stack
            component="form"
            direction="row"
            spacing={0.75}
            alignItems="flex-end"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
            sx={{ p: 1.35, borderTop: 1, borderColor: "#E2E8F0", bgcolor: "#fff" }}
          >
            <TextField
              fullWidth
              multiline
              minRows={1}
              maxRows={4}
              value={message}
              disabled={loading}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
              placeholder="Hỏi về sản phẩm, giỏ hàng..."
              inputProps={{ "aria-label": "Tin nhắn cho trợ lý", maxLength: 2000 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: "#F8FAFC",
                  px: 1.4,
                  py: 0.4,
                  fontSize: "0.9rem",
                  "& fieldset": { borderColor: "#E2E8F0" },
                  "&:hover fieldset": { borderColor: "#94A3B8" },
                  "&.Mui-focused fieldset": { borderColor: "#0F766E", borderWidth: 1.5 },
                },
              }}
            />
            <IconButton
              type="submit"
              disabled={loading || !message.trim()}
              aria-label="Gửi tin nhắn"
              title="Gửi tin nhắn"
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                color: "#fff",
                bgcolor: "#0F766E",
                boxShadow: "0 8px 18px rgba(15,118,110,0.24)",
                "&:hover": { bgcolor: "#0D5F59" },
                "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8", boxShadow: "none" },
              }}
            >
              <SendRoundedIcon />
            </IconButton>
          </Stack>
        </Paper>
      )}

      <Fab
        variant="extended"
        aria-label={open ? "Đóng trợ lý" : "Mở trợ lý Pickleball"}
        title={open ? "Đóng trợ lý" : "Mở trợ lý Pickleball"}
        onClick={() => setOpen((current) => !current)}
        sx={{
          position: "fixed",
          right: { xs: 16, sm: 24 },
          bottom: location.pathname.startsWith("/product/") ? { xs: 88, md: 24 } : 24,
          zIndex: 1300,
          display: open || isFocusedFlow ? "none" : "inline-flex",
          minWidth: { xs: 56, sm: "auto" },
          width: { xs: 56, sm: "auto" },
          px: { xs: 0, sm: 2 },
          height: 56,
          color: "#fff",
          background: "linear-gradient(135deg, #0F172A, #0F766E)",
          border: "1px solid rgba(255,255,255,0.22)",
          boxShadow: "0 16px 32px rgba(15,23,42,0.22)",
          "&:hover": { background: "linear-gradient(135deg, #0F766E, #0D5F59)", transform: "translateY(-2px)" },
          transition: "transform 180ms ease, box-shadow 180ms ease",
        }}
      >
        <SmartToyRoundedIcon />
        <Typography sx={{ display: { xs: "none", sm: "block" }, ml: 1, fontWeight: 800, fontSize: "0.86rem" }}>
          Hỏi trợ lý
        </Typography>
      </Fab>
    </>
  );
};

export default ChatWidget;
