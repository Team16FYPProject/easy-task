"use client";
import { useRouter } from "next/navigation";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";
import {
    Container,
    Grid,
    Typography,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Skeleton,
    Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import React from "react";
import { ApiResponse, Reminder, ProjectTask, Project } from "@/utils/types";

export default function Notifications() {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const [displayedNotifications, setDisplayedNotifications] = React.useState<Reminder[]>([]);
    const [projects, setProjects] = React.useState<Map<string, Project>>(new Map());
    const [loadingNotifications, setLoadingNotifications] = React.useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            router.push("/login");
            return;
        }
    }, [loadingUser, user]);

    // Fetch notifications and projects
    const [debugInfo, setDebugInfo] = useState<string>("");

    useEffect(() => {
        async function fetchData() {
            if (!user) {
                setError("User not authenticated");
                setLoadingNotifications(false);
                setDebugInfo("No user detected");
                return;
            }

            setLoadingNotifications(true);
            setError(null);

            try {
                // Fetch notifications
                setDebugInfo("Fetching notifications...");
                const notificationsResponse = await fetch(`/api/notifications`, {
                    method: "GET",
                });

                setDebugInfo(`Notifications response status: ${notificationsResponse.status}`);

                if (!notificationsResponse.ok) {
                    throw new Error(`HTTP error! status: ${notificationsResponse.status}`);
                }

                const notificationsResult: ApiResponse<Reminder[]> =
                    await notificationsResponse.json();
                setDebugInfo(`Notifications result: ${JSON.stringify(notificationsResult)}`);

                if (!notificationsResult.success) {
                    throw new Error(
                        (notificationsResult.data as string) || "Unable to fetch notifications",
                    );
                }

                setDisplayedNotifications(notificationsResult.data);
                setDebugInfo(`Number of notifications: ${notificationsResult.data.length}`);

                // ... (rest of the function remains the same)
            } catch (e) {
                console.error("Error:", e);
                setError(e instanceof Error ? e.message : "An unexpected error occurred");
                setDebugInfo(`Error occurred: ${e instanceof Error ? e.message : "Unknown error"}`);
            } finally {
                setLoadingNotifications(false);
            }
        }

        void fetchData();
    }, [user]);

    // If user is not logged in, return empty
    if (!user) {
        return <></>;
    }

    // Generate table row function
    function generateRowFunction(reminders: Reminder[]): React.ReactNode {
        if (!reminders || reminders.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={3}>No notifications found</TableCell>
                </TableRow>
            );
        }
        return reminders.map((reminder: Reminder) => {
            const notificationDate = new Date(reminder.reminder_datetime);
            const dueDate = new Date(reminder.task.task_deadline);
            const today = new Date();
            const diffTime = Math.abs(dueDate.getTime() - today.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const project = projects.get(reminder.task.project_id);

            return (
                <TableRow key={reminder.reminder_id}>
                    <TableCell>{notificationDate.toLocaleDateString()}</TableCell>
                    <TableCell>
                        {project ? project.project_name : reminder.task.project_id}
                    </TableCell>
                    <TableCell>
                        {`${reminder.task.task_name} is due in ${diffDays} days (on ${dueDate.toLocaleDateString()}). `}
                        {reminder.task.task_is_meeting && `This is a meeting. `}
                        {reminder.task.task_location &&
                            `Location: ${reminder.task.task_location}. `}
                        {`Priority: ${reminder.task.task_priority}.`}
                    </TableCell>
                </TableRow>
            );
        });
    }

    return (
        <Container sx={{ padding: 2 }}>
            <Grid container direction="column" spacing={2}>
                {/* Page Title */}
                <Grid item xs={12}>
                    <Typography variant="h3">Notifications</Typography>
                </Grid>

                {/* Error Message */}
                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error">{error}</Alert>
                    </Grid>
                )}

                {/* Notifications Table */}
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="notifications table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Notification Date</TableCell>
                                    <TableCell>Project</TableCell>
                                    <TableCell>Task Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingNotifications
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
                                          </TableRow>
                                      ))
                                    : generateRowFunction(displayedNotifications)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
            {/* Debug Info*/}
            {/* <Typography variant="h6">Debug Information</Typography>
            <pre>{debugInfo}</pre> */}
        </Container>
    );
}
