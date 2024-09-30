import {
    Box,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    TextField,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FormEvent, useEffect, useState } from "react";
import { ProjectTask } from "@/utils/types";
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
export default function AddTaskModal({
    open,
    handleClose,
    project_id,
    setNewTask,
    projectTasks,
}: {
    open: boolean;
    handleClose: () => void;
    project_id: string;
    setNewTask: (newTask: string) => void;
    projectTasks: ProjectTask[];
}) {
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
    const [assignee, setTaskAssignees] = useState<string[]>([]);
    const [error, setError] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);
    const [names, setNames] = useState<
        { user_id: string; first_name: string; last_name: string }[]
    >([]);

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
                taskDuration: taskDuration || null,
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
    const handleChange = (event: SelectChangeEvent<typeof assignee>) => {
        const {
            target: { value },
        } = event;
        setTaskAssignees(
            // On autofill we get a stringified value.
            typeof value === "string" ? value.split(",") : value,
        );
    };
    useEffect(() => {
        async function fetchTeamMembers() {
            if (project_id && open) {
                try {
                    const route = `/api/projects/${project_id}/members`;
                    const response = await fetch(route, {
                        method: "GET",
                        credentials: "include",
                    });
                    const result = await response.json();
                    setNames(result.users);
                    console.log(names);
                    //setNames(result.users.map((u)=> u.first_name,u.user_id))
                } catch (e) {
                    console.error(`Error fetching members for project ${project_id}`, e);
                }
            }
        }
        fetchTeamMembers();
    }, [handleClose]);

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
                            <TextField
                                id="outlined-basic"
                                variant="outlined"
                                value={taskName}
                                onChange={(e) => {
                                    setTaskName(e.target.value);
                                }}
                            />
                            <label>Task Description</label>
                            <TextField
                                id="outlined-basic"
                                variant="outlined"
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
                                        <DateTimePicker
                                            disablePast
                                            onChange={(newValue) =>
                                                setTaskDeadline(
                                                    newValue
                                                        ? new Date(newValue.toISOString())
                                                        : null,
                                                )
                                            }
                                        ></DateTimePicker>
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
                                            {projectTasks.map((task) => (
                                                <MenuItem key={task.task_id} value={task.task_id}>
                                                    {task.task_name}
                                                </MenuItem>
                                            ))}
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
                                            <MenuItem value={"HOUR"}>One Hour Before</MenuItem>
                                            <MenuItem value={"DAY"}>One Day Before</MenuItem>
                                            <MenuItem value={"WEEK"}>One Week Before</MenuItem>
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
                                <label>Task Assignee</label>
                                <Select
                                    fullWidth
                                    multiple
                                    value={assignee}
                                    onChange={handleChange}
                                    input={<OutlinedInput label="Chip" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>
                                    )}
                                    MenuProps={MenuProps}
                                >
                                    {names.map((user) => (
                                        <MenuItem
                                            key={user.user_id}
                                            value={user.first_name + " " + user.last_name}
                                        >
                                            {user.first_name + " " + user.last_name}
                                        </MenuItem>
                                    ))}
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
