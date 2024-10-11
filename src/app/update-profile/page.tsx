"use client";
import { Box, Button, Container, Grid, Tab, Tabs, TextField, Typography } from "@mui/material";

import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";
import type { ApiResponse, Profile } from "@/utils/types";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

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
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [bio, setBio] = useState<string>("");

    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
        if (user) {
            const response = await fetch("/api/user/profile");
            const data: ApiResponse<Profile> = await response.json();
            if (!data.success) {
                alert("Unable to load your profile data.");
                return;
            }
            const profile = data.data;
            setFirstName(profile.first_name);
            setLastName(profile.last_name);
            setEmail(profile.email);
            setBio(profile.profile_bio ?? "");
        }
    }, [loadingUser, user]);
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleUpdate = async () => {
        const formData = new FormData();
        formData.append("first_name", firstName);
        formData.append("last_name", lastName);
        formData.append("email", email);
        formData.append("bio", bio);
        const response = await fetch("/api/user/profile", {
            method: "PATCH",
            body: formData,
        });
        const data: ApiResponse<string> = await response.json();
        if (!response.ok || !data.success) {
            alert("Unable to update your profile details.");
            return;
        }
        alert("Profile details updated.");
        router.push("/profile");
    };

    return (
        <Container sx={{ padding: 2 }}>
            <Grid item xs={12} padding={1}>
                <Typography variant="h3">Settings</Typography>
            </Grid>
            <Grid container direction="column" spacing={2}>
                {/* Settings Menu */}
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                            <Tab label="Accounts" {...a11yProps(0)} />
                            <Tab label="Security" {...a11yProps(1)} />
                        </Tabs>
                    </Box>

                    {/* Settings - Accounts */}
                    <CustomTabPanel value={value} index={0}>
                        <Container sx={{ padding: 1 }}>
                            <Grid container direction="column" spacing={2}>
                                <Grid item xs={12} padding={3}>
                                    <Typography variant="h4">Account</Typography>
                                </Grid>

                                {/* Profile Info */}

                                <Grid container>
                                    <Grid item spacing={2} padding={1}>
                                        <TextField
                                            id="edit-full-name"
                                            label="First Name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item spacing={2} padding={1}>
                                        <TextField
                                            id="edit-last-name"
                                            label="Last Name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container direction="column">
                                    <Grid item spacing={2} padding={1}>
                                        <TextField
                                            id="edit-email-address"
                                            label="Email Address *" /* Note: the asteriks to become automatic */
                                            value={email}
                                            fullWidth
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </Grid>

                                    <Grid item spacing={2} padding={1}>
                                        <TextField
                                            multiline
                                            rows={4}
                                            id="edit-bio"
                                            label="Bio"
                                            value={bio}
                                            fullWidth
                                            onChange={(e) => setBio(e.target.value)}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Update Button */}
                                <Grid container spacing={2} padding={1}>
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            component="span"
                                            color="secondary"
                                            onClick={handleUpdate}
                                        >
                                            Update
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Container>
                    </CustomTabPanel>

                    {/* Settings - Security */}
                    <CustomTabPanel value={value} index={1}>
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
