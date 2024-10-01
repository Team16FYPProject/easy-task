import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
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

const MenuProps = {
    PaperProps: {
        style: {
            width: 250,
        },
    },
};

const names = ["Dummy Name 1", "Dunmmy Name 2"];

function getStyles(name: string, personName: readonly string[], theme: Theme) {
    return {
        fontWeight: personName.includes(name)
            ? theme.typography.fontWeightMedium
            : theme.typography.fontWeightRegular,
    };
}

{
    /* Backend Needs updating!!! */
}
export default function EditTaskModal({
    open,
    handleClose,
}: {
    open: boolean;
    handleClose: () => void;
}) {
    const [teamName, setTeamName] = React.useState("");
    const [image, setImage] = React.useState<File | null>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTeamName(event.target.value);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("name", teamName);
        formData.append("description", teamName);
        // If you do image
        if (image) {
            formData.append("image", image);
            console.log("Image added");
        }

        try {
            const response = await fetch("/api/projects", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                // Handle successful response
                console.log("Team created successfully");
                handleClose(); // Close the modal
            } else {
                // Handle error response
                console.error(`Failed to create team. Status: ${response.status}`);
                const errorText = await response.text();
                console.error(`Error details: ${errorText}`);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    {
        /* New stuff from here, stuff before this is not updated */
    }
    const theme = useTheme();
    const [personName, setPersonName] = React.useState<string[]>([]);

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
        <div>
            <Modal
                open={open}
                onClose={handleClose}
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
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            id="task-description"
                            label="Task Description"
                            variant="outlined"
                            onChange={handleInputChange}
                        />
                    </Grid>

                    <Grid container spacing={2}>
                        <Grid item>
                            {/* <DatePicker id="task-deadline" required label="Task Deadline" /> */}
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
                            <TextField id="task-designate-meeting" select label="Designate Meeting">
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
    );
}
