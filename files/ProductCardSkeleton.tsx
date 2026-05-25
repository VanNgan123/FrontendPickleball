// src/components/Skeletons/ProductCardSkeleton.tsx
import { Box, Paper, Skeleton } from "@mui/material";

const ProductCardSkeleton = () => (
  <Paper
    elevation={0}
    sx={{
      border: "1px solid #eee", borderRadius: 2,
      overflow: "hidden", height: "100%",
      display: "flex", flexDirection: "column",
    }}
  >
    {/* Image */}
    <Skeleton variant="rectangular" sx={{ pt: "100%", bgcolor: "#f5f5f5" }} />

    {/* Info */}
    <Box sx={{ p: 1.5 }}>
      <Skeleton width="90%" height={16} sx={{ mb: 0.5 }} />
      <Skeleton width="60%" height={16} sx={{ mb: 1 }} />
      <Skeleton width="40%" height={20} />
    </Box>
  </Paper>
);

export default ProductCardSkeleton;
