import { Box, Button, Container, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import banner1 from "../../assets/banner/banner1.jpg";
import banner2 from "../../assets/banner/banner2.jpg";
import banner3 from "../../assets/banner/banner3.jpg";
import banner4 from "../../assets/banner/banner4.jpg";
import SidebarCategory from "../SlideBar";

const mainSlides = [
  {
    id: 1,
    image: banner1,
  },
  {
    id: 2,
    image: banner2,
  },
  {
    id: 3,
    image: banner3,
  },
  {
    id: 4,
    image: banner4,
  },
];

const Banner = () => {
  const navigate = useNavigate();
  const swiperRef = useRef<SwiperRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    swiperRef.current?.swiper.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.swiper.slideNext();
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "#fff", position: "relative", pt: { xs: 2, md: 1.5 }, pb: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "320px minmax(0, 1fr)" },
            gap: { xs: 2, lg: 1.5 },
            alignItems: "stretch",
          }}
        >
          <Box sx={{ display: { xs: "none", lg: "block" }, height: 616 }}>
            <SidebarCategory />
          </Box>

          <Box
            sx={{
              position: "relative",
              minWidth: 0,
              height: { xs: 430, sm: 500, lg: 616 },
              borderRadius: { xs: "18px", md: "24px" },
              overflow: "hidden",
              bgcolor: "#0F172A",
              boxShadow: "0 22px 44px rgba(15,23,42,0.16)",
            }}
          >
            <Swiper
              ref={swiperRef}
              modules={[Autoplay, EffectFade]}
              autoplay={{ delay: 4800, disableOnInteraction: false }}
              loop
              effect="fade"
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              style={{ height: "100%" }}
            >
              {mainSlides.map((slide) => (
                <SwiperSlide key={slide.id}>
                  <Box sx={{ position: "relative", height: "100%", overflow: "hidden" }}>
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url(${slide.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        bgcolor: "#0F172A",
                      }}
                    />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>

            <Button
              onClick={() => navigate("/products")}
              sx={{
                position: "absolute",
                left: { xs: 18, md: 28 },
                bottom: { xs: 18, md: 26 },
                zIndex: 4,
                bgcolor: "#84CC16",
                color: "#0F172A",
                px: { xs: 1.8, md: 2.2 },
                py: { xs: 0.75, md: 0.85 },
                borderRadius: "9px",
                fontSize: { xs: 13, md: 14 },
                fontWeight: 900,
                boxShadow: "0 8px 20px rgba(15,23,42,0.14)",
                "&:hover": { bgcolor: "#65A30D", color: "#fff" },
              }}
            >
              Mua ngay
            </Button>

            <IconButton
              onClick={handlePrev}
              sx={{
                position: "absolute",
                left: { xs: 10, lg: 14 },
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 3,
                width: { xs: 38, md: 44 },
                height: { xs: 38, md: 44 },
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.88)",
                color: "#0F766E",
                border: "1px solid #E2E8F0",
                boxShadow: "0 8px 20px rgba(15,23,42,0.12)",
                "&:hover": { bgcolor: "#84CC16", color: "#0F172A", borderColor: "#84CC16" },
              }}
            >
              <ChevronLeft size={23} />
            </IconButton>

            <IconButton
              onClick={handleNext}
              sx={{
                position: "absolute",
                right: { xs: 10, lg: 14 },
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 3,
                width: { xs: 38, md: 44 },
                height: { xs: 38, md: 44 },
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.88)",
                color: "#0F766E",
                border: "1px solid #E2E8F0",
                boxShadow: "0 8px 20px rgba(15,23,42,0.12)",
                "&:hover": { bgcolor: "#84CC16", color: "#0F172A", borderColor: "#84CC16" },
              }}
            >
              <ChevronRight size={23} />
            </IconButton>

            <Box
              sx={{
                position: "absolute",
                left: "50%",
                bottom: { xs: 18, lg: 28 },
                transform: "translateX(-50%)",
                zIndex: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {mainSlides.map((slide, index) => (
                <Box
                  key={slide.id}
                  onClick={() => swiperRef.current?.swiper.slideToLoop(index)}
                  sx={{
                    width: activeIndex === index ? 30 : 9,
                    height: 9,
                    borderRadius: 99,
                    cursor: "pointer",
                    bgcolor: activeIndex === index ? "#84CC16" : "rgba(15,23,42,0.28)",
                    transition: "all 180ms ease",
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Container >
    </Box >
  );
};

export default Banner;
