import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import {
    Grid,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from "@mui/material";

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

{
    /* ALL THE BACKEND IS COPIED FROM ADDTEAMMODAL - NEEDS DOING */
}
export default function ViewTaskModal({
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
                        {/* Task Descriptors */}
                        <Grid item>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Team __: Task __
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            [Parent Task]
                        </Grid>
                        <Grid item xs={12}>
                            [Description of task]
                        </Grid>

                        <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12}>
                                Status: __
                            </Grid>
                            <Grid item xs={12}>
                                Priority: __
                            </Grid>
                        </Grid>

                        <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12}>
                                Deadlines: ___
                            </Grid>
                            <Grid item xs={12}>
                                Location: ___
                            </Grid>
                        </Grid>

                        <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12}>
                                Reminder: __
                            </Grid>
                            <Grid item xs={12}>
                                Hours Logged: __
                            </Grid>
                        </Grid>

                        {/* Assignee Info */}
                        <Typography id="modal-modal-title" variant="h6" component="h4">
                            Assignees
                        </Typography>

                        <Grid item xs={12}>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Email</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {/* Assignee Table Contents */}
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <Skeleton variant="text" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton variant="text" />
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                        {/* Button Options */}
                        <Grid container spacing={2} alignItems="right">
                            <Grid item>
                                <Button variant="contained" color="secondary">
                                    LOG 1 HOUR
                                </Button>
                                <Button variant="contained" color="secondary">
                                    ADD SUBTASK
                                </Button>
                                <Button variant="contained" color="secondary">
                                    EDIT TASK
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        </div>
    );
}
