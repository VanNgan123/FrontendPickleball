import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
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
        403 - Khong co quyen truy cap
      </Typography>

      <Typography color="text.secondary">
        Ban khong co quyen truy cap trang nay.
      </Typography>

      <Button variant="contained" onClick={() => navigate("/")}
>
        Ve trang chu
      </Button>
    </Box>
  );
};

export default Unauthorized;
