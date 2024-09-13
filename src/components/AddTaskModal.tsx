import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    SelectChangeEvent,
    Typography,
} from "@mui/material";
import { FormEvent, useState } from "react";

const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 1200,
    height: 800,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
};
export default function AddTaskModal({
    open,
    handleClose,
}: {
    open: boolean;
    handleClose: () => void;
}) {
    const [taskName, setTaskName] = useState<string>("");
    const [taskDescription, setTaskDescription] = useState<string>("");
    const [taskDeadline, setTaskDeadline] = useState<Date | null>(new Date());
    const [parent, setParent] = useState("");
    const handleChange = (event: SelectChangeEvent) => {
        setParent(event.target.value as string);
    };
    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        return;
    }
    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <label className="p-5 text-2xl">Create Task</label>
                    <form className="flex flex-row gap-2" onSubmit={handleSubmit}>
                        <div className="flex w-11/12 flex-col gap-1 px-5 text-black">
                            <label>Task Name</label>
                            <input
                                className="rounded-md border-2 border-solid border-gray-600 p-2"
                                value={taskName}
                                onChange={(e) => setTaskName(e.target.value)}
                            />
                            <label>Task Description</label>
                            <input
                                className="rounded-md border-2 border-solid border-gray-600 p-2"
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                            />
                            <div className="flex flex-row justify-between gap-10">
                                <div className="flex w-full flex-col">
                                    <label>Task Deadline</label>
                                    <input
                                        className="rounded-md border-2 border-solid border-gray-600 p-2"
                                        type="date"
                                        value={
                                            taskDeadline
                                                ? taskDeadline.toISOString().split("T")[0]
                                                : ""
                                        }
                                        onChange={(e) => setTaskDeadline(e.target.valueAsDate)}
                                    />
                                </div>
                                <div className="flex w-full flex-col">
                                    <label>Task Parent</label>
                                    <FormControl fullWidth>
                                        <Select value={parent} onChange={handleChange} displayEmpty>
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            <MenuItem value={10}>Ten</MenuItem>
                                            <MenuItem value={20}>Twenty</MenuItem>
                                            <MenuItem value={30}>Thirty</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                        </div>
                    </form>
                </Box>
            </Modal>
        </div>
    );
}
