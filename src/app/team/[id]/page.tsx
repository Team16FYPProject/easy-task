"use client";

import { useRouter } from "next/navigation";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";
import {
    Button,
    Container,
    Grid,
    Typography,
    IconButton,
    TextField,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Skeleton,
} from "@mui/material";
import SettingsFilled from "@mui/icons-material/Settings";
import { TeamIdParams } from "@/app/team/[id]/types";
import { useEffect } from "react";
import React from "react";

interface Profile {
    user_id: string;
    profile_display_name: string;
}

export default function TeamMembers({ params: { id } }: TeamIdParams) {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const [loadingMembers, setLoadingMembers] = React.useState(true);
    const [members, setMembers] = React.useState<Profile[]>([]);

    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
    }, [loadingUser, user]);

    // Fetch member profiles
    useEffect(() => {
        async function fetchMembers() {
            setLoadingMembers(true);
            try {
                const response = await fetch(`/api/projects/${id}/members`, {
                    method: "GET",
                    credentials: "include",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.data || "Failed to fetch members");
                }

                if (result.success) {
                    setMembers(result.users);
                } else {
                    throw new Error("Failed to fetch members");
                }
                console.log("Members:", members);
            } catch (e) {
                console.error("Error:", e);
            }
            setLoadingMembers(false);
        }

        fetchMembers();
    }, []);

    if (!user) {
        return <></>;
    }

    function generateRowFunction(users: any): React.ReactNode {
        if (!users) {
            return <></>;
        }
        return users.map((user: Profile) => (
            <TableRow key={user.user_id}>
                <TableCell>{user.profile_display_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                    <Button variant="contained" color="secondary">
                        REMOVE
                    </Button>
                </TableCell>
            </TableRow>
        ));
    }

    return (
        <Container sx={{ padding: 6 }}>
            <Grid container direction="column" spacing={2}>
                {/* Team Name */}
                <Grid item xs={12}>
                    <Typography variant="h3">Team Members</Typography>
                </Grid>

                {/* Team Features */}
                <Grid item xs={12}>
                    {/* Search bar */}
                    <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <TextField
                                id="search-team-member"
                                label="Search"
                                defaultValue="Enter Team Member..."
                            />
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="primary" sx={{ mr: 2 }}>
                                LEAVE TEAM
                            </Button>
                            <Button variant="contained" color="secondary" sx={{ mr: 2 }}>
                                INVITE MEMBER
                            </Button>
                            <IconButton color="default" size="medium" sx={{ mr: 2 }}>
                                <SettingsFilled />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Team Table */}
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingMembers
                                    ? [...Array(5)].map((_, index) => (
                                          <TableRow key={index}>
                                              <TableCell>
                                                  <Skeleton variant="text" />
                                              </TableCell>
                                              <TableCell>
                                                  <Skeleton variant="text" />
                                              </TableCell>
                                              <TableCell>
                                                  <Skeleton variant="text" />
                                              </TableCell>
                                              <TableCell>
                                                  <Skeleton variant="text" />
                                              </TableCell>
                                              <TableCell>
                                                  <Skeleton variant="text" />
                                              </TableCell>
                                          </TableRow>
                                      ))
                                    : generateRowFunction(members)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Container>
    );
}
