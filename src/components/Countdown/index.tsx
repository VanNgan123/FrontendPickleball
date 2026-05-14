import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <Box sx={{ textAlign: "center", mx: 0.5 }}>
      <Box
        sx={{
          bgcolor: "#E60023",
          color: "white",
          borderRadius: 1,
          px: 1.5,
          py: 0.8,
          minWidth: 45,
          fontWeight: 900,
          fontSize: "1.2rem",
          boxShadow: "0 2px 8px rgba(230,0,35,0.3)",
        }}
      >
        {String(value).padStart(2, "0")}
      </Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: "text.secondary", mt: 0.5, display: "block", fontSize: "0.65rem" }}
      >
        {label}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <TimeBlock value={timeLeft.hours} label="GIỜ" />
      <Typography sx={{ fontWeight: 900, fontSize: "1.2rem", color: "#E60023", mt: -1.5 }}>:</Typography>
      <TimeBlock value={timeLeft.minutes} label="PHÚT" />
      <Typography sx={{ fontWeight: 900, fontSize: "1.2rem", color: "#E60023", mt: -1.5 }}>:</Typography>
      <TimeBlock value={timeLeft.seconds} label="GIÂY" />
    </Box>
  );
};

export default Countdown;
