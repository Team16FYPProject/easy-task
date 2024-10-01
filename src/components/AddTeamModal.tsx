import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Grid, TextField } from "@mui/material";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "75%",
    height: "75%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    overflow: "auto",
};

export default function AddTeamModal({
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
                        <Grid item>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Create Team
                            </Typography>
                        </Grid>
                        <Grid item>
                            <TextField
                                id="outlined-basic"
                                label="Team Name"
                                variant="outlined"
                                className="w-full"
                                value={teamName}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleSubmit}
                                className="w-full"
                            >
                                Create
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        </div>
    );
}
