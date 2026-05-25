// =============================================
// src/pages/NotFound/index.tsx
// =============================================
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f4f6f9",
        px: 3,
        textAlign: "center",
      }}
    >
      {/* Big 404 */}
      <Box
        sx={{
          position: "relative",
          mb: 4,
          animation: "float 3s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-12px)" },
          },
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "8rem", md: "12rem" },
            fontWeight: 900,
            lineHeight: 1,
            background: "linear-gradient(135deg, #E60023 0%, #ff6b6b 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.05em",
            userSelect: "none",
          }}
        >
          404
        </Typography>
        {/* Emoji */}
        <Typography
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: { xs: "3rem", md: "5rem" },
          }}
        >
          🎾
        </Typography>
      </Box>

      <Typography
        variant="h4"
        sx={{ fontWeight: 900, color: "#1a1a1a", mb: 1, fontSize: { xs: "1.5rem", md: "2rem" } }}
      >
        Oops! Trang không tồn tại
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: "#888", mb: 4, maxWidth: 420, lineHeight: 1.7 }}
      >
        Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
      </Typography>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
        <Button
          variant="contained"
          startIcon={<Home size={18} />}
          onClick={() => navigate("/")}
          sx={{
            bgcolor: "#E60023",
            "&:hover": { bgcolor: "#c4001d" },
            fontWeight: 700,
            px: 3,
            py: 1.2,
            borderRadius: 2,
          }}
        >
          Về trang chủ
        </Button>

        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate(-1)}
          sx={{
            borderColor: "#002c4b",
            color: "#002c4b",
            fontWeight: 700,
            px: 3,
            py: 1.2,
            borderRadius: 2,
            "&:hover": { bgcolor: "#002c4b", color: "white" },
          }}
        >
          Quay lại
        </Button>

        <Button
          variant="outlined"
          startIcon={<Search size={18} />}
          onClick={() => navigate("/products")}
          sx={{
            borderColor: "#e0e0e0",
            color: "#555",
            fontWeight: 700,
            px: 3,
            py: 1.2,
            borderRadius: 2,
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          Xem sản phẩm
        </Button>
      </Box>

      {/* Decoration */}
      <Box
        sx={{
          mt: 6,
          display: "flex",
          gap: 2,
          opacity: 0.3,
        }}
      >
        {["🏓", "🎾", "👟", "🏅"].map((emoji, i) => (
          <Typography key={i} sx={{ fontSize: "1.5rem" }}>{emoji}</Typography>
        ))}
      </Box>
    </Box>
  );
};

export default NotFound;
