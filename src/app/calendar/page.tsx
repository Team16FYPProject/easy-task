"use client";

import { useRouter } from "next/navigation";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";
import { determineBgColor, determineTextColor } from "@/utils/colourUtils";
import { Button, Container, Grid, Paper, Typography } from "@mui/material";
// import AddTaskModal from "@/components/AddTaskModal";
import React, { useEffect, useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { momentLocalizer, Views } from "react-big-calendar";
import MUICalendar from "@/components/MUICalendar";
import ViewTaskModal from "@/components/ViewTaskModal";
import { ProjectTask } from "@/utils/types";

export default function CalendarView() {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    // const handleClose = () => setOpen(false);
    const [tasks, setTasks] = React.useState<ProjectTask[]>([]);
    const [taskEventsList, setTaskEventsList] = React.useState<any[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const localizer = momentLocalizer(moment);
    // const [newTask, setNewTask] = useState("");
    const [view, setView] = useState<"month" | "week" | "day">(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const [openedTask, setOpenedTask] = useState<ProjectTask | null>(null);
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
                console.log(allTasks);
            } catch (e) {
                console.error("Error:", e);
            } finally {
                setLoadingTasks(false);
            }
        }

        fetchTasks();
    }, []);

    const transformTasksToEvents = (tasks: any[]) => {
        return tasks.map(
            (task: {
                task_id: any;
                task_name: any;
                project_name: any;
                task_deadline: string | number | Date;
                task_priority: any;
            }) => ({
                id: task.task_id, // If available
                title: `${task.task_name} (${task.project_name})`,
                start: new Date(task.task_deadline),
                end: new Date(task.task_deadline),
                resource: task.project_name, // Optional, can be used for grouping or coloring
                task_priority: task.task_priority,
                task: task,
            }),
        );
    };

    useEffect(() => {
        const events = transformTasksToEvents(tasks);
        setTaskEventsList(events);
    }, [tasks]);

    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        console.log("Selected slot:", start, end);
        // You can add logic here to create a new event
        handleOpen(); // This will open your AddTaskModal
    };

    async function updateTask(task: ProjectTask) {
        setTasks((_tasks) =>
            _tasks.map((_task) => {
                if (_task.task_id !== task.task_id) return _task;
                return {
                    ..._task,
                    ...task,
                };
            }),
        );
    }

    const EventComponent = ({ event }: { event: any }) => {
        const bgColor = determineBgColor(event.task_priority);
        const textColor = determineTextColor(event.task_priority);
        return (
            <Paper
                elevation={1}
                sx={{
                    p: 1,
                    backgroundColor: (theme) => bgColor || theme.palette.primary.main,
                    color: (theme) => textColor || theme.palette.primary.contrastText,
                    padding: "2px 2px",
                    borderRadius: "2px",
                    outline: "none",
                }}
            >
                <Typography sx={{ fontSize: "0.6em", fontWeight: "bold" }}>
                    {event.title}
                </Typography>
                <Typography sx={{ fontSize: "0.6em" }}>
                    {event.start.toLocaleDateString()}
                </Typography>
            </Paper>
        );
    };

    const eventStyleGetter = (
        event: { task_priority?: string },
        start: any,
        end: any,
        isSelected: any,
    ) => {
        const bgColor = determineBgColor(event.task_priority || "");
        const textColor = determineTextColor(event.task_priority || "");
        const style = {
            backgroundColor: bgColor || "#3174ad",
            borderRadius: "3px",
            opacity: 0.8,
            color: textColor || "#ffffff",
            border: "none",
            display: "block",
        };
        return {
            style: style,
        };
    };

    const components = {
        toolbar: (props: {
            onNavigate: (navigate: "PREV" | "NEXT" | "TODAY" | "DATE", date?: Date) => void;
            label:
                | string
                | number
                | bigint
                | boolean
                | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | Promise<React.AwaitedReactNode>
                | null
                | undefined;
        }) => (
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                }}
            >
                <div>
                    <Button variant="contained" onClick={() => props.onNavigate("TODAY")}>
                        Today
                    </Button>
                    <Button variant="contained" onClick={() => props.onNavigate("PREV")}>
                        Back
                    </Button>
                    <Button variant="contained" onClick={() => props.onNavigate("NEXT")}>
                        Next
                    </Button>
                </div>
                <Typography variant="h6">{props.label}</Typography>
                <div>
                    <Button variant="contained" onClick={() => setView(Views.MONTH)}>
                        Month
                    </Button>
                    <Button variant="contained" onClick={() => setView(Views.WEEK)}>
                        Week
                    </Button>
                    <Button variant="contained" onClick={() => setView(Views.DAY)}>
                        Day
                    </Button>
                </div>
            </div>
        ),
        views: {
            month: {
                header: (props: {
                    label:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<React.AwaitedReactNode>
                        | null
                        | undefined;
                }) => <Typography variant="subtitle1">{props.label}</Typography>,
            },
            week: {
                header: (props: {
                    label:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<React.AwaitedReactNode>
                        | null
                        | undefined;
                }) => <Typography variant="subtitle1">{props.label}</Typography>,
            },
            day: {
                header: (props: {
                    label:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<React.AwaitedReactNode>
                        | null
                        | undefined;
                }) => <Typography variant="subtitle1">{props.label}</Typography>,
            },
            // Add more custom components as needed
        },
        month: {
            header: (props: {
                label:
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | Promise<React.AwaitedReactNode>
                    | null
                    | undefined;
            }) => <Typography variant="subtitle1">{props.label}</Typography>,
        },
        week: {
            header: (props: {
                label:
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | Promise<React.AwaitedReactNode>
                    | null
                    | undefined;
            }) => <Typography variant="subtitle1">{props.label}</Typography>,
        },
        day: {
            header: (props: {
                label:
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | Promise<React.AwaitedReactNode>
                    | null
                    | undefined;
            }) => <Typography variant="subtitle1">{props.label}</Typography>,
        },
        // Add more custom components as needed
    };

    // If user is not logged in, return empty fragment
    if (!user) {
        return <></>;
    }

    return (
        <Container sx={{ padding: 2 }}>
            {openedTask && (
                <ViewTaskModal
                    open={true}
                    task={openedTask}
                    handleCloseModal={() => setOpenedTask(null)}
                    updateTask={updateTask}
                />
            )}
            <Grid container direction="column" spacing={2}>
                {/* Title and Create Team Button */}
                <Grid item xs={12}>
                    <Grid container spacing={0} alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <Typography variant="h5">Calendar View</Typography>
                        </Grid>
                        <Grid item>
                            {/* <Button variant="contained" color="secondary" onClick={handleOpen}>
                                ADD TASK
                            </Button> */}
                            {/* <AddTaskModal
                                open={open}
                                handleClose={handleClose}
                                project_id={`${teamId}`}
                                setNewTask={setNewTask}
                            /> */}
                        </Grid>
                    </Grid>
                </Grid>
                {/* Upcoming Tasks Table */}
                <Grid item xs={12}>
                    <MUICalendar
                        localizer={localizer}
                        events={taskEventsList}
                        startAccessor={(event: any) => new Date(event.start)}
                        endAccessor={(event: any) => new Date(event.end)}
                        style={{ height: "calc(100vh - 150px)", minHeight: 200 }}
                        view={view}
                        onView={(view) => setView(view as "month" | "week" | "day")}
                        date={date}
                        onNavigate={setDate}
                        defaultView={Views.MONTH}
                        views={["month", "week", "day"]}
                        onSelectEvent={(event) => setOpenedTask(event.task)}
                        onSelectSlot={handleSelectSlot}
                        selectable
                        popup
                        components={{
                            ...components,
                            event: EventComponent,
                        }}
                        eventPropGetter={eventStyleGetter}
                    />
                </Grid>
            </Grid>
        </Container>
    );
}
