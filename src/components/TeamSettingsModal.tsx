import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Grid, TextField } from "@mui/material";

import { useState } from "react";
import { ApiResponse } from "@/utils/types";
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
    projectId,
    projectName,
    projectDesc,
    updateProjectName,
}: {
    open: boolean;
    handleClose: () => void;
    projectId: string;
    projectName: string;
    projectDesc: string;
    updateProjectName: (name: string) => void;
}) {
    const [teamName, setTeamName] = React.useState(projectName);
    const [teamDesc, setTeamDesc] = React.useState(projectDesc);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTeamName(event.target.value);
    };

    const handleDescChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTeamDesc(event.target.value);
    };

    const handleSubmit = async () => {
        if (!teamName) {
            setErrorMsg("Please enter a team name.");
            return;
        }
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: "PATCH",
                body: JSON.stringify({
                    name: teamName,
                }),
            });

            const data: ApiResponse<void> = await response.json();
            if (!data.success) {
                setErrorMsg(data.data);
                return;
            }
            updateProjectName(teamName);
            handleClose(); // Close the modal
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
                                Project Settings
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
                                label="Edit Project Name"
                                variant="outlined"
                                className="w-full"
                                required
                                value={teamName}
                                onChange={handleNameChange}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="outlined-basic"
                                label="Edit Project Description"
                                variant="outlined"
                                className="w-full"
                                value={teamDesc}
                                multiline
                                rows={4}
                                onChange={handleDescChange}
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
