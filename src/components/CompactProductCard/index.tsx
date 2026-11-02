import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper } from "@mui/material";
import type { Product } from "../../types";
import ProductImage from "../ProductImage";

interface CompactProductCardProps {
  product: Product;
}

const CompactProductCard = ({ product }: CompactProductCardProps) => {
  const navigate = useNavigate();

  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

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
        bgcolor: "#fff", border: "1px solid #eee", borderRadius: 2,
        overflow: "hidden", cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          transform: "translateY(-2px)",
        },
        height: "100%", display: "flex", flexDirection: "column",
      }}
    >
      {/* Image */}
      <Box sx={{ position: "relative", pt: "100%", bgcolor: "#fafafa" }}>
        {discount > 0 && (
          <Box sx={{
            position: "absolute", top: 8, left: 8, zIndex: 1,
            bgcolor: "#E60023", color: "white", px: 1, py: 0.3,
            borderRadius: 1, fontWeight: 700, fontSize: "0.75rem",
          }}>
            -{discount}%
          </Box>
        )}
        <ProductImage
          src={product.image?.[0]}
          alt={product.name}
          sx={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            objectFit: "contain", p: 2,
          }}
        />
      </Box>

      {/* Info */}
      <Box sx={{ p: 1.5, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600, color: "#1a1a1a", mb: 0.5,
            overflow: "hidden", textOverflow: "ellipsis",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            fontSize: "0.82rem", lineHeight: 1.4, minHeight: "2.3em",
          }}
        >
          {product.name}
        </Typography>

        {/* Price */}
        <Box sx={{ mt: "auto" }}>
          <Typography
            component="span"
            sx={{
              fontWeight: 800,
              color: product.salePrice ? "#DC2626" : "#0F766E",
              fontSize: "0.95rem",
            }}
          >
            {(product.salePrice || product.price).toLocaleString("vi-VN")}đ
          </Typography>
          {product.salePrice && product.salePrice < product.price && (
            <Typography
              component="span"
              sx={{
                color: "#999", textDecoration: "line-through",
                fontSize: "0.78rem", ml: 1,
              }}
            >
              {product.price.toLocaleString("vi-VN")}đ
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default CompactProductCard;
