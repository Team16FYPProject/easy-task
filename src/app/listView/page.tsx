"use client";

import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";
import { determineBgColor, determineTextColor } from "@/utils/colourUtils";
import { useRouter } from "next/navigation";

import AddTaskModal from "@/components/AddTaskModal";
import ViewTaskModal from "@/components/ViewTaskModal";
import { ProjectTask } from "@/utils/types";
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
import { PieChart } from "@mui/x-charts";
import React, { useEffect, useState } from "react";
import SelectTeamModal from "@/components/SelectTeamModal";

export default function ListView() {
    const [createNewTask, setCreateNewTask] = useState(false);
    const [currentProjectID, setCurrentProjectID] = useState("");
    const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
    const [updatedTask, setUpdatedTask] = useState<ProjectTask | null>(null);
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [tasks, setTasks] = React.useState<ProjectTask[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [pieChartProgressData, setPieChartProgressData] = useState<
        { id: number; value: number; color: string; label: string }[]
    >([]);
    const [allProjects, setAllProjects] = React.useState<
        { project_id: string; project_name: string }[]
    >([]);
    const [pieChartAssignmentData, setPieChartAssignmentData] = useState<
        { id: number; value: number; color: string; label: string }[]
    >([]);
    const theme = useTheme(); // Access the MUI theme
    const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);

    const handleCreateTaskModalClose = () => {
        setCreateNewTask(false);
        handleClose();
    };
    // Redirect to login if user is not logged in
    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
    }, [loadingUser, user]);

    async function fetchTasksForCurrentProject(project_id: string) {
        try {
            const route = `/api/projects/${project_id}/tasks`;
            const response = await fetch(route, {
                method: "GET",
                credentials: "include",
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.data || "Failed to fetch tasks");
            }
            return result.tasks;
        } catch {
            return [];
        }
    }

    // Everytime our ProjectID is set, fetch the respective tasks from database
    useEffect(() => {
        async function loadTasks() {
            if (currentProjectID) {
                const tasks = await fetchTasksForCurrentProject(currentProjectID);
                setProjectTasks(tasks);
            }
        }
        loadTasks();
    }, [currentProjectID]);

    // Everytime we update a task, append to our tasks array
    useEffect(() => {
        async function updateTasks() {
            if (updatedTask) {
                const newUpdatedTasks = [...tasks, updatedTask];
                setTasks(newUpdatedTasks);
            }
        }
        updateTasks();
    }, [updatedTask]);

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
                    (project: { project_id: string; project_name: string }) => ({
                        project_id: project.project_id,
                        project_name: project.project_name,
                    }),
                );
                setAllProjects(projectIDsAndNames);
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
                console.log(fetchPromises);

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
    }, [
        tasks,
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.tertiary?.main,
    ]);

    const [viewTaskOpen, setViewTaskOpen] = React.useState(false); // state for modal task view
    const handleRowClick = (task: ProjectTask) => {
        setSelectedTask(task);
        setViewTaskOpen(true);
    };

    const handleCloseModal = () => {
        setViewTaskOpen(false);
    };

    // If user is not logged in, return empty fragment
    if (!user) {
        return <></>;
    }

    // Generate rows for the table
    function generateRowFunction(tasks: ProjectTask[]): React.ReactNode {
        // Sort tasks by date
        const sortedTasks = tasks.sort(
            (a, b) => new Date(a.task_deadline).getTime() - new Date(b.task_deadline).getTime(),
        );

        return sortedTasks.map((task, index) => (
            <TableRow key={index} onClick={() => handleRowClick(task)}>
                <TableCell>
                    {new Intl.DateTimeFormat("en-AU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    }).format(new Date(task.task_deadline))}
                </TableCell>
                <TableCell>{task.task_name}</TableCell>
                <TableCell>
                    <Chip
                        style={{
                            backgroundColor: determineBgColor(task.task_priority),
                            color: determineTextColor(task.task_priority),
                        }}
                        label={task.task_priority}
                    />
                </TableCell>
                <TableCell>{task.task_is_meeting ? "Yes" : "No"}</TableCell>
                <TableCell>{task.task_status}</TableCell>
            </TableRow>
        ));
    }

    return (
        <Container sx={{ padding: 2 }}>
            <Grid container direction="column" spacing={0}>
                {/* Title and Create Team Button */}
                <Grid item xs={12}>
                    <Grid container spacing={0} alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <Typography variant="h4">List View</Typography>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="secondary" onClick={handleOpen}>
                                CREATE TASK
                            </Button>
                            <AddTaskModal
                                open={createNewTask}
                                handleClose={handleCreateTaskModalClose}
                                project_id={currentProjectID}
                                setUpdatedTask={setUpdatedTask}
                                projectTasks={projectTasks}
                            ></AddTaskModal>
                            <SelectTeamModal
                                open={open}
                                setNewProject={setCurrentProjectID}
                                handleClose={handleClose}
                                allProjects={allProjects}
                                setCreateTask={setCreateNewTask}
                            ></SelectTeamModal>
                        </Grid>
                    </Grid>
                </Grid>
                {/* Insights */}
                <Grid item xs={12}>
                    <Grid container spacing={0}>
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
                                width={400}
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
                                    <TableCell>Due Date</TableCell>
                                    <TableCell>Project/Task</TableCell>
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
            {viewTaskOpen && selectedTask && (
                <ViewTaskModal
                    open={viewTaskOpen}
                    handleCloseModal={handleCloseModal}
                    task={selectedTask}
                    updateTask={(updatedTask) => setUpdatedTask(updatedTask)}
                    handleDeleteTask={function (taskId: string): void {
                        throw new Error("Function not implemented.");
                    }}
                />
            )}
        </Container>
    );
}
