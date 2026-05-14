import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#E60023", // đỏ chủ đạo
    },
    secondary: {
      main: "#1E1E1E", // xám đậm
    },
    background: {
      default: "#FFFFFF",
      paper: "#111111", // nền header
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#E60023",
    },
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
  },
});
export default muiTheme;
