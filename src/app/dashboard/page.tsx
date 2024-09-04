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

// Interface for Project
interface Project {
    project_id: string;
    project_name: string;
    project_desc: string;
    project_owner_id: string;
    project_profile_pic: string | null;
}

// Data Table row data
type TeamViewData = [string, string] | undefined;

// Interface for Data Table rows
interface RowData {
    id: number;
    teamView1: TeamViewData;
    teamView2: TeamViewData;
    teamView3: TeamViewData;
}

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
    const [tasks, setTasks] = useState([]);
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
                console.log("Projects:", projects);
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
        console.log("Projects updated:", projects);
        const newRows: RowData[] = [];
        for (let i = 0; i < Math.ceil(projects.length / 3); i++) {
            const rowData: RowData = {
                id: i + 1,
                teamView1: undefined,
                teamView2: undefined,
                teamView3: undefined,
            };

            for (let j = 0; j < 3; j++) {
                const projectIndex = i * 3 + j;
                if (projectIndex < projects.length) {
                    const project = projects[projectIndex];
                    const viewKey = `teamView${j + 1}` as keyof Omit<RowData, "id">;
                    rowData[viewKey] = [project.project_name, project.project_id];
                }
            }

            newRows.push(rowData);
        }
        setRows(newRows);
    }, [projects]);

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

    // Generate rows for Upcoming Tasks Table
    function generateRowFunction(tasks: never[]): React.ReactNode {
        throw new Error("Function not implemented.");
    }

    // Handle card click for Team Cards
    function handleCardClick(projectId: any): void {
        router.push(`/team/${projectId}`);
    }

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
                            <Button variant="contained" color="secondary" fullWidth>
                                CALENDAR VIEW
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Button variant="contained" color="secondary" fullWidth>
                                LIST VIEW
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Button variant="contained" color="secondary" fullWidth>
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
