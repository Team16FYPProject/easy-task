"use client";
import {
    Box,
    Tab,
    Container,
    Grid,
    Tabs,
    Typography,
    IconButton,
    TextField,
    Avatar,
    Skeleton,
} from "@mui/material";

import { Inter } from "next/font/google";
import { useUser } from "@/hooks/useUser";
import React from "react";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

export default function Home() {
    const { loadingUser, user } = useUser();
    const router = useRouter();
    useEffectAsync(async () => {
        if (loadingUser) return;
        router.push(user ? "/dashboard" : "/login");
    }, [loadingUser, user]);

    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Container sx={{ padding: 6 }}>
            <Grid item xs={12}>
                <Typography variant="h3">Settings</Typography>
            </Grid>
            <Grid container direction="column" spacing={2}>
                {/* Settings Menu */}
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                            <Tab label="Accounts" {...a11yProps(0)} />
                            <Tab label="Notifications" {...a11yProps(1)} />
                            <Tab label="Security" {...a11yProps(2)} />
                        </Tabs>
                    </Box>
                    {/* Settings - Accounts */}
                    <CustomTabPanel value={value} index={0}>
                        <Container sx={{ padding: 6 }}>
                            <Grid container direction="column" spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="h3">Account</Typography>
                                </Grid>
                                {/* Profile Picture */}
                                <Grid item xs={12}>
                                    <Avatar></Avatar>
                                </Grid>
                                {/* Profile Info */}
                                <Grid item>
                                    <TextField
                                        id="edit-full-name"
                                        label="Full Name"
                                        defaultValue="[NAME]"
                                    />
                                    <TextField
                                        id="edit-email-address"
                                        label="Email Address *" /* Note: the asteriks to become automatic */
                                        defaultValue="[EMAIL ADDRESS]"
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField id="edit-bio" label="Bio" defaultValue="[BIO]" />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        id="edit-customised-link"
                                        label="Customised Link"
                                        defaultValue="[CUSTOMISED LINK]"
                                    />
                                </Grid>
                                {/* Preview */}
                                <Grid item>
                                    <Typography variant="h3">Preview</Typography>
                                </Grid>
                                <Grid item>
                                    <Skeleton variant="rectangular" width={210} height={60} />
                                </Grid>
                            </Grid>
                        </Container>
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1}>
                        Notifications
                    </CustomTabPanel>
                    {/* Settings - Security */}
                    <CustomTabPanel value={value} index={2}>
                        <Container sx={{ padding: 6 }}>
                            <Grid container direction="column" spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="h3">Security</Typography>
                                </Grid>
                                {/* Change Password */}
                                <Grid item>
                                    <TextField
                                        id="enter-current-password"
                                        label="Current Password"
                                        defaultValue=""
                                    />
                                    <TextField
                                        id="enter-new-password"
                                        label="New Password"
                                        defaultValue=""
                                    />
                                </Grid>
                            </Grid>
                        </Container>
                    </CustomTabPanel>
                </Box>
            </Grid>
        </Container>
    );
}
