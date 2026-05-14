import { ThemeProvider } from "@mui/material/styles";

import { Toaster } from "react-hot-toast";
import muiTheme from "./theme/muitheme";
import AppRouters from "./routers/Routers";

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <Toaster position="top-right" />
      <AppRouters />
    </ThemeProvider>
  );
}

export default App;