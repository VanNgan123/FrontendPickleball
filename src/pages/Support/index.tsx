import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { Headphones, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout/MainLayout";

const Support = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 }, textAlign: "center" }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            border: "1.5px solid #e2e8f0",
            background: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 50%, #fef9c3 100%)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: "50%",
              bgcolor: "rgba(245,158,11,0.08)",
            },
          }}
        >
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              bgcolor: "#F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              boxShadow: "0 8px 24px rgba(245,158,11,0.3)",
            }}
          >
            <Headphones size={40} color="white" />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "#0F172A",
              mb: 1.5,
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            Liên hệ & Trợ giúp
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: "#64748b", mb: 1, fontSize: { xs: 15, md: 17 }, maxWidth: 480, mx: "auto" }}
          >
            Trang hỗ trợ khách hàng đang được hoàn thiện. Bạn có thể liên hệ qua hotline hoặc chat Zalo để được tư vấn ngay!
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#D97706",
              fontWeight: 700,
              mb: 4,
              fontSize: 14,
            }}
          >
            📞 Hotline: 0123.456.789
          </Typography>

          <Button
            variant="contained"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate("/")}
            sx={{
              bgcolor: "#F59E0B",
              "&:hover": { bgcolor: "#D97706" },
              fontWeight: 700,
              px: 4,
              py: 1.2,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "0.95rem",
              color: "#1a1a1a",
            }}
          >
            Về trang chủ
          </Button>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default Support;
