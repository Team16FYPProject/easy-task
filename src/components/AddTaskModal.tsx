import { Box, FormControl, MenuItem, Modal, Select, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FormEvent, useState } from "react";
const style = {
    position: "absolute",
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
    project_id,
    setNewTask,
}: {
    open: boolean;
    handleClose: () => void;
    project_id: string;
    setNewTask: (newTask: string) => void;
}) {
    // form states
    const [taskName, setTaskName] = useState<string>("");
    const [taskDescription, setTaskDescription] = useState<string | null>(null);
    const [taskParent, setTaskParent] = useState<string>("");
    const [taskDeadline, setTaskDeadline] = useState<Date | null>(null);
    const [taskStatus, setTaskStatus] = useState<string>("");
    const [taskPriority, setTaskPriority] = useState<string>("");
    const [taskReminder, setTaskReminder] = useState<string>("");
    const [taskLocation, setTaskLocation] = useState<string>("");
    const [taskMeetingBool, setTaskMeetingBool] = useState<boolean>(false);
    const [taskDuration, setTaskDuration] = useState<string>("");
    const [assignee, setTaskAssignees] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const route = `/api/projects/${project_id}/tasks`;
        const response = await fetch(route, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                taskName,
                taskDescription: taskDescription || null,
                taskDeadline,
                taskPriority,
                taskParent: taskParent || null,
                taskStatus,
                taskMeetingBool,
                taskLocation: taskLocation || null,
                taskDuration,
            }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            setError(data.data);
            setIsError(true);
            setTimeout(() => {
                setIsError(false);
            }, 5000);
        } else {
            setNewTask(data.data.taskData);
            handleClose();
        }
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
                    <label hidden={!isError} className="text-red-600">
                        {error}
                    </label>
                    <form className="flex flex-row gap-2 py-10" onSubmit={handleSubmit}>
                        <div className="flex h-full w-full flex-col gap-1 px-5 text-black">
                            <label>
                                Task Name <span className="text-red-600">*</span>
                            </label>
                            <input
                                className="rounded-md border-2 border-solid border-gray-600 p-2"
                                value={taskName}
                                onChange={(e) => {
                                    setTaskName(e.target.value);
                                }}
                            />
                            <label>Task Description</label>
                            <input
                                className="rounded-md border-2 border-solid border-gray-600 p-2"
                                value={taskDescription ?? ""}
                                onChange={(e) => {
                                    setTaskDescription(e.target.value);
                                }}
                            />
                            <div className="flex flex-row justify-between gap-10">
                                <div className="flex w-full flex-col">
                                    <label>
                                        Task Deadline<span className="text-red-600">*</span>
                                    </label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            disablePast
                                            onChange={(newValue) =>
                                                setTaskDeadline(
                                                    newValue
                                                        ? new Date(newValue.toISOString())
                                                        : null,
                                                )
                                            }
                                        ></DatePicker>
                                    </LocalizationProvider>
                                </div>
                                <div className="flex w-full flex-col">
                                    <label>Task Parent</label>
                                    <FormControl fullWidth>
                                        <Select
                                            value={taskParent}
                                            onChange={(e) => {
                                                setTaskParent(e.target.value);
                                            }}
                                        >
                                            <MenuItem value={10}>Ten</MenuItem>
                                            <MenuItem value={20}>Twenty</MenuItem>
                                            <MenuItem value={30}>Thirty</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="flex flex-row justify-between gap-10">
                                <div className="flex w-full flex-col">
                                    <label>
                                        Task Status<span className="text-red-600">*</span>
                                    </label>
                                    <FormControl fullWidth>
                                        <Select
                                            value={taskStatus}
                                            onChange={(e) => {
                                                setTaskStatus(e.target.value);
                                            }}
                                        >
                                            <MenuItem value={"TODO"}>TODO</MenuItem>
                                            <MenuItem value={"DOING"}>IN PROGRESS</MenuItem>
                                            <MenuItem value={"COMPLETE"}>COMPLETE</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className="flex w-full flex-col">
                                    <label>
                                        Task Priority<span className="text-red-600">*</span>
                                    </label>
                                    <FormControl fullWidth>
                                        <Select
                                            value={taskPriority}
                                            onChange={(e) => {
                                                setTaskPriority(e.target.value);
                                            }}
                                        >
                                            <MenuItem value={"LOW"}>LOW</MenuItem>
                                            <MenuItem value={"MEDIUM"}>MEDIUM</MenuItem>
                                            <MenuItem value={"HIGH"}>HIGH</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="flex flex-row justify-between gap-10">
                                <div className="flex w-full flex-col">
                                    <label>Reminder</label>
                                    <FormControl fullWidth>
                                        <Select
                                            value={taskReminder}
                                            onChange={(e) => {
                                                setTaskReminder(e.target.value);
                                            }}
                                        >
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
                                            onChange={(e) => {
                                                setTaskLocation(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                </div>
                            </div>
                            <div className="flex flex-row justify-between gap-10">
                                <div className="flex w-full flex-col">
                                    <label>Designate Meeting</label>
                                    <FormControl fullWidth>
                                        <Select
                                            value={taskMeetingBool}
                                            onChange={(e) => {
                                                setTaskMeetingBool(
                                                    e.target.value === "true" ? true : false,
                                                );
                                            }}
                                        >
                                            <MenuItem value={"true"}>True</MenuItem>
                                            <MenuItem value={"false"}>False</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                                <div className="flex w-full flex-col">
                                    <label>Meeting Duration</label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <TimePicker
                                            onChange={() => {
                                                setTaskDuration(
                                                    taskDuration
                                                        ? taskDuration.toString().split("T")[0]
                                                        : "",
                                                );
                                            }}
                                            ampm={false} // 24-hour format
                                        />
                                    </LocalizationProvider>
                                </div>
                            </div>
                            <FormControl fullWidth>
                                <Select
                                    value={assignee}
                                    onChange={(e) => {
                                        setTaskAssignees(e.target.value);
                                    }}
                                >
                                    <MenuItem value={10}>Ten</MenuItem>
                                    <MenuItem value={20}>Twenty</MenuItem>
                                    <MenuItem value={30}>Thirty</MenuItem>
                                </Select>
                            </FormControl>
                            <div className="flex w-full justify-end">
                                <button
                                    type="submit"
                                    className="my-3 rounded-md p-2 text-xl text-purple-500"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="my-3 rounded-md p-2 text-xl text-purple-500"
                                    onClick={handleSubmit}
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
