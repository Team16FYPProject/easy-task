import { ApiResponse } from "@/utils/types";
import { Grid, TextField } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import * as React from "react";
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
    const [teamDesc, setTeamDesc] = React.useState("");
    const [image, setImage] = React.useState<File | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    // Clear the error message when the modal is re-opened.
    useEffect(() => {
        setErrorMsg("");
    }, [open]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTeamName(event.target.value);
    };

    const handleInputChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTeamDesc(event.target.value);
    };

    const handleSubmit = async () => {
        if (!teamName) {
            setErrorMsg("Please enter a team name.");
            return;
        }
        const formData = new FormData();
        formData.append("name", teamName);
        formData.append("description", teamDesc);
        // If you do image
        if (image) {
            formData.append("image", image);
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
                handleClose(); // Close the modal
                router.push(`/team/${projectId}`);
            } else {
                setErrorMsg((data.data as string) ?? "Unable to create project.");
                // Handle error response
                console.error(`Failed to create project. Status: ${response.status}`);
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
                                required
                                value={teamName}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="outlined-basic"
                                label="Project Description"
                                variant="outlined"
                                className="w-full"
                                value={teamDesc}
                                multiline
                                rows={4}
                                required
                                onChange={handleInputChange2}
                            />
                        </Grid>

                        {/* Cancel/Update Buttons */}
                        <div className="flex w-full justify-end">
                            <Box sx={{ display: "flex", gap: 2, paddingTop: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleClose}
                                    className="w-full"
                                >
                                    CANCEL
                                </Button>

                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleSubmit}
                                    className="w-full"
                                >
                                    CREATE
                                </Button>
                            </Box>
                        </div>
                    </Grid>
                </Box>
            </Modal>
        </div>
    );
}
