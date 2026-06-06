import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { MapPin, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout/MainLayout";

const Courts = () => {
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
            background: "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #f0fdf4 100%)",
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
              bgcolor: "rgba(59,130,246,0.08)",
            },
          }}
        >
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              bgcolor: "#3B82F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              boxShadow: "0 8px 24px rgba(59,130,246,0.3)",
            }}
          >
            <MapPin size={40} color="white" />
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
            Tìm sân chơi Pickleball
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: "#64748b", mb: 1, fontSize: { xs: 15, md: 17 }, maxWidth: 480, mx: "auto" }}
          >
            Tính năng tìm sân Pickleball gần bạn đang được phát triển. Sắp tới bạn có thể dễ dàng tra cứu sân chơi trên bản đồ!
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#3B82F6",
              fontWeight: 700,
              mb: 4,
              fontSize: 14,
            }}
          >
            📍 Sắp ra mắt
          </Typography>

          <Button
            variant="contained"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate("/")}
            sx={{
              bgcolor: "#3B82F6",
              "&:hover": { bgcolor: "#2563EB" },
              fontWeight: 700,
              px: 4,
              py: 1.2,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "0.95rem",
            }}
          >
            Về trang chủ
          </Button>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default Courts;
