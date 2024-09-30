import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Task } from "@/utils/lib/types";
import {
    Chip,
    Grid,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    TextField,
    Theme,
    useTheme,
} from "@mui/material";
import theme from "@/styles/theme";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

interface EditTaskModalProps {
    open: boolean;
    handleCloseModal: () => void;
    task: Task; // You'll need to pass the task data as a prop
}

function getStyles(name: string, personName: readonly string[], theme: Theme) {
    return {
        fontWeight: personName.includes(name)
            ? theme.typography.fontWeightMedium
            : theme.typography.fontWeightRegular,
    };
}

const MenuProps = {
    PaperProps: {
        style: {
            width: 250,
        },
    },
};

const names = ["Dummy Name 1", "Dunmmy Name 2"];

const EditTaskModal: React.FC<EditTaskModalProps> = ({ open, handleCloseModal, task }) => {
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

    const [personName, setPersonName] = React.useState<string[]>([]);
    const [teamName, setTeamName] = React.useState("");
    const [taskOpen, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTeamName(event.target.value);
    };

    const style = {
        position: "absolute" as "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
        bgcolor: "background.paper",
        border: "2px solid #000",
        boxShadow: 24,
        p: 4,
    };

    const handleChange = (event: SelectChangeEvent<typeof personName>) => {
        const {
            target: { value },
        } = event;
        setPersonName(
            // On autofill we get a stringified value.
            typeof value === "string" ? value.split(",") : value,
        );
    };

    return (
        <Modal open={open} onClose={handleCloseModal}>
            <div>
                <Modal
                    open={open}
                    onClose={handleCloseModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Grid container direction="column" spacing={2}>
                            <Grid item>
                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                    Task
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <TextField
                                required
                                id="task-name"
                                label="Task Name"
                                variant="outlined"
                                onChange={handleInputChange}
                                value={task.task_name}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="task-description"
                                label="Task Description"
                                variant="outlined"
                                value={task.task_desc}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item>
                                {/* <DatePicker
                                    label="Task Deadline"
                                    value={task.task_deadline ? dayjs(task.task_deadline) : null}
                                    onChange={(newValue) => {
                                        // handle the change
                                    }}
                                    renderInput={(params) => <TextField {...params} required />}
                                /> */}
                            </Grid>
                            <Grid item>
                                <TextField id="task-parent" select label="Task Parent"></TextField>
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item>
                                <TextField id="task-status" select label="Task Status">
                                    <MenuItem>TO DO</MenuItem>
                                    <MenuItem>IN PROGRESS</MenuItem>
                                    <MenuItem>DONE</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item>
                                <TextField id="task-priority" select label="Task Priority">
                                    <MenuItem>LOW</MenuItem>
                                    <MenuItem>MEDIUM</MenuItem>
                                    <MenuItem>HIGH</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item>
                                <TextField id="task-reminder" select label="Reminder"></TextField>
                            </Grid>
                            <Grid item>
                                <TextField
                                    id="task-location"
                                    variant="outlined"
                                    label="Location"
                                ></TextField>
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item>
                                <TextField
                                    id="task-designate-meeting"
                                    select
                                    label="Designate Meeting"
                                >
                                    <MenuItem>YES</MenuItem>
                                    <MenuItem>NO</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item>
                                <TextField
                                    id="task-meeting-duration"
                                    select
                                    label="Meeting Duration"
                                ></TextField>
                            </Grid>
                        </Grid>

                        <Grid item>
                            <InputLabel id="task-assignees-label">Task Assignees</InputLabel>
                            <Select
                                labelId="task-assignees-label"
                                id="task-assignees"
                                multiple
                                value={personName}
                                onChange={handleChange}
                                input={
                                    <OutlinedInput
                                        id="select-multiple-assignees"
                                        label="Task Assignees"
                                    />
                                }
                                renderValue={(selected) => (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                                MenuProps={MenuProps}
                            >
                                {names.map((name) => (
                                    <MenuItem
                                        key={name}
                                        value={name}
                                        style={getStyles(name, personName, theme)}
                                    >
                                        {name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid container alignItems="right">
                            <Button variant="text">CANCEL</Button>
                            <Button variant="text">SAVE</Button>
                        </Grid>
                    </Box>
                </Modal>
            </div>
        </Modal>
    );
};

export default EditTaskModal;
