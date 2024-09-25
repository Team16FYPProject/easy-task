import React from "react";
import { Modal, Box, Typography, Grid, Paper, Chip, Button } from "@mui/material";
import { Task } from "@/utils/lib/types";

interface ViewTaskModalProps {
    open: boolean;
    handleClose: () => void;
    task: Task; // You'll need to pass the task data as a prop
}

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ open, handleClose, task }) => {
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

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {`${task.project_name}: ${task.task_name}`}
                </Typography>

                <Box sx={sectionStyle}>
                    <Typography variant="body2" color="text.secondary">
                        {"TODO"}
                    </Typography>
                </Box>

                <Box sx={sectionStyle}>
                    <Typography variant="body1">{task.task_desc}</Typography>
                </Box>

                <Grid container spacing={2} sx={sectionStyle}>
                    <Grid item xs={6}>
                        <Typography variant="body2">Status: {task.task_status}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2">
                            Priority:{" "}
                            <Chip
                                label={task.task_priority}
                                color={
                                    task.task_priority === "Low"
                                        ? "success"
                                        : task.task_priority === "Medium"
                                          ? "warning"
                                          : "error"
                                }
                                size="small"
                            />
                        </Typography>
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={sectionStyle}>
                    <Grid item xs={6}>
                        <Typography variant="body2">Deadline: {task.task_deadline}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2">Location: {"TODO"}</Typography>
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={sectionStyle}>
                    <Grid item xs={6}>
                        <Typography variant="body2">Reminder: {"TODO"}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2">
                            Hours Logged: {task.task_time_spent}
                        </Typography>
                    </Grid>
                </Grid>

                <Box sx={{ ...sectionStyle, borderBottom: "none" }}>
                    <Typography variant="h6" gutterBottom>
                        Assignees
                    </Typography>
                    {/* <Paper variant="outlined">
                        {task.assignees.map((assignee, index) => (
                            <Box
                                key={index}
                                sx={{
                                    p: 1,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    borderBottom:
                                        index < task.assignees.length - 1
                                            ? "1px solid #e0e0e0"
                                            : "none",
                                }}
                            >
                                <Typography>{assignee.name}</Typography>
                                <Typography color="text.secondary">{assignee.email}</Typography>
                            </Box>
                        ))}
                    </Paper> */}
                </Box>

                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button variant="contained" color="secondary">
                        LOG 1 HOUR
                    </Button>
                    <Button variant="contained" color="secondary">
                        ADD SUBTASK
                    </Button>
                    <Button variant="contained" color="secondary">
                        EDIT TASK
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ViewTaskModal;
