"use client";
import Link from "next/link";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Drawer,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import path from "path";

export default function ButtonAppBar() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();
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
            <List>
                <ListItem key="Dashboard" disablePadding>
                    <Link href="/dashboard">
                        <ListItemButton>
                            {/* <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon> */}
                            <ListItemText primary="Dashboard" />
                        </ListItemButton>
                    </Link>
                </ListItem>
                <ListItem key="Profile" disablePadding>
                    <Link href="/profile">
                        <ListItemButton>
                            {/* <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon> */}
                            <ListItemText primary="Profile" />
                        </ListItemButton>
                    </Link>
                </ListItem>
                <ListItem key="Achievements" disablePadding>
                    <Link href="/achievement">
                        <ListItemButton>
                            {/* <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon> */}
                            <ListItemText primary="Achievements" />
                        </ListItemButton>
                    </Link>
                </ListItem>
            </List>
            <Divider />
            <List>
                {["Calendar", "List", "Kanban"].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <Link href={`/${text.toLowerCase()}`}>
                            <ListItemButton>
                                {/* <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon> */}
                                <ListItemText primary={`${text} View`} />
                            </ListItemButton>
                        </Link>
                    </ListItem>
                ))}
            </List>
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
