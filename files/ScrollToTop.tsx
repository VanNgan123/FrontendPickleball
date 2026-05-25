// =============================================
// src/components/ScrollToTop/index.tsx
// ─ Tự động scroll lên đầu trang khi navigate
// =============================================
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
