import React from "react";
import { Modal, Box, Typography, Grid, Paper, Chip, Button } from "@mui/material";
import { ProjectTask } from "@/utils/types";
import EditTaskModal from "@/components/EditTaskModal";
import { determineBgColor } from "@/utils/colourUtils";

interface ViewTaskModalProps {
    open: boolean;
    handleCloseModal: () => void;
    task: ProjectTask; // You'll need to pass the task data as a prop
    setUpdatedTask: React.Dispatch<React.SetStateAction<ProjectTask | null>>;
}

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({
    open,
    handleCloseModal,
    task,
    setUpdatedTask,
}) => {
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
    const bgColor = determineBgColor(task.task_priority);
    const [currentTask, setCurrentTask] = React.useState(task);

    const handleLogClick = async () => {
        try {
            const route = `/api/projects/${currentTask.project_id}/tasks/${currentTask.task_id}/logged_hours`;
            await fetch(route, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    task_logged_hours: currentTask.task_time_spent + 1,
                }),
            });
            const updatedTask = {
                ...currentTask,
                task_time_spent: currentTask.task_time_spent + 1,
            };
            setCurrentTask(updatedTask);
            setUpdatedTask(updatedTask);
        } catch (e) {
            console.error(`Error updating logged hours for project ${currentTask.project_id}:`, e);
        }
    };

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

                <Grid container spacing={2} sx={sectionStyle}>
                    <Grid item xs={6}>
                        <Typography variant="body2">
                            Deadline:{" "}
                            {new Date(task.task_deadline).toLocaleString([], {
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

                <Grid container spacing={2} sx={sectionStyle}>
                    {/* <Grid item xs={6}>
                        <Typography variant="body2">Reminder: {}</Typography>
                    </Grid> */}
                    <Grid item xs={6}>
                        <Typography variant="body2">
                            Hours Logged: {currentTask.task_time_spent}
                        </Typography>
                    </Grid>
                </Grid>

                <Box sx={{ ...sectionStyle, borderBottom: "none" }}>
                    <Typography variant="h6" gutterBottom>
                        Assignees
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        {currentTask.assignees &&
                        Array.isArray(currentTask.assignees) &&
                        currentTask.assignees.length > 0 ? (
                            <ul>
                                {task.assignees.map((assignee, index) => (
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

                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button variant="contained" color="secondary" onClick={handleLogClick}>
                        LOG 1 HOUR
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleOpenEditModal}>
                        EDIT TASK
                    </Button>
                    <EditTaskModal
                        open={taskEditOpen}
                        handleCloseModal={handleEditClose}
                        task={currentTask}
                    />
                </Box>
            </Box>
        </Modal>
    );
};

export default ViewTaskModal;
