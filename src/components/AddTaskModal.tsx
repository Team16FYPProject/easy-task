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
export default function AddTaskModal({
    open,
    handleClose,
    project_id,
    setUpdatedTask,
    projectTasks,
}: {
    open: boolean;
    handleClose: () => void;
    project_id: string;
    setUpdatedTask: React.Dispatch<React.SetStateAction<ProjectTask | null>>;
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
    const [taskAssignee, setTaskAssignees] = useState<string[]>([]);
    const [error, setError] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);
    const [names, setNames] = useState<
        { user_id: string; first_name: string; last_name: string }[]
    >([]);

    const handleModalClose = () => {
        // reset all form values
        setTaskName("");
        setTaskDescription("");
        setTaskParent("");
        setTaskDeadline(null);
        setTaskStatus("");
        setTaskPriority("");
        setTaskReminder("");
        setTaskLocation("");
        setTaskMeetingBool(false);
        setTaskDuration("");
        setTaskAssignees([]);
        handleClose();
    };
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
                taskAssignee: taskAssignee || null,
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
            setUpdatedTask(data.data.taskData);
            handleClose();
        }
    }
    const handleChange = (event: SelectChangeEvent<typeof taskAssignee>) => {
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
                onClose={handleModalClose}
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
                                defaultValue={""}
                                onChange={(e) => {
                                    setTaskName(e.target.value);
                                }}
                            />
                            <label>Task Description</label>
                            <TextField
                                id="outlined-basic"
                                variant="outlined"
                                defaultValue={""}
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
                                            defaultValue={""}
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
                                            defaultValue={""}
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
                                            defaultValue={""}
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
                                            defaultValue={""}
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
                                            defaultValue={false}
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
                                    value={taskAssignee}
                                    onChange={handleChange}
                                    input={<OutlinedInput label="Chip" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const user = names.find((u) => u.user_id === value);
                                                return (
                                                    <Chip
                                                        key={value}
                                                        label={
                                                            user
                                                                ? `${user.first_name} ${user.last_name}`
                                                                : value
                                                        }
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                    MenuProps={MenuProps}
                                >
                                    {names.map((user) => (
                                        <MenuItem key={user.user_id} value={user.user_id}>
                                            {user.first_name + " " + user.last_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <div className="flex w-full justify-end">
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={handleClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button variant="contained" color="secondary" type="submit">
                                        Submit
                                    </Button>
                                </Box>
                            </div>
                        </div>
                    </form>
                </Box>
            </Modal>
        </div>
    );
}
