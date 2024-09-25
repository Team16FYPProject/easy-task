"use client";

import { useRouter } from "next/navigation";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";

import {
    Button,
    Chip,
    Container,
    Grid,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from "@mui/material";
import AddTeamModal from "@/components/AddTeamModal";
import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts";
import { Task } from "./types";

export default function ListView() {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [pieChartProgressData, setPieChartProgressData] = useState<
        { id: number; value: number; color: string; label: string }[]
    >([]);
    const [pieChartAssignmentData, setPieChartAssignmentData] = useState<
        { id: number; value: number; color: string; label: string }[]
    >([]);
    const theme = useTheme(); // Access the MUI theme

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

                // Fetch projects and their names
                const projectIDsAndNames = result.projects.map(
                    (project: { project_id: any; project_name: string }) => ({
                        project_id: project.project_id,
                        project_name: project.project_name,
                    }),
                );

                // Fetch tasks for each project
                const fetchPromises = projectIDsAndNames.map(
                    ({ project_id, project_name }: { project_id: string; project_name: string }) =>
                        fetch(`/api/projects/${project_id}/tasks`, {
                            method: "GET",
                            credentials: "include",
                        }).then((response) => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            return response.json().then((data) => ({
                                tasks: data.tasks,
                                project_name,
                            }));
                        }),
                );

                const results = await Promise.all(fetchPromises);
                // Flatten the results and include project names with tasks
                const allTasks = results.flatMap(({ tasks, project_name }) =>
                    tasks.map((task: any) => ({ ...task, project_name })),
                );
                setTasks(allTasks);
            } catch (e) {
                console.error("Error:", e);
            } finally {
                setLoadingTasks(false);
            }
        }

        fetchTasks();
    }, []);

    useEffect(() => {
        // Count the number of tasks in each status
        const statusCounts = tasks.reduce(
            (counts, task) => {
                if (task.task_status === "COMPLETE") {
                    counts.completed += 1;
                } else if (task.task_status === "DOING") {
                    counts.inProgress += 1;
                } else if (task.task_status === "TODO") {
                    counts.notStarted += 1;
                }
                return counts;
            },
            { completed: 0, inProgress: 0, notStarted: 0 },
        );

        // Count the number of tasks in each status
        const assignmentCounts = tasks.reduce(
            (counts, task) => {
                if (task.assignees.length > 0) {
                    counts.assigned += 1;
                } else if (task.assignees.length == 0) {
                    counts.notAssigned += 1;
                }
                return counts;
            },
            { assigned: 0, notAssigned: 0 },
        );

        // Update the pie chart data
        setPieChartProgressData([
            {
                id: 0,
                value: statusCounts.completed,
                color: theme.palette.secondary.main,
                label: "Completed",
            },
            {
                id: 1,
                value: statusCounts.inProgress,
                color: theme.palette.tertiary?.main,
                label: "In Progress",
            },
            {
                id: 2,
                value: statusCounts.notStarted,
                color: theme.palette.primary.main,
                label: "Not Started",
            },
        ]);
        // Update the pie chart data
        setPieChartAssignmentData([
            {
                id: 0,
                value: assignmentCounts.assigned,
                color: theme.palette.secondary.main,
                label: "Assigned",
            },
            {
                id: 1,
                value: assignmentCounts.notAssigned,
                color: theme.palette.primary.main,
                label: "Not Assigned",
            },
        ]);
    }, [tasks]);

    // If user is not logged in, return empty fragment
    if (!user) {
        return <></>;
    }

    const determineBgColor = (task_priority: String) => {
        if (task_priority === "LOW") {
            return "bg-green-200";
        } else if (task_priority === "MEDIUM") {
            return "bg-yellow-200";
        } else {
            return "bg-red-400";
        }
    };

    // Generate rows for the table
    function generateRowFunction(tasks: Task[]): React.ReactNode {
        return tasks.map((task, index) => (
            <TableRow key={index}>
                <TableCell>
                    {new Intl.DateTimeFormat("en-AU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    }).format(new Date(task.task_deadline))}
                </TableCell>
                <TableCell>{task.project_name + ": " + task.task_name}</TableCell>
                <TableCell>
                    <Chip
                        className={`${determineBgColor(task.task_priority)}`}
                        label={task.task_priority}
                    />
                </TableCell>
                <TableCell>{task.task_is_meeting ? "Yes" : "No"}</TableCell>
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
                        <Grid item xs={12} sm={6} md={6} style={{ height: "300px" }}>
                            {/* stats chart */}
                            <PieChart
                                series={[
                                    {
                                        data: pieChartProgressData,
                                        innerRadius: 70,
                                        outerRadius: 100,
                                        paddingAngle: 1,
                                        cornerRadius: 1,
                                        startAngle: 0,
                                        endAngle: 360,
                                        cx: 150,
                                        cy: 150,
                                        arcLabel: (item) => `${item.value}`,
                                        arcLabelMinAngle: 35,
                                        arcLabelRadius: "40%",
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
                                // height={200}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            {/* stats chart */}
                            <PieChart
                                series={[
                                    {
                                        data: pieChartAssignmentData,
                                        innerRadius: 70,
                                        outerRadius: 100,
                                        paddingAngle: 1,
                                        cornerRadius: 1,
                                        startAngle: 0,
                                        endAngle: 360,
                                        cx: 150,
                                        cy: 150,
                                        arcLabel: (item) => `${item.value}`,
                                        arcLabelMinAngle: 35,
                                        arcLabelRadius: "40%",
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
                                // height={200}
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
                                    <TableCell>Due Date</TableCell>
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
