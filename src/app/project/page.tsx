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
import TeamCard from "@/components/TeamCard";
import { useEffect, useState } from "react";
import type { ApiResponse, DashboardResponse, ProfileResponse, ProjectTask } from "@/utils/types";
import { useAchievements } from "@/hooks/useAchievements";
import React from "react";
import { Project } from "@/utils/types";
import { RowData, TeamViewData } from "../dashboard/types";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AddTeamModal from "@/components/AddTeamModal";

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

export default function ProjectPage() {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const { achievements, loading: loadingAchievements } = useAchievements(user?.id || "");
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [rows, setRows] = useState<RowData[]>([]);
    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
        if (user) {
            const response = await fetch("/api/user/profile");
            const data: ApiResponse<ProfileResponse> = await response.json();
            if (!data.success) {
                alert("Unable to load your project data.");
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

    // Handle card click for Team Cards
    function handleCardClick(projectId: string): void {
        router.push(`/team/${projectId}`);
    }

    if (!user || !profile) {
        return <></>;
    }

    return (
        <Container sx={{ padding: 2 }}>
            <Grid container direction="column" spacing={3}>
                <Grid item xs={12}>
                    <Grid container spacing={1} alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <Typography variant="h3">Projects</Typography>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="secondary" onClick={handleOpen}>
                                CREATE PROJECT
                            </Button>
                            <AddTeamModal open={open} handleClose={handleClose} />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        {loadingProjects ? (
                            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                                <Typography>Loading projects...</Typography>
                            </Box>
                        ) : projects.length > 0 ? (
                            <Grid container spacing={2}>
                                {projects.map((project) => (
                                    <Grid item xs={12} sm={6} md={4} key={project.project_id}>
                                        <ButtonBase
                                            onClick={() => handleCardClick(project.project_id)}
                                        >
                                            <TeamCard
                                                title={project.project_name}
                                                image="/GroupIcon.png"
                                            />
                                        </ButtonBase>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                                <Typography>You are not part of any projects.</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
