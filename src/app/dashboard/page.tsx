"use client";

import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";

import AddTeamModal from "@/components/AddTeamModal";
import TeamCard from "@/components/TeamCard";
import {
    Button,
    ButtonBase,
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
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { RowData, TeamViewData, Task } from "./types";
import { Project } from "../../utils/lib/types";

export default function Dashboard() {
    const router = useRouter();

    const { loadingUser, user } = useUser();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [rows, setRows] = useState<RowData[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const dataTableHeight = 300;
    const paginationModel = { page: 0, pageSize: 1 };

    // Redirect to login if user is not logged in
    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
    }, [loadingUser, user]);

    // Fetch projects
    useEffect(() => {
        async function fetchProjects() {
            try {
                setLoadingProjects(true);
                const response = await fetch("/api/projects", {
                    method: "GET",
                    credentials: "include",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.data || "Failed to fetch projects");
                }

                if (result.success) {
                    setProjects(result.projects);
                } else {
                    throw new Error("Failed to fetch projects");
                }
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
    // If user is not logged in, return empty fragment
    if (!user) {
        return <></>;
    }

    // Grid Column Definitions
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

    // Data Table component
    function DataTable() {
        const footerHeight = 53; // Approximate height of the footer
        const availableHeight = dataTableHeight - footerHeight;
        return (
            <Paper sx={{ height: dataTableHeight, width: "100%" }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{ pagination: { paginationModel } }}
                    pageSizeOptions={[1]}
                    // sx={{ border: 0 }}
                    disableColumnMenu
                    columnHeaderHeight={0}
                    getRowHeight={() => availableHeight}
                    sx={{
                        border: 0,
                        "& .MuiDataGrid-cell": {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        },
                    }}
                />
            </Paper>
        );
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

    // Handle card click for Team Cards
    function handleCardClick(projectId: any): void {
        router.push(`/team/${projectId}`);
    }

    const onButtonClick = (link: String) => router.push(`/${link}`);
    return (
        <Container sx={{ padding: 6 }}>
            <Grid container direction="column" spacing={2}>
                {/* Title and Create Team Button */}
                <Grid item xs={12}>
                    <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <Typography variant="h4">Teams</Typography>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="secondary" onClick={handleOpen}>
                                CREATE TEAM
                            </Button>
                            <AddTeamModal open={open} handleClose={handleClose} />
                        </Grid>
                    </Grid>
                </Grid>
                {/* Team Cards */}
                <Grid item xs={12}>
                    {loadingProjects ? (
                        <Skeleton variant="rounded" width={"100%"} height={dataTableHeight} />
                    ) : (
                        <DataTable />
                    )}
                </Grid>
                {/* Available Views Title */}
                <Grid item xs={12}>
                    <Typography variant="h4">Available Views</Typography>
                </Grid>
                {/* View Buttons */}
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Button
                                variant="contained"
                                color="secondary"
                                fullWidth
                                onClick={() => onButtonClick("calendar")}
                            >
                                CALENDAR VIEW
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Button
                                variant="contained"
                                color="secondary"
                                fullWidth
                                onClick={() => onButtonClick("listView")}
                            >
                                LIST VIEW
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Button
                                variant="contained"
                                color="secondary"
                                fullWidth
                                onClick={() => onButtonClick("kanban")}
                            >
                                KANBAN VIEW
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
                {/* Upcoming Tasks Title */}
                <Grid item xs={12}>
                    <Typography variant="h4">Upcoming Tasks</Typography>
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
