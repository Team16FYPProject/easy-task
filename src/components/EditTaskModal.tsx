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
} from "@mui/material";
import { ProjectTask, Assignee, Profile, ApiResponse } from "@/utils/types";

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
    const [personName, setPersonName] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>("");

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
    const [loadingMembers, setLoadingMembers] = React.useState(true);
    const [members, setMembers] = React.useState<Profile[]>([]);
    // Fetch member profiles
    useEffect(() => {
        async function fetchMembers() {
            setLoadingMembers(true);
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
            setLoadingMembers(false);
        }

        fetchMembers();
    }, []);

    // const handleAssigneeToggle = (memberId: string) => {
    //     setAssignees(prev =>
    //         prev.some(assignee => assignee.id === memberId)
    //             ? prev.filter(assignee => assignee.id !== memberId)
    //             : [...prev, teamMembers.find(member => member.id === memberId)!]
    //     );
    // };

    function updateTaskProperty(key: keyof typeof originalTask, value: any) {
        setTask((_task) => {
            const newTask: Record<string, any> = { ..._task };
            newTask[key] = value;
            return newTask as ProjectTask;
        });
    }

    async function handleSaveChanges() {
        try {
            const taskResponse = await fetch(
                `/api/projects/${task.project_id}/tasks/${task.task_id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        name: task.task_name,
                        desc: task.task_desc,
                        deadline: task.task_deadline,
                        time_spent: task.task_time_spent,
                        task_status: task.task_status,
                        priority: task.task_priority,
                        task_location: task.task_location,
                        task_is_meeting: task.task_is_meeting,
                    }),
                },
            );
            const data: ApiResponse<ProjectTask> = await taskResponse.json();
            if (!data.success) {
                setErrorMsg(data.data);
                return;
            }
            const updatedTask = data.data;
            // TODO Fix assignees endpoint.
            // const assigneesResponse = await fetch(`/api/projects/${task.project_id}/tasks/${task.task_id}/task_assignees`)
            updateTask(updatedTask);
            handleCloseModal();
        } catch (error) {
            console.error(error);
            setErrorMsg("Unable to update task. Please try again.");
        }
    }

    return (
        <Modal open={open} onClose={handleCloseModal}>
            <Box sx={modalStyle}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Edit Task
                </Typography>

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
                        {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Deadline"
                                value={dayjs(task.task_deadline)}
                                onChange={() => {}}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </LocalizationProvider> */}
                        <TextField
                            fullWidth
                            label="Task Deadline"
                            variant="outlined"
                            margin="normal"
                            value={task.task_deadline}
                            onChange={(e) => updateTaskProperty("task_deadline", e.target.value)}
                        />
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
                    <Button variant="contained" color="secondary" onClick={handleSaveChanges}>
                        SAVE CHANGES
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditTaskModal;
