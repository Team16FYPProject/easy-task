import EditTaskModal from "@/components/EditTaskModal";
import { determineBgColor } from "@/utils/colourUtils";
import { ProjectTask, ReminderType } from "@/utils/types";
import { Box, Button, Chip, Grid, Modal, Paper, TextField, Typography } from "@mui/material";
import React, { useState } from "react";

interface ViewTaskModalProps {
    open: boolean;
    handleCloseModal: () => void;
    task: ProjectTask;
    updateTask: (updatedTask: ProjectTask) => void;
    handleDeleteTask: (taskId: string) => void;
}

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({
    open,
    handleCloseModal,
    task,
    updateTask,
    handleDeleteTask,
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
    const [taskDeleteOpen, setDeleteOpen] = React.useState(false);
    const handleOpenEditModal = () => setEditOpen(true);
    const handleEditClose = () => setEditOpen(false);
    const handleOpenDeleteModal = () => setDeleteOpen(true);
    const handleDeleteClose = () => setDeleteOpen(false);

    const bgColor = determineBgColor(currentTask.task_priority);
    const [hoursToLog, setHoursToLog] = useState(1);

    const handleDelete = () => {
        handleDeleteTask(task.task_id);
    };

    const handleLogClick = async () => {
        try {
            const route = `/api/projects/${currentTask.project_id}/tasks/${currentTask.task_id}`;
            await fetch(route, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    taskTimeSpent: currentTask.task_time_spent + hoursToLog,
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

    function getReminderDisplayValue(type: string): string {
        switch (type) {
            case "OneHour":
                return ReminderType.OneHour;
            case "OneDay":
                return ReminderType.OneDay;
            case "OneWeek":
                return ReminderType.OneWeek;
            default:
                return type; // Fallback to the original value if not found
        }
    }

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
                    <Typography variant="body1">
                        {"Description: " +
                            (currentTask.task_desc ? currentTask.task_desc : "No description")}
                    </Typography>
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
                            Location: {currentTask.task_location || "No location set"}
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

                {/* Reminders */}
                <Box sx={{ ...sectionStyle, borderBottom: "none" }}>
                    <Typography variant="h6" gutterBottom>
                        Reminders
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        {currentTask.reminders && currentTask.reminders.length > 0 ? (
                            currentTask.reminders.map((reminder, index) => (
                                <Typography variant="body2" key={index}>
                                    Reminder set for:{" "}
                                    {new Date(reminder.reminder_datetime).toLocaleString([], {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}{" "}
                                    {getReminderDisplayValue(reminder.type)}
                                </Typography>
                            ))
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
                    <Button variant="contained" color="error" onClick={handleOpenDeleteModal}>
                        DELETE TASK
                    </Button>
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
                    <Modal open={taskDeleteOpen} onClose={handleDeleteClose}>
                        <Box sx={modalStyle}>
                            <Typography variant="h6" component="h2" gutterBottom>
                                Confirm Task Deletion
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Are you sure you want to delete this task? This action cannot be
                                undone.
                            </Typography>
                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleDeleteClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={async () => {
                                        try {
                                            const route = `/api/projects/${currentTask.project_id}/tasks/${currentTask.task_id}`;
                                            await fetch(route, {
                                                method: "DELETE",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                            });
                                            handleDelete();
                                            handleDeleteClose();
                                            handleCloseModal();
                                        } catch (e) {
                                            console.error(
                                                `Error deleting task ${currentTask.task_id}:`,
                                                e,
                                            );
                                        }
                                    }}
                                >
                                    Delete
                                </Button>
                            </Box>
                        </Box>
                    </Modal>
                </Box>
            </Box>
        </Modal>
    );
};

export default ViewTaskModal;
