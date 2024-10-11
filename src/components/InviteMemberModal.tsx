import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Grid, TextField } from "@mui/material";
import { ApiResponse, Profile } from "@/utils/types";
import { useEffect, useState } from "react";
import { isValidEmail } from "@/utils/check.utils";

const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    minWidth: "400px",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 6,
};

export default function InviteMemberModal({
    open,
    addMember,
    handleClose,
    projectId,
}: {
    open: boolean;
    addMember: (member: Profile) => void;
    handleClose: () => void;
    projectId: string;
}) {
    const [email, setEmail] = React.useState("");
    const [errorMsg, setErrorMsg] = useState<string>("");

    // Clear the error message when the modal is re-opened.
    useEffect(() => {
        setErrorMsg("");
    }, [open]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (errorMsg) setErrorMsg("");
        setEmail(event.target.value);
    };

    const handleSubmit = async () => {
        if (!email.trim() || !isValidEmail(email)) {
            setErrorMsg("Please enter a valid email.");
            return;
        }
        try {
            const response = await fetch(`/api/projects/${projectId}/members`, {
                method: "POST",
                body: JSON.stringify({ email }),
            });

            const data: ApiResponse<Profile> = await response.json();
            if (!data.success) {
                setErrorMsg(data.data);
                return;
            }
            addMember(data.data);
            handleClose();
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
                                Invite Member
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
                                type="email"
                                id="outlined-basic"
                                label="Email"
                                variant="outlined"
                                className="w-full"
                                onChange={handleInputChange}
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
                                    Cancel
                                </Button>

                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleSubmit}
                                    className="w-full"
                                >
                                    INVITE
                                </Button>
                            </Box>
                        </div>
                    </Grid>
                </Box>
            </Modal>
        </div>
    );
}
