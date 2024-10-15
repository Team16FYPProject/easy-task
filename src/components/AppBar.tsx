"use client";
import Link from "next/link";

import MenuIcon from "@mui/icons-material/Menu";
import {
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Switch,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { usePathname } from "next/navigation";
import * as React from "react";

type NavigationLink = {
    name: string;
    link: string;
};

const NAVIGATION_LINKS: NavigationLink[][] = [
    [
        { name: "Dashboard", link: "/dashboard" },
        { name: "Profile", link: "/profile" },
        { name: "Projects", link: "/project" },
        { name: "Notifications", link: "/notifications" },
        { name: "Achievements", link: "/achievement" },
    ],
    [
        { name: "Calendar View", link: "/calendar" },
        { name: "List View", link: "/listView" },
        { name: "Kanban View", link: "/kanban" },
    ],
    [{ name: "Logout", link: "/logout" }],
];

export default function SiteAppBar({
    toggleTheme,
    currentMode,
}: {
    toggleTheme: () => void;
    currentMode: "light" | "dark";
}) {
    const [open, setOpen] = React.useState(false);
    const [shouldShowIconButton, setShouldShowIconButton] = React.useState(true);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };
    const pathname = usePathname();
    React.useEffect(() => {
        const pathsWithoutIconButton = ["/login", "/register"];
        setShouldShowIconButton(!pathsWithoutIconButton.includes(pathname));
    }, [pathname]);

    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
            {NAVIGATION_LINKS.map((navigationGroup, idx) => {
                return (
                    <React.Fragment key={`nav_group_${idx}`}>
                        <List>
                            {navigationGroup.map((navLink) => (
                                <ListItem key={navLink.name}>
                                    <Link href={navLink.link}>
                                        <ListItemButton>
                                            <ListItemText primary={navLink.name} />
                                        </ListItemButton>
                                    </Link>
                                </ListItem>
                            ))}
                        </List>
                        {idx !== NAVIGATION_LINKS.length - 1 && <Divider />}
                    </React.Fragment>
                );
            })}
        </Box>
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    {shouldShowIconButton && (
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={toggleDrawer(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Easy Task
                    </Typography>
                    <Typography variant="subtitle2">Light</Typography>
                    <Switch
                        checked={currentMode === "dark"}
                        onChange={toggleTheme}
                        inputProps={{ "aria-label": "toggle theme" }}
                    />
                    <Typography variant="subtitle2">Dark</Typography>
                </Toolbar>
            </AppBar>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </Box>
    );
}
