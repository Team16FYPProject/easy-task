import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    SelectChangeEvent,
    TextField,
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
    // form states
    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskDeadline, setTaskDeadline] = useState<Date | null>(new Date());
    const [taskParent, setTaskParent] = useState("");
    const [taskStatus, setTaskStatus] = useState("");
    const [taskPriority, setTaskPriority] = useState("");
    const [taskReminder, setTaskReminder] = useState("");
    const [taskLocation, setTaskLocation] = useState("");
    const [taskMeetingBool, setTaskMeetingBool] = useState("");
    const [taskDuration, setTaskDuration] = useState("");
    const [parent, setParent] = useState("");
    const [assignee, setTaskAssignees] = useState("");

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
                    <form className="flex flex-row gap-2 py-10" onSubmit={handleSubmit}>
                        <div className="flex h-full w-full flex-col gap-1 px-5 text-black">
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
                                        <Select
                                            value={parent}
                                            onChange={(e) => setTaskParent(e.target.value)}
                                            displayEmpty
                                        >
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
                            <div className="flex flex-row justify-between gap-10">
                                <div className="flex w-full flex-col">
                                    <label>Task Status</label>
                                    <FormControl fullWidth>
                                        <Select
                                            value={parent}
                                            onChange={(e) => setTaskStatus(e.target.value)}
                                            displayEmpty
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            <MenuItem value={10}>TODO</MenuItem>
                                            <MenuItem value={20}>IN PROGRESS</MenuItem>
                                            <MenuItem value={30}>COMPLETE</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className="flex w-full flex-col">
                                    <label>Task Priority</label>
                                    <FormControl fullWidth>
                                        <Select
                                            value={parent}
                                            onChange={(e) => setTaskPriority(e.target.value)}
                                            displayEmpty
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            <MenuItem>LOW</MenuItem>
                                            <MenuItem>MEDIUM</MenuItem>
                                            <MenuItem>HIGH</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="flex flex-row justify-between gap-10">
                                <div className="flex w-full flex-col">
                                    <label>Reminder</label>
                                    <FormControl fullWidth>
                                        <Select
                                            value={parent}
                                            onChange={(e) => setTaskReminder(e.target.value)}
                                            displayEmpty
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            <MenuItem value={10}>Ten</MenuItem>
                                            <MenuItem value={20}>Twenty</MenuItem>
                                            <MenuItem value={30}>Thirty</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className="flex w-full flex-col">
                                    <label>Location</label>
                                    <FormControl fullWidth>
                                        <TextField
                                            id="outlined-location"
                                            variant="outlined"
                                            onChange={(e) => setTaskLocation(e.target.value)}
                                        />
                                    </FormControl>
                                </div>
                            </div>
                            <div className="flex flex-row justify-between gap-10">
                                <div className="flex w-full flex-col">
                                    <label>Desinate Meeting</label>
                                    <FormControl fullWidth>
                                        <Select
                                            value={parent}
                                            onChange={(e) => setTaskMeetingBool(e.target.value)}
                                            displayEmpty
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            <MenuItem value={10}>Ten</MenuItem>
                                            <MenuItem value={20}>Twenty</MenuItem>
                                            <MenuItem value={30}>Thirty</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className="flex w-full flex-col">
                                    <label>Meeting Duration</label>
                                    <FormControl fullWidth>
                                        <Select
                                            value={parent}
                                            onChange={(e) => setTaskDuration(e.target.value)}
                                            displayEmpty
                                        >
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
                            <FormControl fullWidth>
                                <Select
                                    value={parent}
                                    onChange={(e) => setTaskAssignees(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="Task Assignees">
                                        <em>None</em>
                                    </MenuItem>
                                    <MenuItem value={10}>Ten</MenuItem>
                                    <MenuItem value={20}>Twenty</MenuItem>
                                    <MenuItem value={30}>Thirty</MenuItem>
                                </Select>
                            </FormControl>
                            <div className="flex w-full justify-end">
                                <button
                                    type="submit"
                                    className="my-3 rounded-md p-2 text-xl text-purple-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="my-3 rounded-md p-2 text-xl text-purple-500"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </form>
                </Box>
            </Modal>
        </div>
    );
}
