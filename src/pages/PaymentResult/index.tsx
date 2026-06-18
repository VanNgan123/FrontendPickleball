import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { CheckCircle2, XCircle } from "lucide-react";
import MainLayout from "../../layout/MainLayout/MainLayout";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");
  const reason = searchParams.get("reason");

  const isSuccess = status === "success";

  return (
    <MainLayout>
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 4,
            border: "1px solid #e2e8f0",
          }}
        >
          <Box sx={{ mb: 3 }}>
            {isSuccess ? (
              <CheckCircle2 size={80} color="#22c55e" />
            ) : (
              <XCircle size={80} color="#ef4444" />
            )}
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
            {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </Typography>

          <Typography sx={{ color: "#64748b", mb: 2 }}>
            {isSuccess
              ? "Đơn hàng của bạn đã được thanh toán qua VNPay."
              : "Giao dịch chưa hoàn tất hoặc bị từ chối."}
          </Typography>

          {orderId && (
            <Typography sx={{ mb: 1 }}>
              Mã đơn hàng: <b>{orderId}</b>
            </Typography>
          )}

          {reason && !isSuccess && (
            <Typography sx={{ color: "#ef4444", mb: 3 }}>
              Lý do: {reason}
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4 }}>
            <Button variant="outlined" onClick={() => navigate("/orders")}>
              Xem đơn hàng
            </Button>

            <Button variant="contained" onClick={() => navigate("/")}>
              Về trang chủ
            </Button>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default PaymentResult;
