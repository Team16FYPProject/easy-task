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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ProjectTask, Assignee } from "@/utils/types";
import dayjs from "dayjs";

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

    const handleChange = (event: SelectChangeEvent<typeof personName>) => {
        const {
            target: { value },
        } = event;
        setPersonName(typeof value === "string" ? value.split(",") : value);
    };

    {
        /*
    const handleAssigneeToggle = (memberId: string) => {
        setAssignees(prev => 
            prev.some(assignee => assignee.id === memberId)
                ? prev.filter(assignee => assignee.id !== memberId)
                : [...prev, teamMembers.find(member => member.id === memberId)!]
        );
    };

    const handleNewAssigneeChange = (event: SelectChangeEvent<string>) => {
        setNewAssignee(event.target.value as string);
    };

    const handleAddNewAssignee = () => {
        if (newAssignee && !assignees.some(assignee => assignee.id === newAssignee)) {
            const newTeamMember = teamMembers.find(member => member.id === newAssignee);
            if (newTeamMember) {
                setAssignees(prev => [...prev, newTeamMember]);
                setNewAssignee("");
            }
        }
    };
    */
    }

    const names = ["Dummy Name 1", "Dummy Name 2"];

    return (
        <Modal open={open} onClose={handleCloseModal}>
            <Box sx={modalStyle}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Edit Task: {task.task_name}
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
                        rows={4}
                        defaultValue={task.task_desc}
                        margin="normal"
                    />
                </Box>

                <Grid container spacing={2} sx={sectionStyle}>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            select
                            label="Status"
                            defaultValue={task.task_status}
                            margin="normal"
                        >
                            <MenuItem value="TO DO">TO DO</MenuItem>
                            <MenuItem value="IN PROGRESS">IN PROGRESS</MenuItem>
                            <MenuItem value="DONE">DONE</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            select
                            label="Priority"
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
                        {" "}
                        TODO
                        {/* Add backend
                         <DatePicker
                            label="Deadline"
                            value={task.task_deadline ? dayjs(task.task_deadline) : null}
                            onChange={(newValue) => {
                                // Handle the change
                            }}
                        /> */}
                    </Grid>
                    <Grid item xs={6}>
                        <TextField fullWidth label="Location" variant="outlined" margin="normal" />
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={sectionStyle}>
                    <Grid item xs={6}>
                        <TextField fullWidth select label="Reminder" margin="normal">
                            <MenuItem value="1 day before">1 day before</MenuItem>
                            <MenuItem value="2 days before">2 days before</MenuItem>
                            <MenuItem value="1 week before">1 week before</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Hours Logged"
                            defaultValue={task.task_time_spent}
                            margin="normal"
                        />
                    </Grid>
                </Grid>

                {/* Assignees - Need to fix backend */}

                <Box sx={{ ...sectionStyle, borderBottom: "none" }}>
                    <Typography variant="h6" gutterBottom>
                        Assignees
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Assigned</TableCell>
                                    <TableCell>Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/*
                                {teamMembers.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={assignees.some(assignee => assignee.id === member.id)}
                                                onChange={() => handleAssigneeToggle(member.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{member.name}</TableCell>
                                    </TableRow>
                                ))}
                                */}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                        <Select
                            value={newAssignee}
                            // onChange={handleNewAssigneeChange}
                            displayEmpty
                            sx={{ minWidth: 200, mr: 1 }}
                        >
                            <MenuItem value="" disabled>
                                Select new assignee
                            </MenuItem>
                            {/*
                            {teamMembers
                                .filter(member => !assignees.some(assignee => assignee.id === member.id))
                                .map(member => (
                                    <MenuItem key={member.id} value={member.id}>
                                        {member.name}
                                    </MenuItem>
                                ))
                            }
                            */}
                        </Select>
                        <Button
                            variant="contained"
                            // onClick={handleAddNewAssignee}
                            disabled={!newAssignee}
                        >
                            Add Assignee
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button variant="contained" color="secondary" onClick={handleCloseModal}>
                        CANCEL
                    </Button>
                    <Button variant="contained" color="primary">
                        SAVE CHANGES
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditTaskModal;
