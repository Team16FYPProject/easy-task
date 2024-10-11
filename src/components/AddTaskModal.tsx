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

type ReminderOption = "One Hour Before" | "One Day Before" | "One Week Before";

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
    const [taskDeadline, setTaskDeadline] = useState<Dayjs | null>(null);
    const [taskStatus, setTaskStatus] = useState<string>("");
    const [taskPriority, setTaskPriority] = useState<string>("");
    const [taskLocation, setTaskLocation] = useState<string>("");
    const [taskMeetingBool, setTaskMeetingBool] = useState<boolean>(false);
    const [taskDuration, setTaskDuration] = useState<string>(""); // Handle as string for easier submission
    const [taskAssignee, setTaskAssignees] = useState<string[]>([]);
    const [error, setError] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);
    const [names, setNames] = useState<
        { user_id: string; first_name: string; last_name: string }[]
    >([]);

    const handleModalClose = () => {
        // Reset all form values
        setTaskName("");
        setTaskDescription("");
        setTaskParent("");
        setTaskDeadline(null);
        setTaskStatus("");
        setTaskPriority("");
        setTaskLocation("");
        setTaskMeetingBool(false);
        setTaskDuration("");
        setTaskAssignees([]);
        setTaskReminders([]); // Reset reminders
        handleClose();
    };

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (!taskDeadline) {
            setError("Task deadline is required to calculate reminders");
            setIsError(true);
            setTimeout(() => setIsError(false), 5000);
            return;
        }

        // Calculate the reminders based on selected options
        const reminderTimestamps = calculateReminderTimestamps(taskDeadline, taskReminders);

        const reminders = reminderTimestamps.map((timestamp) => ({
            reminder_datetime: timestamp.toISOString(),
        }));

        // Prepare to send data
        const route = `/api/projects/${project_id}/tasks`;
        const response = await fetch(route, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                project_id,
                taskName,
                taskDesc: taskDescription || null,
                taskDeadline: taskDeadline.toISOString(),
                taskPriority,
                taskParentId: taskParent || null,
                taskStatus,
                taskIsMeeting: taskMeetingBool,
                taskLocation: taskLocation || null,
                // taskAssignee: taskAssignee || null, // Assignees
                // taskReminder: reminders || null, // Reminders
                taskDuration: taskMeetingBool ? taskDuration : null, // Only set duration if it's a meeting
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!response.ok || !data.success) {
            setError(data.data);
            setIsError(true);
            setTimeout(() => setIsError(false), 5000);
        } else {
            setUpdatedTask(data.data);
            handleClose();
        }
    }

    {
        /* Reminder Functions */
    }
    const [taskReminders, setTaskReminders] = useState<ReminderOption[]>([]);
    const reminderOptions: ReminderOption[] = [
        "One Hour Before",
        "One Day Before",
        "One Week Before",
    ];

    const calculateReminderTimestamps = (deadline: Dayjs, reminders: ReminderOption[]): Dayjs[] => {
        return reminders.map((reminder) => {
            switch (reminder) {
                case "One Hour Before":
                    return deadline.subtract(1, "hour");
                case "One Day Before":
                    return deadline.subtract(1, "day");
                case "One Week Before":
                    return deadline.subtract(1, "week");
                default:
                    return deadline; // Fallback to deadline if unknown option
            }
        });
    };

    const handleReminderChange = (event: SelectChangeEvent<ReminderOption[]>) => {
        const {
            target: { value },
        } = event;
        setTaskReminders(
            typeof value === "string" ? [value as ReminderOption] : (value as ReminderOption[]),
        );
    };

    {
        /* Assignee Functions */
    }
    const handleAssigneeChange = (event: SelectChangeEvent<typeof taskAssignee>) => {
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
                            {/* Task Name*/}
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
                                                setTaskDeadline(newValue ? dayjs(newValue) : null)
                                            }
                                        />
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
                                {/* Location */}
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

                            {/* Reminders */}
                            <label>Reminders</label>
                            <FormControl fullWidth>
                                <Select
                                    multiple
                                    value={taskReminders}
                                    onChange={handleReminderChange}
                                    input={<OutlinedInput label="Chip" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {selected
                                                .sort((a, b) => {
                                                    const order = [
                                                        "One Hour Before",
                                                        "One Day Before",
                                                        "One Week Before",
                                                    ];
                                                    return order.indexOf(a) - order.indexOf(b); // so that the order is always 'One Hour Before' then 'One Day Before' then 'One Week Before'
                                                })
                                                .map((value) => (
                                                    <Chip key={value} label={value} />
                                                ))}
                                        </Box>
                                    )}
                                >
                                    {reminderOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Task Assignees */}
                            <FormControl fullWidth>
                                <label>Task Assignee</label>
                                <Select
                                    fullWidth
                                    multiple
                                    value={taskAssignee}
                                    onChange={handleAssigneeChange}
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
