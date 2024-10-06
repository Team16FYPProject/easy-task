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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    SelectChangeEvent,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { ProjectTask, Assignee, Profile } from "@/utils/types";
import dayjs from "dayjs";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useUser } from "@/hooks/useUser";

interface EditTaskModalProps {
    open: boolean;
    handleCloseModal: () => void;
    task: ProjectTask;
}

interface TeamMember {
    id: string;
    name: string;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ open, handleCloseModal, task }) => {
    const [personName, setPersonName] = useState<string[]>([]);
    const [assignees, setAssignees] = useState<Assignee[]>(task.assignees || []);
    const [newAssignee, setNewAssignee] = useState<string>("");
    const [taskReminder, setTaskReminder] = useState<string>("");

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

    const handleChange = (event: SelectChangeEvent<typeof personName>) => {
        const {
            target: { value },
        } = event;
        setPersonName(typeof value === "string" ? value.split(",") : value);
    };

    // const handleAssigneeToggle = (memberId: string) => {
    //     setAssignees(prev =>
    //         prev.some(assignee => assignee.id === memberId)
    //             ? prev.filter(assignee => assignee.id !== memberId)
    //             : [...prev, teamMembers.find(member => member.id === memberId)!]
    //     );
    // };

    // const handleNewAssigneeChange = (event: SelectChangeEvent<string>) => {
    //     setNewAssignee(event.target.value as string);
    // };

    const handleAddNewAssignee = async () => {
        if (newAssignee && !assignees.some((assignee) => assignee.user_id === newAssignee)) {
            const newTeamMember = members.find((member) => member.user_id === newAssignee);
            console.log("New team member:", newTeamMember);
            if (newTeamMember) {
                try {
                    const response = await fetch(
                        `/api/projects/${task.project_id}/tasks/${task.task_id}/task_assignees`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                assignee: newTeamMember.user_id,
                            }),
                        },
                    );

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.data || "Failed to add assignee");
                    }

                    if (result.success) {
                        setAssignees((prev) => [
                            ...prev,
                            {
                                user_id: newTeamMember.user_id,
                                user: {
                                    email: newTeamMember.email,
                                    name: `${newTeamMember.first_name} ${newTeamMember.last_name}`,
                                },
                                profile: newTeamMember,
                            },
                        ]);
                        setNewAssignee("");
                    } else {
                        throw new Error("Failed to add assignee");
                    }
                } catch (e) {
                    console.error("Error:", e);
                }
            }
        }
    };

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
                        defaultValue={task.task_name}
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
                        defaultValue={task.task_desc}
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
                            defaultValue={task.task_deadline}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Location"
                            variant="outlined"
                            margin="normal"
                            defaultValue={task.task_location}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={sectionStyle}>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            select
                            label="Task Status"
                            defaultValue={task.task_status}
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
                            defaultValue={task.task_priority}
                            margin="normal"
                        >
                            <MenuItem value="LOW">LOW</MenuItem>
                            <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                            <MenuItem value="HIGH">HIGH</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={sectionStyle}>
                    <Grid item xs={6}>
                        <TextField
                            select
                            fullWidth
                            label="Task Reminder"
                            defaultValue={taskReminder}
                            margin="normal"
                        >
                            <MenuItem value={"HOUR"}>One Hour Before</MenuItem>
                            <MenuItem value={"DAY"}>One Day Before</MenuItem>
                            <MenuItem value={"WEEK"}>One Week Before</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                {/* Assignees - Need to fix backend */}

                <Box sx={{ ...sectionStyle, borderBottom: "none" }}>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Assignees
                        </Typography>
                    </Box>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        {task.assignees &&
                        Array.isArray(task.assignees) &&
                        task.assignees.length > 0 ? (
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
                    <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                        <Select
                            value={newAssignee}
                            // onChange={handleNewAssigneeChange}
                            displayEmpty
                            sx={{ minWidth: 200, mr: 1 }}
                            onChange={(e) => setNewAssignee(e.target.value)}
                        >
                            <MenuItem value="" disabled>
                                Select new assignee
                            </MenuItem>
                            {members
                                .filter(
                                    (member) =>
                                        !assignees.some(
                                            (assignee) => assignee.user_id === member.user_id,
                                        ),
                                )
                                .map((member) => (
                                    <MenuItem key={member.user_id} value={member.user_id}>
                                        {member.first_name} {member.last_name}
                                    </MenuItem>
                                ))}
                        </Select>
                        <Button
                            variant="contained"
                            onClick={handleAddNewAssignee}
                            disabled={!newAssignee}
                        >
                            Add Assignee
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button variant="outlined" color="primary" onClick={handleCloseModal}>
                        CANCEL
                    </Button>
                    <Button variant="contained" color="secondary">
                        SAVE CHANGES
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditTaskModal;
