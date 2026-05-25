import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#E60023", // đỏ chủ đạo
      dark: "#c4001d",
    },
    secondary: {
      main: "#08222f", // navy — đồng bộ Header
      dark: "#061b25",
    },
    background: {
      default: "#f8fafc", // nền trang xám nhẹ
      paper: "#ffffff",   // nền card/paper — trắng
    },
    text: {
      primary: "#1a1a2e",   // tối — dễ đọc trên nền sáng
      secondary: "#64748b", // xám trung tính
    },
  },

  typography: {
    fontFamily: '"Be Vietnam Pro", "Roboto", "Segoe UI", Tahoma, sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 800, letterSpacing: "-0.01em" },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none", // loại bỏ overlay gradient mặc định
        },
      },
    },
  },
});
export default muiTheme;
