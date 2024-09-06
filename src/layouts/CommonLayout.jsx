import React, { useContext, useState } from "react";
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import { UserContext } from "../contexts/UserContext";

const drawerWidth = 240;

const CommonLayout = ({
  children,
  currentPage,
  maxWidth = "lg",
  menuItems = [],
  rightNavItems = [],
  showBreadcrumbs = false,
  BreadcrumbsComponent = null,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <Toolbar />
      <List>
        {menuItems.map((item, index) => (
          <ListItemButton key={index} component={RouterLink} to={item.link}>
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            考试系统
          </Typography>
          {rightNavItems.map((item, index) => (
            <Button
              key={index}
              color="inherit"
              component={RouterLink}
              to={item.link}
              startIcon={item.icon}
              sx={{ ml: 2 }}
            >
              {item.text}
            </Button>
          ))}
          <Button
            color="inherit"
            onClick={() => navigate("/user-center")}
            sx={{ ml: 2 }}
          >
            {user ? user.name : "登录"}
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginLeft: { sm: `${drawerWidth}px` }, // 添加左边距
          marginTop: "64px", // 添加顶部边距，与 AppBar 高度相同
        }}
      >
        <Toolbar />
        {showBreadcrumbs && BreadcrumbsComponent && (
          <BreadcrumbsComponent currentPage={currentPage} />
        )}
        <Container maxWidth={maxWidth}>
          <Typography variant="h4" gutterBottom>
            {currentPage}
          </Typography>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default CommonLayout;
