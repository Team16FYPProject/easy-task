"use client";
import TeamSettingsModal from "@/components/TeamSettingsModal";
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
import { TeamIdParams } from "@/app/team/[id]/types";
import { useEffect, useState } from "react";
import React from "react";
import { ApiResponse, Profile } from "@/utils/types";

export default function Notifications({ params: { id } }: TeamIdParams) {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const [loadingMembers, setLoadingMembers] = React.useState(true);
    const [members, setMembers] = React.useState<Profile[]>([]);
    const [displayedMembers, setDisplayedMembers] = React.useState<Profile[]>([]);
    const [open, setOpen] = React.useState(false);

    const [search, setSearch] = useState<string>("");

    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
    }, [loadingUser, user]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

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

    // Set displayed members
    useEffect(() => {
        const searchQuery = search.toLowerCase() || "";
        setDisplayedMembers(
            members.filter(
                (member) =>
                    member.first_name.toLowerCase().includes(searchQuery) ||
                    member.last_name.toLowerCase().includes(searchQuery) ||
                    member.email.toLowerCase().includes(searchQuery),
            ),
        );
    }, [search, members]);

    // If user is not logged in, return empty
    if (!user) {
        return <></>;
    }

    // Generate table row function
    function generateRowFunction(users: any): React.ReactNode {
        if (!users) {
            return <></>;
        }
        return users.map((user: Profile) => (
            <TableRow key={user.user_id}>
                <TableCell>
                    {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email}</TableCell> {/* Email */}
                <TableCell>{/* Notifications----- */}</TableCell>
            </TableRow>
        ));
    }

    return (
        <Container sx={{ padding: 6 }}>
            <Grid container direction="column" spacing={2}>
                {/* Notifications Page */}
                <Grid item xs={12}>
                    <Typography variant="h3">Notifications</Typography>
                </Grid>

                {/* Notifications Table */}
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            {/* Change loading members to loading notifications */}
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
                                          </TableRow>
                                      ))
                                    : generateRowFunction(displayedMembers)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Container>
    );
}
function setOpen(arg0: boolean) {
    throw new Error("Function not implemented.");
}
