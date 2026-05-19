import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h4" fontWeight={700}>
        404 - Khong tim thay trang
      </Typography>

      <Typography color="text.secondary">
        Trang ban tim khong ton tai hoac da bi di chuyen.
      </Typography>

      <Button variant="contained" onClick={() => navigate("/")}
>
        Ve trang chu
      </Button>
    </Box>
  );
};

export default NotFound;
