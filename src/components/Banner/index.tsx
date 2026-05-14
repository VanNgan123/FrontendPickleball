import { Box, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, EffectFade } from "swiper/modules";
import { useRef } from "react";

import banner1 from "../../assets/banner/banner1.jpg";
import banner2 from "../../assets/banner/banner2.jpg";
import banner3 from "../../assets/banner/banner3.jpg";
import banner4 from "../../assets/banner/banner4.jpg";
import SidebarCategory from "../SlideBar";

interface Slide {
  id: number;
  name: string;
  image: string;
  bgColor: string;
}

const slides: Slide[] = [
  { id: 1, name: "ANNA LEIGH WATERS", image: banner1, bgColor: "#1a1a1a" },
  { id: 2, name: "JASON ROGERS", image: banner3, bgColor: "#121212" },
  { id: 3, name: "TYSON MCGUFFIN", image: banner4, bgColor: "#0d0d0d" },
  { id: 4, name: "SIMON RILEY", image: banner2, bgColor: "#121212" },
];

const Banner = () => {
  const swiperRef = useRef<any>(null);

  const handlePrev = () => {
    swiperRef.current?.swiper.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.swiper.slideNext();
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: "400px", md: "500px" },
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 144,
          zIndex: 10,
        }}
      >
        <SidebarCategory />
      </Box>

      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Navigation, EffectFade]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        effect="fade"
        style={{ height: "100%" }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <Box
              sx={{
                height: "100%",
                backgroundColor: slide.bgColor,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  animation: "zoomIn 0.8s ease-out",
                  "@keyframes zoomIn": {
                    "0%": { transform: "scale(1.1)", opacity: 0.7 },
                    "100%": { transform: "scale(1)", opacity: 1 },
                  },
                }}
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation buttons */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 6 },
          zIndex: 5,
          pointerEvents: "none",
          "& button": {
            pointerEvents: "auto",
          },
        }}
      >
        <IconButton
          onClick={handlePrev}
          sx={{
            color: "white",
            backgroundColor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.2)",
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
            width: { xs: 40, md: 50 },
            height: { xs: 40, md: 50 },
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={30} />
        </IconButton>

        <IconButton
          onClick={handleNext}
          sx={{
            color: "white",
            backgroundColor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.2)",
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
            width: { xs: 40, md: 50 },
            height: { xs: 40, md: 50 },
            cursor: "pointer",
          }}
        >
          <ChevronRight size={30} />
        </IconButton>
      </Box>

      {/* Footer text */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.3)",
          fontSize: "12px",
          letterSpacing: "2px",
          zIndex: 6,
        }}
      >
        PICKLEBALL BẠCH ĐẰNG
      </Box>
    </Box>
  );
};

export default Banner;
