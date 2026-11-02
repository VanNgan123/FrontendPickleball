import { Box, type BoxProps } from "@mui/material";
import { PRODUCT_PLACEHOLDER, resolveImageUrl, useImageFallback } from "../../utils/image";

interface ProductImageProps extends Omit<BoxProps<"img">, "component" | "src" | "alt"> {
  src?: string | null;
  alt: string;
  eager?: boolean;
}

const ProductImage = ({ src, alt, eager = false, ...props }: ProductImageProps) => (
  <Box
    component="img"
    src={resolveImageUrl(src) || PRODUCT_PLACEHOLDER}
    alt={alt}
    loading={eager ? "eager" : "lazy"}
    decoding="async"
    onError={useImageFallback}
    {...props}
  />
);

export default ProductImage;
