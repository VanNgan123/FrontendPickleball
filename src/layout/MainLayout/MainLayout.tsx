import { Box } from "@mui/material";
import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box component="main" sx={{ flexGrow: 1}}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;