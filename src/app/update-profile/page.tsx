"use client";
import {
    Box,
    Tab,
    Container,
    Grid,
    Tabs,
    Typography,
    TextField,
    Avatar,
    Skeleton,
    Button,
} from "@mui/material";

import { useUser } from "@/hooks/useUser";
import React from "react";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useRouter } from "next/navigation";

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

export default function UpdateProfile() {
    const { loadingUser, user } = useUser();
    const router = useRouter();
    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
    }, [loadingUser, user]);
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Container sx={{ padding: 6 }}>
            <Grid item xs={12} padding={1}>
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
                        <Container sx={{ padding: 1 }}>
                            <Grid container direction="column" spacing={2}>
                                <Grid item xs={12} padding={3}>
                                    <Typography variant="h4">Account</Typography>
                                </Grid>
                                {/* Profile Picture */}
                                <Grid container spacing={2} padding={1}>
                                    <Grid item>
                                        <Avatar></Avatar>
                                    </Grid>
                                    <Grid item>
                                        <input
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            id="raised-button-file"
                                            type="file"
                                        />
                                        <label htmlFor="raised-button-file">
                                            <Button variant="contained" component="span">
                                                Upload Picture
                                            </Button>
                                        </label>
                                    </Grid>
                                </Grid>
                                {/* Profile Info */}

                                <Grid container>
                                    <Grid item spacing={2} padding={1}>
                                        <TextField
                                            id="edit-full-name"
                                            label="Full Name"
                                            defaultValue="[NAME]"
                                        />
                                    </Grid>
                                    <Grid item spacing={2} padding={1}>
                                        <TextField
                                            id="edit-email-address"
                                            label="Email Address *" /* Note: the asteriks to become automatic */
                                            defaultValue="[EMAIL ADDRESS]"
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container>
                                    <Grid item spacing={2} padding={1}>
                                        <TextField id="edit-bio" label="Bio" defaultValue="[BIO]" />
                                    </Grid>
                                    <Grid item spacing={2} padding={1}>
                                        <TextField
                                            id="edit-customised-link"
                                            label="Customised Link"
                                            defaultValue="[CUSTOMISED LINK]"
                                        />
                                    </Grid>
                                </Grid>

                                {/* Preview */}
                                <Grid item>
                                    <Typography variant="h5">Preview</Typography>
                                </Grid>
                                <Grid item>
                                    <Skeleton variant="rectangular" width={500} height={200} />
                                </Grid>
                            </Grid>
                        </Container>
                    </CustomTabPanel>

                    {/* Settings - Notifications */}
                    <CustomTabPanel value={value} index={1}>
                        <Container sx={{ padding: 1 }}>
                            <Grid container direction="column" spacing={2}>
                                <Grid item xs={12} padding={3}>
                                    <Typography variant="h4">Notifications</Typography>
                                </Grid>
                            </Grid>
                        </Container>
                    </CustomTabPanel>
                    {/* Settings - Security */}
                    <CustomTabPanel value={value} index={2}>
                        <Container sx={{ padding: 1 }}>
                            <Grid container direction="column" spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="h4">Security</Typography>
                                </Grid>
                                {/* Change Password */}
                                <Grid item>Enter your current password</Grid>
                                <Grid item>
                                    <TextField
                                        id="enter-current-password"
                                        label="Current Password"
                                        defaultValue=""
                                    />
                                </Grid>
                                <Grid item>Enter your new password</Grid>
                                <Grid item>
                                    <TextField
                                        id="enter-new-password"
                                        label="New Password"
                                        defaultValue=""
                                    />
                                </Grid>
                                <Grid item>
                                    <Button variant="contained" color="secondary">
                                        SAVE PASSWORD
                                    </Button>
                                </Grid>
                            </Grid>
                        </Container>
                    </CustomTabPanel>
                </Box>
            </Grid>
        </Container>
    );
}
