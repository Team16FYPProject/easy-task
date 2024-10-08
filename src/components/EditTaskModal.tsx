import React, { useState, useEffect } from "react";
import {
    Modal,
    Box,
    Typography,
    Grid,
    TextField,
    Button,
    Select,
    MenuItem,
    Paper,
    SelectChangeEvent,
    OutlinedInput,
    Chip,
    FormControl,
    CircularProgress,
} from "@mui/material";
import { ProjectTask, Assignee, Profile, ApiResponse } from "@/utils/types";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";

interface EditTaskModalProps {
    open: boolean;
    handleCloseModal: () => void;
    task: ProjectTask;
    updateTask: (updatedTask: ProjectTask) => void;
}

interface TeamMember {
    id: string;
    name: string;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
    open,
    handleCloseModal,
    task: originalTask,
    updateTask,
}) => {
    const [task, setTask] = useState<ProjectTask>(originalTask);
    const [taskAssignees, setTaskAssignees] = useState<string[]>(
        task.assignees.map((assignee) => assignee.user_id),
    );
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);

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

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    const sectionStyle = {
        // borderBottom: "1px solid #e0e0e0",
        // py: 1,
    };

    // Get team members from the backend
    const [members, setMembers] = React.useState<Profile[]>([]);
    // Fetch member profiles
    useEffect(() => {
        async function fetchMembers() {
            try {
                const response = await fetch(`/api/projects/${task.project_id}/members`, {
                    method: "GET",
                    credentials: "include",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.data || "Failed to fetch members");
                }

                if (result.success) {
                    setMembers(result.users);
                } else {
                    throw new Error("Failed to fetch members");
                }
            } catch (e) {
                console.error("Error:", e);
            }
        }

        void fetchMembers();
    }, []);

    function updateTaskProperty(key: keyof typeof originalTask, value: any) {
        setTask((_task) => {
            const newTask: Record<string, any> = { ..._task };
            newTask[key] = value;
            return newTask as ProjectTask;
        });
    }

    async function handleSaveChanges() {
        try {
            setIsSaving(true);
            const taskResponse = await fetch(
                `/api/projects/${task.project_id}/tasks/${task.task_id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        name: task.task_name,
                        desc: task.task_desc,
                        deadline: task.task_deadline,
                        time_spent: task.task_time_spent,
                        status: task.task_status,
                        priority: task.task_priority,
                        location: task.task_location,
                        is_meeting: task.task_is_meeting,
                    }),
                },
            );
            const taskData: ApiResponse<ProjectTask> = await taskResponse.json();
            if (!taskData.success) {
                throw new Error(taskData.data);
            }
            const updatedTask = taskData.data;

            const assigneesResponse = await fetch(
                `/api/projects/${task.project_id}/tasks/${task.task_id}/task_assignees`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        ids: taskAssignees,
                    }),
                },
            );
            const assigneesData: ApiResponse<Assignee[]> = await assigneesResponse.json();
            if (!assigneesData.success) {
                throw new Error(assigneesData.data);
            }
            updateTask({
                ...updatedTask,
                assignees: assigneesData.data,
            });
            handleCloseModal();
        } catch (error) {
            console.error(error);
            setErrorMsg((error as Error).message ?? "Unable to update task. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Modal open={open} onClose={handleCloseModal}>
            <Box sx={modalStyle}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Edit Task
                </Typography>
                {errorMsg && (
                    <Typography
                        id="modal-modal-error"
                        variant="subtitle2"
                        component="p"
                        className="text-red-500"
                    >
                        {errorMsg}
                    </Typography>
                )}

                <Box sx={sectionStyle}>
                    <TextField
                        fullWidth
                        required
                        id="task-name"
                        label="Task Name"
                        variant="outlined"
                        value={task.task_name}
                        onChange={(e) => updateTaskProperty("task_name", e.target.value)}
                        margin="normal"
                    />
                </Box>

                <Box sx={sectionStyle}>
                    <TextField
                        fullWidth
                        id="task-description"
                        label="Task Description"
                        variant="outlined"
                        multiline
                        rows={3}
                        value={task.task_desc}
                        onChange={(e) => updateTaskProperty("task_desc", e.target.value)}
                        margin="normal"
                    />
                </Box>

                <Grid container spacing={2} sx={sectionStyle}>
                    <Grid item xs={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                label="Team Deadline"
                                disablePast
                                value={dayjs(task.task_deadline)}
                                onChange={(newValue) =>
                                    updateTaskProperty(
                                        "task_deadline",
                                        newValue ? new Date(newValue.toISOString()) : null,
                                    )
                                }
                            ></DateTimePicker>
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Location"
                            variant="outlined"
                            margin="normal"
                            value={task.task_location}
                            onChange={(e) => updateTaskProperty("task_location", e.target.value)}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={sectionStyle}>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            select
                            label="Task Status"
                            value={task.task_status}
                            onChange={(e) => updateTaskProperty("task_status", e.target.value)}
                            margin="normal"
                        >
                            <MenuItem value="TODO">TO DO</MenuItem>
                            <MenuItem value="DOING">IN PROGRESS</MenuItem>
                            <MenuItem value="COMPLETE">DONE</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            select
                            label="Task Priority"
                            value={task.task_priority}
                            onChange={(e) => updateTaskProperty("task_priority", e.target.value)}
                            margin="normal"
                        >
                            <MenuItem value="LOW">LOW</MenuItem>
                            <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                            <MenuItem value="HIGH">HIGH</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                {/* TODO Decide if we're still doing task reminder.*/}
                {/*<Grid container spacing={2} sx={sectionStyle}>*/}
                {/*    <Grid item xs={6}>*/}
                {/*        <TextField*/}
                {/*            select*/}
                {/*            fullWidth*/}
                {/*            label="Task Reminder"*/}
                {/*            value={task.task_reminder}*/}
                {/*            onChange={(e) => updateTaskProperty('task_reminder', e.target.value)}*/}
                {/*            margin="normal"*/}
                {/*        >*/}
                {/*            <MenuItem value={"HOUR"}>One Hour Before</MenuItem>*/}
                {/*            <MenuItem value={"DAY"}>One Day Before</MenuItem>*/}
                {/*            <MenuItem value={"WEEK"}>One Week Before</MenuItem>*/}
                {/*        </TextField>*/}
                {/*    </Grid>*/}
                {/*</Grid>*/}

                {/* Assignees - Need to fix backend */}

                <FormControl fullWidth>
                    <label>Task Assignees</label>
                    <Select
                        fullWidth
                        multiple
                        value={taskAssignees}
                        onChange={(e) => {
                            const value = e.target.value;
                            setTaskAssignees(typeof value === "string" ? value.split(",") : value);
                        }}
                        input={<OutlinedInput label="Chip" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {selected.map((value) => {
                                    const user = members.find((u) => u.user_id === value);
                                    return (
                                        <Chip
                                            key={value}
                                            label={
                                                user
                                                    ? `${user.first_name} ${user.last_name}`
                                                    : value
                                            }
                                        />
                                    );
                                })}
                            </Box>
                        )}
                        MenuProps={MenuProps}
                    >
                        {members
                            .filter(
                                (member) =>
                                    !taskAssignees.some((userId) => userId === member.user_id),
                            )
                            .map((member) => (
                                <MenuItem key={member.user_id} value={member.user_id}>
                                    {member.first_name} {member.last_name}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>

                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button variant="outlined" color="primary" onClick={handleCloseModal}>
                        CANCEL
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <CircularProgress color="secondary" size="20px" />
                        ) : (
                            "SAVE CHANGES"
                        )}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditTaskModal;
