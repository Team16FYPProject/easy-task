import {
    Box,
    Button,
    Chip,
    FormControl,
    MenuItem,
    Modal,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    TextField,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { FormEvent, useEffect, useState } from "react";
import { ProjectTask } from "@/utils/types";
import dayjs, { Dayjs } from "dayjs";
import AddTaskModal from "./AddTaskModal";

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
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};
export default function SelectTeamModal({
    open,
    handleClose,
    setUpdatedTask,
    allProjects,
}: {
    open: boolean;
    handleClose: () => void;
    setUpdatedTask: React.Dispatch<React.SetStateAction<ProjectTask | null>>;
    allProjects: { project_id: string; project_name: string }[];
}) {
    const [projectID, setProjectID] = React.useState("");

    const handleOnClick = () => {
        handleClose();
        <AddTaskModal
            open={open}
            handleClose={handleClose}
            project_id={projectID}
            setUpdatedTask={function (value: React.SetStateAction<ProjectTask | null>): void {
                throw new Error("Function not implemented.");
            }}
            projectTasks={[]}
        ></AddTaskModal>;
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
                    <label>Select The Project You Would Like To Add A Task To</label>
                    <FormControl fullWidth>
                        <Select
                            defaultValue={""}
                            onChange={(e) => {
                                setProjectID(e.target.value);
                            }}
                        >
                            {allProjects.map((project) => (
                                <MenuItem key={project.project_id} value={project.project_id}>
                                    {project.project_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <div className="flex w-full justify-end">
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button variant="outlined" color="primary" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="contained" color="secondary" onClick={handleOnClick}>
                                Submit
                            </Button>
                        </Box>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}
