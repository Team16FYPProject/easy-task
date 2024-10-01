import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Grid, TextField } from "@mui/material";
import { ApiResponse } from "@/utils/types";

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

export default function InviteMemberModal({
    open,
    handleClose,
    projectId,
}: {
    open: boolean;
    handleClose: () => void;
    projectId: string;
}) {
    const [email, setEmail] = React.useState("");
    const [image, setImage] = React.useState<File | null>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const handleSubmit = async () => {
        if (!email.trim()) {
            return alert("Please enter a valid email.");
        }
        try {
            const response = await fetch(`/api/projects/${projectId}/members/invite`, {
                method: "POST",
                body: JSON.stringify({ email }),
            });

            const data: ApiResponse<void> = await response.json();

            if (response.ok && data.success) {
                handleClose(); // Close the modal
            } else {
                // Handle error response
                console.error(`Failed to create team. Status: ${response.status}`);
                console.error(`Error details: ${data}`);
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
                    <Grid container spacing={2}>
                        <Grid item>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Invite Member
                            </Typography>
                        </Grid>
                        <Grid item>
                            <TextField
                                id="outlined-basic"
                                label="Email"
                                variant="outlined"
                                className="w-full"
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleSubmit}
                                className="w-full"
                                sx={{ mr: 2 }}
                            >
                                INVITE
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        </div>
    );
}
