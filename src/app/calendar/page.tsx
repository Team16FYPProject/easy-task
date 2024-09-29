"use client";

import { useRouter } from "next/navigation";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";
import { determineBgColor, determineTextColor } from "@/utils/colourUtils";
import { Container, Grid, Typography } from "@mui/material";
// import AddTaskModal from "@/components/AddTaskModal";
import React, { useEffect, useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Task } from "@/app/calendar/types";
import moment from "moment";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";

export default function CalendarView() {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    // const handleClose = () => setOpen(false);
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [taskEventsList, setTaskEventsList] = React.useState<any[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const localizer = momentLocalizer(moment);
    // const [newTask, setNewTask] = useState("");
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());

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
                const events = transformTasksToEvents(allTasks);
                setTaskEventsList(events);
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
            }),
        );
    };

    const handleSelectEvent = (event: any) => {
        console.log("Selected event:", event);
        // You can add logic here to show event details or edit the event
    };

    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        console.log("Selected slot:", start, end);
        // You can add logic here to create a new event
        handleOpen(); // This will open your AddTaskModal
    };

    const EventComponent = ({ event }: { event: any }) => {
        const bgColor = determineBgColor(event.task_priority);
        const textColor = determineTextColor(event.task_priority);
        console.log(bgColor);
        return (
            <div
                style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    padding: "2px 2px",
                    borderRadius: "2px",
                    fontSize: "0.6em",
                    outline: "none",
                    boxShadow: "none",
                }}
            >
                <strong>{event.title}</strong>
                <div>{event.start.toLocaleDateString()}</div> {/* Display the due date */}
            </div>
        );
    };

    const eventStyleGetter = (
        event: { task_priority: String },
        start: any,
        end: any,
        isSelected: any,
    ) => {
        const bgColor = determineBgColor(event.task_priority);
        const style = {
            backgroundColor: bgColor || "#3174ad",
            borderRadius: "3px",
            opacity: 0.8,
            color: "white",
            border: "none",
            display: "block",
        };
        return {
            style: style,
        };
    };

    // If user is not logged in, return empty fragment
    if (!user) {
        return <></>;
    }

    return (
        <Container sx={{ padding: 3 }}>
            <Grid container direction="column" spacing={2}>
                {/* Title and Create Team Button */}
                <Grid item xs={12}>
                    <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <Typography variant="h4">Calendar View</Typography>
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
                    <Calendar
                        localizer={localizer}
                        events={taskEventsList}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: "calc(100vh - 200px)", minHeight: 200 }}
                        view={view}
                        // onView={setView}
                        date={date}
                        onNavigate={setDate}
                        defaultView={Views.MONTH}
                        views={["month", "week", "day"]}
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        selectable
                        popup
                        components={{
                            event: EventComponent,
                        }}
                        eventPropGetter={eventStyleGetter}
                    />
                </Grid>
            </Grid>
        </Container>
    );
}
