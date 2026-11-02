import { useState } from "react";
import { Box, Typography, Paper, Chip, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import type { Product } from "../../types";
import type { RootState } from "../../store/store";
import wishlistService from "../../services/wishlistService";
import ProductImage from "../ProductImage";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "flash-sale";
}

const ProductCard = ({ product, variant = "default" }: ProductCardProps) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  const isFlashSale = variant === "flash-sale";

  const handleSave = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (saved || saving) return;
    try {
      setSaving(true);
      await wishlistService.addToWishlist(product._id);
      setSaved(true);
      toast.success("Đã thêm vào danh sách yêu thích");
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Không thể thêm vào yêu thích");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper
      elevation={0}
      role="link"
      tabIndex={0}
      aria-label={`Xem sản phẩm ${product.name}`}
      onClick={() => navigate(`/product/${product._id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") navigate(`/product/${product._id}`);
      }}
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
        <ProductImage
          src={product.image?.[0]}
          alt={product.name}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            p: 1,
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
        <Tooltip title={saved ? "Đã lưu vào yêu thích" : "Thêm vào yêu thích"}>
          <IconButton
            aria-label="Thêm vào danh sách yêu thích"
            onClick={handleSave}
            disabled={saving}
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              width: 36,
              height: 36,
              bgcolor: "rgba(255,255,255,.94)",
              color: saved ? "#e11d48" : "#475569",
              boxShadow: "0 5px 16px rgba(15,23,42,.14)",
              "&:hover": { bgcolor: "#fff1f2", color: "#e11d48" },
            }}
          >
            {saving ? <CircularProgress size={18} /> : <Heart size={18} fill={saved ? "currentColor" : "none"} />}
          </IconButton>
        </Tooltip>
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
