import { Box, Typography, Paper, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../types";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "flash-sale";
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const ProductCard = ({ product, variant = "default" }: ProductCardProps) => {
  const navigate = useNavigate();
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "https://via.placeholder.com/300x300?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;

    // Normalizing paths so no double slashes happen.
    const baseUrl = API_URL.replace(/\/+$/, "");
    const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    
    // Convert backslashes to forward slashes just in case.
    return `${baseUrl}${path.replace(/\\/g, "/")}`;
  };

  const imageUrl = product.image && product.image.length > 0
    ? getImageUrl(product.image[0])
    : "https://via.placeholder.com/300x300?text=No+Image";

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  const isFlashSale = variant === "flash-sale";

  return (
    <Paper
      elevation={0}
      onClick={() => navigate(`/product/${product._id}`)}
      sx={{
        cursor: "pointer",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: isFlashSale ? "rgba(255,255,255,0.1)" : "#fff",
        border: isFlashSale ? "none" : "1px solid #f0f0f0",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: isFlashSale
            ? "0 8px 25px rgba(0,0,0,0.3)"
            : "0 8px 25px rgba(0,0,0,0.1)",
        },
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <Box sx={{ position: "relative", pt: "100%", overflow: "hidden" }}>
        <Box
          component="img"
          src={imageUrl}
          alt={product.name}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        />
        {discount > 0 && (
          <Chip
            label={`-${discount}%`}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "#E60023",
              color: "white",
              fontWeight: 900,
              fontSize: "0.75rem",
            }}
          />
        )}
      </Box>

      {/* Info */}
      <Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {product.brand && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: isFlashSale ? "rgba(255,255,255,0.6)" : "#999",
              textTransform: "uppercase",
              letterSpacing: 1,
              mb: 0.5,
            }}
          >
            {product.brand}
          </Typography>
        )}

        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: isFlashSale ? "white" : "#1a1a1a",
            mb: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
            minHeight: "2.8em",
          }}
        >
          {product.name}
        </Typography>

        <Box sx={{ mt: "auto" }}>
          {product.salePrice ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: "#E60023",
                  fontSize: "1rem",
                }}
              >
                {formatPrice(product.salePrice)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  textDecoration: "line-through",
                  color: isFlashSale ? "rgba(255,255,255,0.4)" : "#bbb",
                  fontSize: "0.8rem",
                }}
              >
                {formatPrice(product.price)}
              </Typography>
            </Box>
          ) : (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: isFlashSale ? "white" : "#1a1a1a",
                fontSize: "1rem",
              }}
            >
              {formatPrice(product.price)}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ProductCard;
