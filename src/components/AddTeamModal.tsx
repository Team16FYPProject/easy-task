import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Grid, TextField } from "@mui/material";
import { ApiResponse } from "@/utils/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "justifyContent",
    height: "justifyContent",
    minHeight: "25%",
    minWidth: "25%",
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
    const router = useRouter();

    const [teamName, setTeamName] = React.useState("");
    const [image, setImage] = React.useState<File | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    // Clear the error message when the modal is re-opened.
    useEffect(() => {
        setErrorMsg("");
    }, [open]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTeamName(event.target.value);
    };

    const handleSubmit = async () => {
        if (!teamName) {
            setErrorMsg("Please enter a team name.");
            return;
        }
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

            const data: ApiResponse<{ id: string }> = await response.json();
            if (response.ok && data.success) {
                const projectId = data.data.id;
                // Handle successful response
                console.log("Project created successfully");
                handleClose(); // Close the modal
                router.push(`/team/${projectId}`);
            } else {
                setErrorMsg((data.data as string) ?? "Unable to create team.");
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
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Create Project
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
                        </Grid>
                        <Grid item>
                            <TextField
                                id="outlined-basic"
                                label="Project Name"
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
