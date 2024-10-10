import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Grid, Paper, Chip, Button, TextField } from "@mui/material";
import { ProjectTask } from "@/utils/types";
import EditTaskModal from "@/components/EditTaskModal";
import { determineBgColor } from "@/utils/colourUtils";

interface ViewTaskModalProps {
    open: boolean;
    handleCloseModal: () => void;
    task: ProjectTask;
    updateTask: (updatedTask: ProjectTask) => void;
}

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({
    open,
    handleCloseModal,
    task,
    updateTask,
}) => {
    const [currentTask, setCurrentTask] = React.useState(task);

    const modalStyle = {
        position: "absolute" as "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600,
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
    };

    const sectionStyle = {
        borderBottom: "1px solid #e0e0e0",
        py: 2,
    };

    const [taskOpen, setOpen] = React.useState(false);
    const [taskEditOpen, setEditOpen] = React.useState(false);
    const handleOpenEditModal = () => setEditOpen(true);
    const handleEditClose = () => setEditOpen(false);

    // const handleOpen = () => setOpen(true);
    // const handleClose = () => setOpen(false);
    const bgColor = determineBgColor(currentTask.task_priority);
    const [hoursToLog, setHoursToLog] = useState(1);

    const handleLogClick = async () => {
        try {
            const route = `/api/projects/${currentTask.project_id}/tasks/${currentTask.task_id}/logged_hours`;
            await fetch(route, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    task_logged_hours: currentTask.task_time_spent + hoursToLog,
                }),
            });
            const updatedTask = {
                ...currentTask,
                task_time_spent: currentTask.task_time_spent + hoursToLog,
            };
            setCurrentTask(updatedTask);
            updateTask(updatedTask);
        } catch (e) {
            console.error(`Error updating logged hours for project ${currentTask.project_id}:`, e);
        }
    };

    // getting reminder data
    useEffect(() => {
        const fetchReminders = async () => {
            const response = await fetch(`/api/tasks/${currentTask.task_id}/reminders`);
            const data = await response.json();
            if (data.success) {
                setCurrentTask({ ...currentTask, reminders: data.data });
            }
        };

        if (open) {
            fetchReminders();
        }
    }, [open, currentTask.task_id]);

    return (
        <Modal open={open} onClose={handleCloseModal}>
            <Box sx={modalStyle}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {`${currentTask.task_name}`}
                </Typography>

                <Box sx={sectionStyle}>
                    <Typography variant="body2" color="text.secondary">
                        {"Parent Task: " + (currentTask.task_parent_id || "No parent task")}
                    </Typography>
                </Box>

                <Box sx={sectionStyle}>
                    <Typography variant="body1">{currentTask.task_desc}</Typography>
                </Box>

                <Grid container spacing={2} sx={sectionStyle}>
                    <Grid item xs={6}>
                        <Typography variant="body2">Status: {currentTask.task_status}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2">
                            Priority:{" "}
                            <Chip
                                label={currentTask.task_priority}
                                sx={{ backgroundColor: bgColor }}
                                size="small"
                            />
                        </Typography>
                    </Grid>
                </Grid>

                {/* Reminders */}
                <Grid container spacing={2} sx={sectionStyle}>
                    <Grid item xs={6}>
                        <Typography variant="body2">
                            Deadline:{" "}
                            {new Date(currentTask.task_deadline).toLocaleString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            })}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2">
                            Location: {currentTask.task_location}
                        </Typography>
                    </Grid>
                </Grid>

                {/* Logging Hours */}
                <Grid container spacing={2} sx={sectionStyle}>
                    <Grid item xs={6}>
                        <Typography variant="body2">
                            Hours Logged: {currentTask.task_time_spent.toFixed(2)}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TextField
                            type="number"
                            label="Add Hours"
                            value={hoursToLog}
                            onChange={(e) => setHoursToLog(Math.max(0, Number(e.target.value)))}
                            inputProps={{ min: 0, step: 0.5 }}
                            sx={{ width: 100 }}
                            size="small"
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleLogClick}
                            size="small"
                        >
                            LOG HOURS
                        </Button>
                    </Grid>
                </Grid>

                <Box sx={{ ...sectionStyle, borderBottom: "none" }}>
                    <Typography variant="h6" gutterBottom>
                        Reminders
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        {currentTask.reminders && currentTask.reminders.length > 0 ? (
                            <Typography variant="body2">
                                Reminder set for:{" "}
                                {new Date(
                                    currentTask.reminders[0].reminder_datetime,
                                ).toLocaleString([], {
                                    // ...
                                })}
                            </Typography>
                        ) : (
                            <Typography>No reminders set</Typography>
                        )}
                    </Paper>
                </Box>

                <Box sx={{ ...sectionStyle, borderBottom: "none" }}>
                    <Typography variant="h6" gutterBottom>
                        Assignees
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        {currentTask.assignees &&
                        Array.isArray(currentTask.assignees) &&
                        currentTask.assignees.length > 0 ? (
                            <ul>
                                {currentTask.assignees.map((assignee, index) => (
                                    <li key={index}>
                                        <Typography variant="body2">
                                            {"Name: " +
                                                assignee.user.name +
                                                " | Email: " +
                                                assignee.user.email}
                                        </Typography>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Typography>No assignees</Typography>
                        )}
                    </Paper>
                </Box>

                <Box
                    sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                        alignItems: "center",
                    }}
                >
                    <Button variant="contained" color="secondary" onClick={handleOpenEditModal}>
                        EDIT TASK
                    </Button>
                    <EditTaskModal
                        open={taskEditOpen}
                        handleCloseModal={handleEditClose}
                        task={currentTask}
                        updateTask={(updatedTask) => {
                            setCurrentTask(updatedTask);
                            updateTask(updatedTask);
                        }}
                    />
                </Box>
            </Box>
        </Modal>
    );
};

export default ViewTaskModal;
