"use client";

import { useRouter } from "next/navigation";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";

import {
    Box,
    Button,
    ButtonGroup,
    Container,
    Grid,
    Pagination,
    Paper,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import AddTeamModal from "@/components/AddTeamModal";
import React, { useEffect, useState } from "react";
import { a } from "vitest/dist/chunks/suite.CcK46U-P.js";
import { zhCN } from "@mui/material/locale";
import { PieChart } from "@mui/x-charts";

// Interface for Project
interface Project {
    project_id: string;
    project_name: string;
    project_desc: string;
    project_owner_id: string;
    project_profile_pic: string | null;
}

// Interface for Task
interface Task {
    task_id: number;
    project_id: string;
    project_name: string;
    task_name: string;
    task_desc: string;
    task_deadline: string;
    task_time_spent: string;
    task_creator_id: string;
    task_status: string;
    task_priority: string;
}

export default function ListView() {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);

    // Redirect to login if user is not logged in
    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
    }, [loadingUser, user]);

    // Fetch tasks
    useEffect(() => {
        async function fetchTasks() {
            try {
                setLoadingTasks(true);
                const response = await fetch("/api/projects", {
                    method: "GET",
                    credentials: "include",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.data || "Failed to fetch projects");
                }

                const projectIDs = result.projects.map(
                    (project: { project_id: any }) => project.project_id,
                );
                const fetchPromises = projectIDs.map((project_id: any) =>
                    fetch(`/api/projects/${project_id}/tasks`, {
                        method: "GET",
                        credentials: "include",
                    }).then((response) => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    }),
                );

                const results = await Promise.all(fetchPromises);
                const allTasks = results.flatMap((result) => result.tasks);
                setTasks(allTasks);
                console.log("All Tasks: ", allTasks);
            } catch (e) {
                console.error("Error:", e);
            } finally {
                setLoadingTasks(false);
            }
        }

        fetchTasks();
    }, []);

    // If user is not logged in, return empty fragment
    if (!user) {
        return <></>;
    }

    // Generate rows for the table
    function generateRowFunction(tasks: Task[]): React.ReactNode {
        return tasks.map((task, index) => (
            <TableRow key={index}>
                <TableCell>{task.task_deadline}</TableCell>
                <TableCell>{task.project_name + ": " + task.task_name}</TableCell>
                <TableCell>{task.task_priority}</TableCell>
                <TableCell>{task.task_creator_id}</TableCell>
                <TableCell>{task.task_status}</TableCell>
            </TableRow>
        ));
    }

    return (
        <Container sx={{ padding: 6 }}>
            <Grid container direction="column" spacing={2}>
                {/* Title and Create Team Button */}
                <Grid item xs={12}>
                    <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <Typography variant="h4">List View</Typography>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="secondary" onClick={handleOpen}>
                                ADD TASK
                            </Button>
                            <AddTeamModal open={open} handleClose={handleClose} />
                        </Grid>
                    </Grid>
                </Grid>
                {/* Insights */}
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={6}>
                            {/* stats chart */}
                            <PieChart
                                series={[
                                    {
                                        data: [
                                            {
                                                id: 0,
                                                value: 10,
                                                color: "primary",
                                                label: "Completed",
                                            },
                                            {
                                                id: 1,
                                                value: 15,
                                                color: "secondary",
                                                label: "In Progress",
                                            },
                                            {
                                                id: 2,
                                                value: 20,
                                                color: "tertiary",
                                                label: "Not Started",
                                            },
                                        ],
                                        innerRadius: 30,
                                        outerRadius: 100,
                                        paddingAngle: 5,
                                        cornerRadius: 5,
                                        startAngle: 0,
                                        endAngle: 360,
                                        cx: 150,
                                        cy: 150,
                                    },
                                ]}
                                slotProps={
                                    {
                                        // pieCenter: {
                                        //     pieCenterLabel: "XX Achievements",
                                        //     fontSize: 15,
                                        // },
                                    }
                                }
                                width={400}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            {/* stats chart */}
                            <PieChart
                                series={[
                                    {
                                        data: [
                                            {
                                                id: 0,
                                                value: 10,
                                                color: "primary",
                                                label: "Completed",
                                            },
                                            {
                                                id: 1,
                                                value: 15,
                                                color: "secondary",
                                                label: "In Progress",
                                            },
                                            {
                                                id: 2,
                                                value: 20,
                                                color: "tertiary",
                                                label: "Not Started",
                                            },
                                        ],
                                        innerRadius: 30,
                                        outerRadius: 100,
                                        paddingAngle: 5,
                                        cornerRadius: 5,
                                        startAngle: 0,
                                        endAngle: 360,
                                        cx: 150,
                                        cy: 150,
                                    },
                                ]}
                                slotProps={
                                    {
                                        // pieCenter: {
                                        //     pieCenterLabel: "XX Achievements",
                                        //     fontSize: 15,
                                        // },
                                    }
                                }
                                width={400}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                {/* Upcoming Tasks Table */}
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date and Time</TableCell>
                                    <TableCell>Team/Task</TableCell>
                                    <TableCell>Priority</TableCell>
                                    <TableCell>Meeting</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingTasks
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
                                    : generateRowFunction(tasks)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Container>
    );
}
