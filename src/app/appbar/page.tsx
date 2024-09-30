"use client";
import Link from "next/link";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { List, ListItem, ListItemButton, ListItemText, Divider, Drawer } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

type NavigationLink = {
    name: string;
    link?: string;
};

const NAVIGATION_LINKS: NavigationLink[][] = [
    [
        { name: "Dashboard", link: "/calendar" },
        { name: "Profile", link: "/profile" },
        { name: "Achievements", link: "/achievement" },
    ],
    [
        { name: "Calendar View", link: "/calendar" },
        { name: "List View", link: "/listView" },
        { name: "Kanban View", link: "/kanban" },
    ],
];

export default function ButtonAppBar() {
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
                    <>
                        <List key={`nav_group_${idx}`}>
                            {navigationGroup.map((navLink) => (
                                <ListItem key={navLink.name} className="w-full">
                                    <Link
                                        href={navLink.link ?? `/${navLink.name.toLowerCase()}`}
                                        className="w-full"
                                    >
                                        <ListItemButton className="w-full rounded-lg">
                                            <ListItemText primary={navLink.name} />
                                        </ListItemButton>
                                    </Link>
                                </ListItem>
                            ))}
                        </List>
                        {idx !== NAVIGATION_LINKS.length - 1 && <Divider />}
                    </>
                );
            })}
        </Box>
    );

    // const shouldShowIconButton = !["/login", "/register"].includes(location.pathname);

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
                </Toolbar>
            </AppBar>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </Box>
    );
}
