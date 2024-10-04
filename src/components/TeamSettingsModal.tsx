import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Grid, TextField } from "@mui/material";
import { Description } from "@mui/icons-material";

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

export default function TeamSettings({
    open,
    handleClose,
    teamId,
}: {
    open: boolean;
    handleClose: () => void;
    teamId: string;
}) {
    const [teamName, setTeamName] = React.useState("");
    // const [image, setImage] = React.useState<File | null>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTeamName(event.target.value);
    };

    // const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     if (event.target.files && event.target.files[0]) {
    //         setImage(event.target.files[0]);
    //     }
    // };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("name", teamName);
        formData.append("description", teamName);
        console.log(teamName);
        // If you do image
        // if (image) {
        //     formData.append("image", image);
        //     console.log("Image added");
        // }

        try {
            const route = `/api/projects/${teamId}`;
            const response = await fetch(route, {
                method: "PATCH",
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
                                Team Settings
                            </Typography>
                        </Grid>
                        <Grid item>
                            <TextField
                                id="outlined-basic"
                                label="Edit Team Name"
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
                                Update
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        </div>
    );
}
