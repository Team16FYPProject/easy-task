import { ApiResponse, Assignee, Profile, ProjectTask, Reminder } from "@/utils/types";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    Grid,
    MenuItem,
    Modal,
    OutlinedInput,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

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
        task.reminders?.map((reminder) => reminder.reminder_datetime) || [],
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

    {
        /* Reminders */
    }

    const reminderOptions = ["One Hour Before", "One Day Before", "One Week Before"];

    // Convert timestamps to human-readable strings
    const convertTimestampsToReminders = (reminders: Reminder[], deadline: number): string[] => {
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
            .filter(Boolean) as string[];
    };

    // Convert reminder strings to timestamps before saving
    const convertRemindersToTimestamps = (
        reminderStrings: string[],
        deadline: number,
    ): { reminder_datetime: string; type: string }[] => {
        const timeDifferences: Record<string, number> = {
            "One Hour Before": 1 * 60 * 60 * 1000,
            "One Day Before": 24 * 60 * 60 * 1000,
            "One Week Before": 7 * 24 * 60 * 60 * 1000,
        };
        const types: Record<string, string> = {
            "One Hour Before": "OneHour",
            "One Day Before": "OneDay",
            "One Week Before": "OneWeek",
        };

        return reminderStrings.map((reminderStr) => ({
            reminder_datetime: new Date(
                deadline - (timeDifferences[reminderStr] || 0),
            ).toISOString(),
            type: types[reminderStr],
        }));
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
        setTask((prevTask) => ({
            ...prevTask,
            [key]: value,
        }));
    }

    async function handleSaveChanges() {
        try {
            setIsSaving(true);
            const deadline = new Date(task.task_deadline).getTime();
            const updatedReminders = convertRemindersToTimestamps(taskReminders, deadline);

            const updatedTaskData = {
                taskName: task.task_name,
                taskDescription: task.task_desc,
                taskDeadline: task.task_deadline,
                taskPriority: task.task_priority,
                taskParent: task.task_parent_id,
                taskStatus: task.task_status,
                taskMeetingBool: task.task_is_meeting,
                taskLocation: task.task_location,
                // taskAssignee: taskAssignees,
                // taskReminder: updatedReminders,
            };

            const response = await fetch(`/api/projects/${task.project_id}/tasks/${task.task_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedTaskData),
            });

            // assignees update
            const assigneesResponse = await fetch(
                `/api/projects/${task.project_id}/tasks/${task.task_id}/task_assignees`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        ids: taskAssignees,
                    }),
                },
            );
            const assigneesData: ApiResponse<Assignee[]> = await assigneesResponse.json();
            if (!assigneesData.success) {
                throw new Error(assigneesData.data);
            }

            // if (updatedReminders) {
            // reminders update
            const reminderResponse = await fetch(
                `/api/projects/${task.project_id}/tasks/${task.task_id}/reminders`,
                {
                    method: "POST",
                    body: JSON.stringify({ new_datetimes: updatedReminders }),
                },
            );
            const reminderData: ApiResponse<Reminder[]> = await reminderResponse.json();
            if (!reminderData.success) {
                throw new Error(reminderData.data);
            }
            // }

            const result: ApiResponse<ProjectTask> = await response.json();
            if (!result.success) {
                throw new Error(result.data as string);
            }
            const updateTaskData = {
                ...result.data,
                reminders: reminderData.data,
                assignees: assigneesData.data,
            };
            console.log("updateTaskData", updateTaskData);
            updateTask(updateTaskData as ProjectTask);

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

                <Box>
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

                <Box>
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

                <Grid container spacing={2}>
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

                <Grid container spacing={2}>
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

                <Grid container spacing={2}>
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
                            {reminderOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* </Modal>Assignees - Need to fix backend */}
                <Grid container spacing={2}>
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
                                                onDelete={() => {
                                                    setTaskAssignees((prev) =>
                                                        prev.filter((id) => id !== value),
                                                    );
                                                }}
                                            />
                                        );
                                    })}
                                </Box>
                            )}
                            MenuProps={MenuProps}
                        >
                            {members.map((member) => (
                                <MenuItem key={member.user_id} value={member.user_id}>
                                    {member.first_name} {member.last_name}
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
