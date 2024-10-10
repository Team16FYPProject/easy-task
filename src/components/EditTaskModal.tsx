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
import { ProjectTask, Assignee, Profile, ApiResponse, Reminders } from "@/utils/types";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";

interface EditTaskModalProps {
    open: boolean;
    handleCloseModal: () => void;
    task: ProjectTask;
    updateTask: (updatedTask: ProjectTask) => void;
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

    const [taskReminders, setTaskReminders] = useState<string[]>(
        task.reminders?.map((reminder) => reminder.task_id) || [],
    );

    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600,
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        overflow: "auto",
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

    {
        /* Reminders */
    }
    // Convert timestamps to human-readable strings
    const convertTimestampsToReminders = (reminders: Reminders[], deadline: number) => {
        const remindersMapping: Record<string, number> = {
            "One Hour Before": 1 * 60 * 60 * 1000,
            "One Day Before": 24 * 60 * 60 * 1000,
            "One Week Before": 7 * 24 * 60 * 60 * 1000,
        };

        return reminders
            .map((reminder) => {
                const timeDiff = deadline - new Date(reminder.reminder_datetime).getTime();
                return (
                    Object.keys(remindersMapping).find(
                        (key) => remindersMapping[key] === timeDiff,
                    ) || null
                );
            })
            .filter(Boolean) as string[]; // Remove null values
    };

    // Convert reminder strings to timestamps before saving
    const convertRemindersToTimestamps = (
        reminderStrings: string[],
        deadline: number,
    ): Reminders[] => {
        const timeDifferences: Record<string, number> = {
            "One Hour Before": 1 * 60 * 60 * 1000,
            "One Day Before": 24 * 60 * 60 * 1000,
            "One Week Before": 7 * 24 * 60 * 60 * 1000,
        };

        return reminderStrings.map((reminderStr) => {
            const timestamp = deadline - (timeDifferences[reminderStr] || 0);
            return {
                reminder_id: "", // This will be generated on the backend
                task_id: task.task_id,
                reminder_datetime: new Date(timestamp).toISOString(),
                task: task,
                profile: {} as Profile, // Assuming profile info will be set on backend
            };
        });
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

    // useEffect to convert reminder timestamps to reminder strings when task data changes
    useEffect(() => {
        if (task && task.task_deadline) {
            const deadline = new Date(task.task_deadline).getTime();
            const reminderStrings = convertTimestampsToReminders(task.reminders || [], deadline);
            setTaskReminders(reminderStrings);
        }
    }, [task]);

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
            const deadline = new Date(task.task_deadline).getTime(); // Task deadline in milliseconds
            const updatedReminders = convertRemindersToTimestamps(taskReminders, deadline); // Convert back to timestamps

            const taskResponse = await fetch(
                `/api/projects/${task.project_id}/tasks/${task.task_id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        taskName: task.task_name,
                        taskDesc: task.task_desc,
                        taskDeadline: task.task_deadline,
                        taskTimeSpent: task.task_time_spent,
                        taskStatus: task.task_status,
                        taskPriority: task.task_priority,
                        taskLocation: task.task_location,
                        taskIsMeeting: task.task_is_meeting,
                    }),
                },
            );
            const taskData: ApiResponse<ProjectTask> = await taskResponse.json();
            if (!taskData.success) {
                throw new Error(taskData.data);
            }
            const updatedTask = taskData.data;
            // assignees update
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

            // reminders update
            const remindersResponse = await fetch(
                `/api/projects/${task.project_id}/tasks/${task.task_id}/reminders`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        ids: updatedReminders,
                    }),
                },
            );

            const remindersData: ApiResponse<Reminders[]> = await remindersResponse.json();
            if (!remindersData.success) throw new Error(remindersData.data);

            // update task
            updateTask({
                ...updatedTask,
                assignees: assigneesData.data,
                reminders: remindersData.data,
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

                {/* Reminder Select */}

                <Grid container spacing={2} sx={sectionStyle}>
                    <FormControl fullWidth>
                        <label>Task Reminders</label>
                        <Select
                            fullWidth
                            multiple
                            value={taskReminders}
                            onChange={(e) =>
                                setTaskReminders(
                                    typeof e.target.value === "string"
                                        ? e.target.value.split(",")
                                        : e.target.value,
                                )
                            }
                            input={<OutlinedInput label="Chip" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                    {selected
                                        .sort((a, b) => {
                                            const order = [
                                                "One Hour Before",
                                                "One Day Before",
                                                "One Week Before",
                                            ];
                                            return order.indexOf(a) - order.indexOf(b);
                                        })
                                        .map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                </Box>
                            )}
                            MenuProps={MenuProps}
                        >
                            {/* Task reminder options */}
                            <MenuItem value="One Hour Before">One Hour Before</MenuItem>
                            <MenuItem value="One Day Before">One Day Before</MenuItem>
                            <MenuItem value="One Week Before">One Week Before</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* </Modal>Assignees - Need to fix backend */}
                <Grid container spacing={2} sx={sectionStyle}>
                    <FormControl fullWidth>
                        <label>Task Assignees</label>
                        <Select
                            fullWidth
                            multiple
                            value={taskAssignees}
                            onChange={(e) => {
                                const value = e.target.value;
                                setTaskAssignees(
                                    typeof value === "string" ? value.split(",") : value,
                                );
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
                                        {member.first_name} {member.last_name}{" "}
                                        {/* Note: the lag to fetch this is crazy*/}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                </Grid>
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
