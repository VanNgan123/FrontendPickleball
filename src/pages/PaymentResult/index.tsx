import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import {
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import MainLayout from "../../layout/MainLayout/MainLayout";
import orderService from "../../services/orderService";

type ResultState =
  | "checking"
  | "paid"
  | "failed"
  | "pending"
  | "error";

const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("orderId");
  const [resultState, setResultState] =
    useState<ResultState>("checking");
  const [message, setMessage] = useState(
    "Đang xác nhận giao dịch với hệ thống..."
  );

  useEffect(() => {
    let cancelled = false;

    const verifyOrder = async () => {
      if (!orderId) {
        setResultState("error");
        setMessage("Không tìm thấy mã đơn hàng.");
        return;
      }

      try {
        // IPN có thể đến chậm hơn trình duyệt,
        // vì vậy kiểm tra lại tối đa khoảng 30 giây.
        for (let attempt = 0; attempt < 12; attempt += 1) {
          const response = await orderService.getOrderById(orderId);

          if (cancelled) return;

          const order = response.data;

          if (order.paymentStatus === "Paid") {
            setResultState("paid");
            setMessage(
              "Đơn hàng đã được VNPay xác nhận thanh toán."
            );
            return;
          }

          if (
            order.paymentStatus === "Failed" ||
            order.status === "Cancelled"
          ) {
            setResultState("failed");
            setMessage(
              "Giao dịch thất bại, đã bị hủy hoặc chưa hoàn tất."
            );
            return;
          }

          await delay(2500);
        }

        if (!cancelled) {
          setResultState("pending");
          setMessage(
            "VNPay chưa xác nhận giao dịch. Bạn có thể kiểm tra lại trong danh sách đơn hàng."
          );
        }
      } catch {
        if (!cancelled) {
          setResultState("error");
          setMessage(
            "Không thể kiểm tra trạng thái thanh toán. Vui lòng xem lại trong danh sách đơn hàng."
          );
        }
      }
    };

    verifyOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const getIcon = () => {
    if (resultState === "checking") {
      return <CircularProgress size={72} />;
    }

    if (resultState === "paid") {
      return <CheckCircle2 size={80} color="#22c55e" />;
    }

    if (resultState === "pending") {
      return <Clock3 size={80} color="#f59e0b" />;
    }

    return <XCircle size={80} color="#ef4444" />;
  };

  const getTitle = () => {
    switch (resultState) {
      case "checking":
        return "Đang xác nhận thanh toán";
      case "paid":
        return "Thanh toán thành công";
      case "pending":
        return "Đang chờ VNPay xác nhận";
      default:
        return "Thanh toán chưa thành công";
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            textAlign: "center",
            borderRadius: 4,
            border: "1px solid #e2e8f0",
          }}
        >
          <Box sx={{ mb: 3 }}>{getIcon()}</Box>

          <Typography
            variant="h4"
            sx={{ fontWeight: 900, mb: 2 }}
          >
            {getTitle()}
          </Typography>

          <Typography sx={{ color: "#64748b", mb: 3 }}>
            {message}
          </Typography>

          {orderId && (
            <Typography sx={{ mb: 4 }}>
              Mã đơn hàng: <b>{orderId}</b>
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "center",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/orders")}
            >
              Xem đơn hàng
            </Button>

            <Button
              variant="contained"
              onClick={() => navigate("/")}
            >
              Về trang chủ
            </Button>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default PaymentResult;
