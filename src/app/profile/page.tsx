"use client";

import { useRouter } from "next/navigation";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";
import {
    Avatar,
    Box,
    Button,
    ButtonBase,
    Container,
    Grid,
    Paper,
    Skeleton,
    Typography,
} from "@mui/material";
import Image from "next/image";
import TeamCard from "@/components/TeamCard";
import { useEffect, useState } from "react";
import type { ApiResponse, DashboardResponse, ProfileResponse, ProjectTask } from "@/utils/types";
import { useAchievements } from "@/hooks/useAchievements";
import { ResponsiveContainer, Pie, Cell, PieChart } from "recharts";
import React from "react";
import { Project } from "@/utils/types";
import { RowData, TeamViewData } from "../dashboard/types";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const COLORS = ["#0088FE", "#00C49F"];

const AchievementTree = ({ filledCount }: { filledCount: number }) => {
    const treeHeight = 300; // Fixed tree height
    const treeWidth = 200; // Fixed tree width
    const maxCircles = 20; // Maximum number of circles to display

    return (
        <svg width={treeWidth} height={treeHeight} viewBox={`0 0 ${treeWidth} ${treeHeight}`}>
            <image
                href="/emptytree.jpg"
                x="0"
                y="0"
                width={treeWidth}
                height={treeHeight}
                preserveAspectRatio="xMidYMid slice"
            />
            {[...Array(Math.min(filledCount, maxCircles))].map((_, index) => (
                <circle
                    key={index}
                    cx={100 + Math.cos(index * 0.5 + Math.PI) * 70} // Rotate by 180 degrees
                    cy={treeHeight - 200 + Math.sin(index * 0.5 + Math.PI) * 70} // Rotate by 180 degrees
                    r="7" // Increased radius of circle
                    fill="pink"
                />
            ))}
        </svg>
    );
};

export default function ProfilePage() {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const { achievements, loading: loadingAchievements } = useAchievements(user?.id || "");
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [rows, setRows] = useState<RowData[]>([]);
    const dataTableHeight = 300;
    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const paginationModel = { page: 0, pageSize: 1 };

    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
        if (user) {
            const response = await fetch("/api/user/profile");
            const data: ApiResponse<ProfileResponse> = await response.json();
            if (!data.success) {
                alert("Unable to load your profile data.");
                return;
            }
            setProfile(data.data);
        }
    }, [loadingUser, user]);

    // Fetch projects
    useEffect(() => {
        async function fetchProjects() {
            try {
                setLoadingProjects(true);
                const response = await fetch("/api/user/dashboard", {
                    method: "GET",
                    credentials: "include",
                });

                const result: ApiResponse<DashboardResponse> = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error((result.data as string) || "Failed to fetch projects");
                }
                setProjects(result.data.projects);
                setTasks(result.data.tasks);
            } catch (e) {
                console.error("Error:", e);
            } finally {
                setLoadingProjects(false);
            }
        }

        fetchProjects();
    }, []);

    // Add projects to Data Table rows
    useEffect(() => {
        /* Rowdata is a list of dicts with keys: id, teamView1, teamView2, teamView3
        Each teamView is a tuple with the project name and project id
        For example: {id: 1, teamView1: ["Project 1", "1"], teamView2: ["Project 2", "2"], teamView3: ["Project 3", "3"]}
        This will be used to populate the Team Cards in the Data Table */
        const newRows: RowData[] = [];
        // For every 3 projects, create a new row
        for (let i = 0; i < Math.ceil(projects.length / 3); i++) {
            const rowData: RowData = {
                id: i + 1,
                teamView1: undefined,
                teamView2: undefined,
                teamView3: undefined,
            };
            // For every project in the row, add it to the row data
            for (let j = 0; j < 3; j++) {
                const projectIndex = i * 3 + j;
                if (projectIndex < projects.length) {
                    const project = projects[projectIndex];
                    const viewKey = `teamView${j + 1}` as keyof Omit<RowData, "id">;
                    rowData[viewKey] = [project.project_name, project.project_id];
                }
            }
            // Add the row data to the rows
            newRows.push(rowData);
        }
        // Set the rows
        setRows(newRows);
    }, [projects]);

    const columns: GridColDef[] = [
        {
            field: "teamView1",
            headerName: "",
            flex: 1,
            renderCell: (params: any) => {
                const value = params.value as TeamViewData;
                return value ? (
                    <ButtonBase onClick={() => handleCardClick(value[1])}>
                        <TeamCard title={value[0]} image="/GroupIcon.png" />
                    </ButtonBase>
                ) : (
                    <div style={{ height: "100%", width: "100%" }} />
                );
            },
        },
        {
            field: "teamView2",
            headerName: "",
            flex: 1,
            renderCell: (params: any) => {
                const value = params.value as TeamViewData;
                return value ? (
                    <ButtonBase onClick={() => handleCardClick(value[1])}>
                        <TeamCard title={value[0]} image="/GroupIcon.png" />
                    </ButtonBase>
                ) : (
                    <div style={{ height: "100%", width: "100%" }} />
                );
            },
        },
        {
            field: "teamView3",
            headerName: "",
            flex: 1,
            renderCell: (params: any) => {
                const value = params.value as TeamViewData;
                return value ? (
                    <ButtonBase onClick={() => handleCardClick(value[1])}>
                        <TeamCard title={value[0]} image="/GroupIcon.png" />
                    </ButtonBase>
                ) : (
                    <div style={{ height: "100%", width: "100%" }} />
                );
            },
        },
    ];

    // Handle card click for Team Cards
    function handleCardClick(projectId: string): void {
        router.push(`/team/${projectId}`);
    }

    // Data Table component
    function DataTable() {
        const footerHeight = 53; // Approximate height of the footer
        const availableHeight = dataTableHeight - footerHeight;
        return (
            <Paper
                sx={{
                    height: dataTableHeight,
                    width: "100%",
                    border: "none",
                    boxShadow: "none",
                    "& .MuiDataGrid-root": {
                        border: "none",
                    },
                    "& .MuiDataGrid-window": {
                        border: "none",
                    },
                }}
            >
                <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{ pagination: { paginationModel } }}
                    pageSizeOptions={[1]}
                    disableColumnMenu
                    columnHeaderHeight={0}
                    getRowHeight={() => availableHeight}
                    sx={{
                        border: "none",
                        "& .MuiDataGrid-cell": {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                            border: "none",
                        },
                        "& .MuiDataGrid-footerContainer": {
                            border: "none",
                        },
                        "& .MuiDataGrid-virtualScroller": {
                            overflow: "hidden",
                        },
                        "& .MuiDataGrid-columnHeader": {
                            border: "none",
                        },
                        "& .MuiDataGrid-row--borderBottom .MuiDataGrid-columnHeader": {
                            borderBottom: "none",
                        },
                        "& .MuiDataGrid-columnHeaders .MuiDataGrid-columnSeparator": {
                            visibility: "hidden",
                        },
                    }}
                />
            </Paper>
        );
    }

    const completedAchievements = achievements.filter((a) => a.completed).length;
    const inProgressAchievements = achievements.filter(
        (a) => a.progress > 0 && !a.completed,
    ).length;

    const pieData = [
        { name: "Completed", value: completedAchievements },
        { name: "In Progress", value: inProgressAchievements },
    ];

    if (!user || !profile) {
        return <></>;
    }

    return (
        <Container sx={{ padding: 2 }}>
            <Grid container direction="column" spacing={3}>
                <Grid item xs={12}>
                    <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <Typography variant="h3">Profile</Typography>
                        </Grid>
                        <Grid item>
                            <Button href="/update-profile" variant="contained" color="secondary">
                                EDIT PROFILE
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Profile Information */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item>
                                <Avatar></Avatar>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5">
                                    {profile.first_name} {profile.last_name}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} mt={2}>
                            {profile.profile_bio || ""}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Achievements */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Grid item container spacing={2} justifyContent="space-between">
                            <Grid item xs={12} sm={6}>
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    height="100%"
                                >
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, value }) => `${name} (${value})`}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    height="100%"
                                >
                                    <AchievementTree
                                        filledCount={achievements.reduce(
                                            (sum, achievement) =>
                                                sum +
                                                Math.floor(
                                                    (achievement.progress /
                                                        achievement.max_progress) *
                                                        3,
                                                ),
                                            0,
                                        )}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Profile Information */}

                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h5">Teams</Typography>

                        {/* Team Cards */}
                        {loadingProjects ? (
                            <Skeleton variant="rounded" width={"100%"} height={dataTableHeight} />
                        ) : (
                            <DataTable />
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
