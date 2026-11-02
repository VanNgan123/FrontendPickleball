import { Box } from "@mui/material";
import type { ReactNode } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ChatWidget from "../../components/ChatWidget/ChatWidget";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1}}>
        {children}
      </Box>
      <Footer />
      <ChatWidget />
    </Box>
  );
};

export default MainLayout;