import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { Newspaper, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout/MainLayout";

const News = () => {
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
            background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)",
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
              bgcolor: "rgba(15,118,110,0.08)",
            },
          }}
        >
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              bgcolor: "#0F766E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              boxShadow: "0 8px 24px rgba(15,118,110,0.3)",
            }}
          >
            <Newspaper size={40} color="white" />
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
            Tin tức Pickleball
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: "#64748b", mb: 1, fontSize: { xs: 15, md: 17 }, maxWidth: 480, mx: "auto" }}
          >
            Trang tin tức đang được xây dựng. Chúng tôi sẽ cập nhật các bài viết về kỹ thuật, giải đấu và xu hướng Pickleball sớm nhất!
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#0F766E",
              fontWeight: 700,
              mb: 4,
              fontSize: 14,
            }}
          >
            🚀 Sắp ra mắt
          </Typography>

          <Button
            variant="contained"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate("/")}
            sx={{
              bgcolor: "#0F766E",
              "&:hover": { bgcolor: "#0D5F59" },
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

export default News;
