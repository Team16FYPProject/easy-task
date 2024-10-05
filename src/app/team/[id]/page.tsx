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
import SettingsFilled from "@mui/icons-material/Settings";
import { TeamIdParams } from "@/app/team/[id]/types";
import { useEffect, useState } from "react";
import React from "react";
import { ApiResponse, Profile } from "@/utils/types";
import InviteMemberModal from "@/components/InviteMemberModal";

export default function TeamMembers({ params: { id } }: TeamIdParams) {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const [loadingMembers, setLoadingMembers] = React.useState(true);
    const [members, setMembers] = React.useState<Profile[]>([]);
    const [displayedMembers, setDisplayedMembers] = React.useState<Profile[]>([]);
    const [showMemberModal, setShowMemberModal] = React.useState(false);
    const [showSettingsModal, setShowSettingsModal] = React.useState(false);

    const [search, setSearch] = useState<string>("");

    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
    }, [loadingUser, user]);

    const openInviteMemberModal = () => setShowMemberModal(true);
    const closeInviteMemberModal = () => setShowMemberModal(false);

    const openSettingsModal = () => setShowSettingsModal(true);
    const closeSettingsModal = () => setShowSettingsModal(false);

    function addMember(newMember: Profile) {
        setMembers((_members) => [..._members, newMember]);
    }

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

    async function handleLeaveTeam() {
        if (!confirm("Are you sure you want to leave this team?")) return;
        const response = await fetch(`/api/projects/${id}/members/${user?.id}`, {
            method: "DELETE",
        });
        const data: ApiResponse<void> = await response.json();
        if (!data.success) {
            return alert("Unable to leave team. Please try again.");
        }
        router.push("/dashboard");
    }

    async function handleRemoveMember(userId: string) {
        if (user?.id === userId) {
            return alert(
                "You cannot remove yourself. If you'd like to leave the team, use the Leave button instead.",
            );
        }
        if (!confirm("Are you sure you want to remove that member?")) return;
        const response = await fetch(`/api/projects/${id}/members/${userId}`, {
            method: "DELETE",
        });
        const data: ApiResponse<void> = await response.json();
        if (!data.success) {
            return alert(data.data);
        }
        setMembers((_members) => _members.filter((member) => member.user_id !== userId));
    }

    // Generate table row function
    function generateRowFunction(users: Profile[]): React.ReactNode {
        if (!users) {
            return <></>;
        }
        return users.map((user: Profile) => (
            <TableRow key={user.user_id}>
                <TableCell>
                    {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email}</TableCell> {/* Email */}
                <TableCell>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleRemoveMember(user.user_id)}
                    >
                        REMOVE
                    </Button>
                </TableCell>
            </TableRow>
        ));
    }

    return (
        <Container sx={{ padding: 2 }}>
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
                                placeholder="Enter Team Member..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </Grid>
                        {/* Leave Team, Invite Member, Settings */}
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ mr: 2 }}
                                onClick={handleLeaveTeam}
                            >
                                LEAVE TEAM
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                sx={{ mr: 2 }}
                                onClick={openInviteMemberModal}
                            >
                                INVITE MEMBER
                            </Button>
                            <IconButton
                                color="default"
                                size="medium"
                                sx={{ mr: 2 }}
                                onClick={openSettingsModal}
                            >
                                <SettingsFilled />
                            </IconButton>
                            <InviteMemberModal
                                open={showMemberModal}
                                handleClose={closeInviteMemberModal}
                                addMember={addMember}
                                projectId={id}
                            />
                            <TeamSettingsModal
                                open={showSettingsModal}
                                handleClose={closeSettingsModal}
                            />
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
