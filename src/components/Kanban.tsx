/* eslint-disable prettier/prettier */
import { Button, FormControl, InputLabel, MenuItem } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import React, { useEffect, useState } from "react";
import { Project } from "../utils/lib/types";
import AddTaskModal from "./AddTaskModal";
import { determineBgColor, determineTextColor } from "../utils/colourUtils";
import { ProjectTask } from "@/utils/types";
import ViewTaskModal from "@/components/ViewTaskModal";
// Types

/**
 * @param title: The title of the column
 * @param column: The column to which it belongs to i.e todo,doing,complete
 * @param cards: The cards that are associated with this column
 * @param setCards: Function to update card state
 */
type ColumnProps = {
    title: string;
    column: string;
    cards: ProjectTask[];
    setCards: React.Dispatch<React.SetStateAction<ProjectTask[]>>;
    setTasksDict: React.Dispatch<React.SetStateAction<Map<string, { tasks: ProjectTask[] }>>>;
};
/**
 * @param project_id: The id of the project
 * @param task_creator_id: The creator of the task
 * @param task_deadline: The date at which the task is due
 * @param task_desc: Description of the task
 * @param task_id: The id of the task
 * @param task_is_meeting: If the task has a meeting;
 * @param task_location: The location of the task;
 * @param task_name: The name of the task;
 * @param task_parent_id: The parent of the task if any;
 * @param task_priority: The priority of the task;
 * @param task_time_spent: How much time is spent on the task;
 * @param task_status: Current status of the task;
 * @param handleDragStart: Function to start drag event
 */
type CardProp = {
    project_id: string;
    task_creator_id: string;
    task_deadline: string;
    task_desc: string;
    task_id: string;
    task_is_meeting: boolean;
    task_location: string;
    task_name: string;
    task_parent_id: string;
    task_priority: string;
    task_time_spent: number;
    task_status: string;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, card: ProjectTask) => void;
};
/**
 * @param beforeId: The id of the column it is being dragged from
 * @param column: The column to which it belongs to i.e todo,doing,complete
 */
type DropIndicatorProps = {
    beforeId: string | null;
    column: string;
};

interface KanbanBoardProps {
    projects: Project[];
}

/**
 * Kanban Board component
 * @returns react component of a Kanban Board
 */
export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projects }) => {
    return (
        <div className="h-full w-full">
            <Board projects={projects} />
        </div>
    );
};

/**
 * Actual board of the Kanban Board
 * @returns react component with board of the Kanban Board
 */
export const Board = ({ projects }: { projects: Project[] }) => {
    const [cards, setCards] = useState<ProjectTask[]>([]); // state for the cards
    const [open, setOpen] = React.useState(false); // state for modal task add

    const handleOpen = () => setOpen(true); // opens modal
    const handleClose = () => setOpen(false); // closes modal
    const [loading, setLoading] = useState(true); // loading state for fetching tasks
    const [teamId, setTeamId] = React.useState(""); // state for selected team id
    const [tasksDict, setTasksDict] = useState(new Map());
    const [newTask, setNewTask] = useState("");
    useEffect(() => {
        async function handleUpdate() {
            if (teamId && newTask && tasksDict) {
                // get the tasks array for the current team
                const updatedTasks = [...(tasksDict.get(teamId)?.tasks || [])];

                // add the new task to the copied tasks array
                updatedTasks.push(newTask);

                // update the tasks array in the dictionary
                tasksDict.set(teamId, { ...tasksDict.get(teamId), tasks: updatedTasks });

                // update the state with the new array of tasks
                setCards(updatedTasks);

                // update taskDict state
                setTasksDict(tasksDict);
            }
        }

        handleUpdate();
    }, [newTask, tasksDict, teamId]);
    // fetch all tasks from the database
    useEffect(() => {
        async function fetchTasks() {
            // iterate through all projects and fetch tasks
            // for each project store:
            // {project_id:tasks}
            const tasksDict = new Map();
            const fetchPromises = projects.map(async (p) => {
                try {
                    const route = `/api/projects/${p.project_id}/tasks`;
                    const response = await fetch(route, {
                        method: "GET",
                        credentials: "include",
                    });
                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.data || "Failed to fetch tasks");
                    }
                    if (result.success) {
                        tasksDict.set(p.project_id, result);
                    } else {
                        throw new Error("Failed to fetch tasks");
                    }
                } catch (e) {
                    console.error(`Error fetching tasks for project ${p.project_id}:`, e);
                }
            });
            await Promise.all(fetchPromises);

            setTasksDict(tasksDict);
            console.log(tasksDict);
            if (tasksDict.size > 0) {
                setLoading(false);
                setTeamId(projects[0].project_id);
            }
        }

        fetchTasks();
    }, [projects]);

    // Set cards to selected team
    useEffect(() => {
        if (tasksDict.has(teamId)) {
            // set the cards to be a new array
            setCards(tasksDict.get(teamId).tasks);
        }
    }, [teamId]);

    const handleChange = (event: SelectChangeEvent) => {
        const newTeamId = event.target.value;
        //updates team state on selection change
        setTeamId(newTeamId);
    };

    return (
        <div className="flex-col">
            <div className="flex justify-between p-5">
                <div className="flex items-center gap-3">
                    <h3 className="text-3xl">Kanban View</h3>
                    <FormControl sx={{ minWidth: 120 }} size="small" disabled={loading}>
                        <InputLabel id="select-team-label">Team</InputLabel>
                        <Select
                            labelId="select-team-label"
                            id="simple-team-select"
                            value={teamId}
                            label="Team"
                            onChange={handleChange}
                        >
                            {/* For each project, create a menu item for it */}
                            {projects.map((project) => (
                                <MenuItem key={project.project_id} value={project.project_id}>
                                    {project.project_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {loading && <p>Loading tasks...</p>} {/* Loading indicator */}
                </div>
                <div>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleOpen}
                        disabled={teamId == ""}
                    >
                        CREATE TASK
                    </Button>
                    <AddTaskModal
                        open={open}
                        handleClose={handleClose}
                        project_id={`${teamId}`}
                        setNewTask={setNewTask}
                        projectTasks={cards}
                    />
                </div>
            </div>
            {/* Renders the actual columns of the Kanban Board */}
            <div className="flex h-full w-full justify-center gap-5 p-10 md:min-h-[750px]">
                <Column
                    title="TO DO"
                    column="TODO"
                    cards={cards}
                    setCards={setCards}
                    setTasksDict={setTasksDict}
                />
                <Column
                    title="IN PROGRESS"
                    column="DOING"
                    cards={cards}
                    setCards={setCards}
                    setTasksDict={setTasksDict}
                />
                <Column
                    title="COMPLETE"
                    column="COMPLETE"
                    cards={cards}
                    setCards={setCards}
                    setTasksDict={setTasksDict}
                />
            </div>
        </div>
    );
};
/**
 * Column component for the Kanban Board
 * @param {ColumnProps}
 * @returns react component with columns of the Kanban Board
 */
export const Column: React.FC<ColumnProps> = ({ title, column, cards, setCards, setTasksDict }) => {
    async function handleTaskStatus(cardToBeTransferred: ProjectTask) {
        if (!cardToBeTransferred) {
            console.error("No card to transfer");
            return;
        }
        try {
            const route = `/api/projects/${cardToBeTransferred.project_id}/tasks/${cardToBeTransferred.task_id}`;
            await fetch(route, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    task_status: cardToBeTransferred.task_status,
                }),
            });
        } catch (e) {
            console.error(
                `Error updating task status for project ${cardToBeTransferred?.project_id}:`,
                e,
            );
            // setError("An error occurred while updating the task status.");
        }
    }

    const [active, setActive] = useState(false); // state for active drag
    // const [error, setError] = useState<string>("");
    const filteredCards = cards.filter((c) => c.task_status === column); // filters cards to only those in the same column

    // function to handle the start of a drag
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: ProjectTask) => {
        e.dataTransfer.setData("cardId", card.task_id); // pass the id of the card
    };

    // function to handle an active drag
    // highlight closest indicator and set drag state to active
    const handleActiveDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        highlight(e);
        setActive(true);
    };

    // function to highlight the closest drop indicator
    // get all indicators and clear them all, only set opacity of closest indicator to 1
    const highlight = (e: React.DragEvent<HTMLDivElement>) => {
        const indicator = getindicator();
        clearAllHighlights(indicator);
        const elm = getClosestIndicator(e, indicator);
        elm.element.style.opacity = "1";
    };

    // function to clear all highlights when we drop an element
    // clear all highlights by iterating through array and setting all opacities to 0
    const clearAllHighlights = (elm?: HTMLElement[]) => {
        const indicator = elm || getindicator();
        indicator.forEach((e) => {
            e.style.opacity = "0";
        });
    };

    // function to get the closest drop indicator based on mouse position
    const getClosestIndicator = (e: React.DragEvent<HTMLDivElement>, indicator: HTMLElement[]) => {
        const OFFSET = 50;

        const elm = indicator.reduce(
            (closest, child) => {
                // get smallest rectangle which contains the entire element
                const box = child.getBoundingClientRect();

                // calculate the offset
                const offset = e.clientY - (box.top + OFFSET);

                // if closer, update closest element, otherwise return the closest
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            },
            {
                offset: Number.NEGATIVE_INFINITY, // initial offset value
                element: indicator[indicator.length - 1], // default to last element
            },
        );

        return elm;
    };
    // function to get all indicators in the same column
    const getindicator = (): HTMLElement[] => {
        return Array.from(document.querySelectorAll(`[data-column="${column}"]`)) as HTMLElement[];
    };

    // function to handle when we drag out the column
    const handleDragInactive = () => {
        setActive(false); // deactive drag state
        clearAllHighlights(); // clear all highlights
    };

    // function to handle when we drop the card
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        const cardId = e.dataTransfer.getData("cardId"); // retrieve the data
        setActive(false); //deactive drag state
        clearAllHighlights(); // clear all highlights

        // get all indicators and find the closest one
        const indicator = getindicator();
        const { element } = getClosestIndicator(e, indicator);

        // get the id of the card before which the dropped card would be inserted
        const before = element.dataset.before || "-1";

        // if card position has changed, move it
        if (before !== cardId) {
            let copy = [...cards]; // create a copy of the cards

            let cardToBeTransferred = copy.find((c) => c.task_id === cardId); // find the id of the card to be moved
            if (!cardToBeTransferred) return;

            cardToBeTransferred = { ...cardToBeTransferred, task_status: column }; //update the card's status

            copy = copy.filter((c) => c.task_id !== cardId); // get all cards other than the one we need to move

            const oldPos = before === "-1"; // check to see if we add to end of list

            if (oldPos) {
                copy.push(cardToBeTransferred); // add card to the end of the list
            } else {
                const insertIndex = copy.findIndex((elm) => elm.task_id === before); //find index to insert at
                copy.splice(insertIndex, 0, cardToBeTransferred); // insert the card at position
            }
            // change the cards to be the new array
            setCards(copy);

            // Update the tasksDict state
            setTasksDict((tasksDict) => {
                const projectTasks = tasksDict.get(cardToBeTransferred.project_id);
                if (projectTasks) {
                    projectTasks.tasks = copy;
                    tasksDict.set(cardToBeTransferred.project_id, projectTasks);
                }
                return tasksDict;
            });

            // need to also change the data in the db
            handleTaskStatus(cardToBeTransferred);
        }
    };

    return (
        <div className="w-1/3 shrink-0 px-2">
            <div className="mb-4 flex justify-center">
                <h3 className={`font-bold text-black`}>{title}</h3>
            </div>
            <div
                onDragOver={handleActiveDrag}
                onDragLeave={handleDragInactive}
                onDrop={handleDragEnd}
                className={`h-full w-full rounded-md transition-colors ${active ? "bg-gray-400" : "bg-gray-100"}`}
            >
                {/*Renders the filtered cards */}
                {filteredCards.map((c) => {
                    return (
                        <Card
                            key={c.task_id}
                            {...c}
                            task_id={c.task_id}
                            handleDragStart={handleDragStart}
                        />
                    );
                })}
                <DropIndicator beforeId={null} column={column} />
            </div>
        </div>
    );
};
/**
 * Card component of the columns each card represents a task
 * @param {CardProp}
 * @returns react component with cards of the individual columns
 */
const Card: React.FC<CardProp> = ({
    project_id,
    task_creator_id,
    task_deadline,
    task_desc,
    task_id,
    task_is_meeting,
    task_location,
    task_name,
    task_parent_id,
    task_priority,
    task_status,
    task_time_spent,
    handleDragStart,
}) => {
    const bgColor = determineBgColor(task_priority);
    const textColor = determineTextColor(task_priority);
    const [viewTaskOpen, setViewTaskOpen] = React.useState(false); // state for modal task view
    const handleCardClick = () => {
        setViewTaskOpen(true);
    };

    const handleCloseModal = () => {
        setViewTaskOpen(false);
    };

    return (
        <>
            <DropIndicator beforeId={task_id} column={task_status} />
            <div
                draggable="true"
                onDragStart={(e) =>
                    handleDragStart(e, {
                        project_id,
                        task_creator_id,
                        task_deadline,
                        task_desc,
                        task_id,
                        task_is_meeting,
                        task_location,
                        task_name,
                        task_parent_id,
                        task_priority,
                        task_status,
                        task_time_spent,
                    })
                }
                style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    marginLeft: "6px",
                    marginRight: "6px",
                }}
                onClick={handleCardClick}
                className={`0 active:cursor-grabbing} cursor-grab rounded p-3`}
            >
                <div className="flex-col text-sm" style={{ color: textColor }}>
                    <strong>{task_name}</strong>
                    <p>
                        {" "}
                        {new Intl.DateTimeFormat("en-AU", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        }).format(new Date(task_deadline))}
                    </p>
                    <p>{task_priority}</p>
                </div>
            </div>
            {viewTaskOpen && (
                <ViewTaskModal
                    open={viewTaskOpen}
                    handleCloseModal={handleCloseModal}
                    // onClose={handleCloseModal}
                    task={{
                        project_id,
                        task_creator_id,
                        task_deadline,
                        task_desc,
                        task_id,
                        task_is_meeting,
                        task_location,
                        task_name,
                        task_parent_id,
                        task_priority,
                        task_status,
                        task_time_spent,
                    }}
                />
            )}
        </>
    );
};
/**
 * Drop indicator component, this is what gives the lines under the cards depicting where it will drop
 * @param {DropIndicatorProps}
 * @returns react component showing where card will drop
 */
const DropIndicator: React.FC<DropIndicatorProps> = ({ beforeId, column }) => {
    return (
        <div
            data-before={beforeId || "-1"}
            data-column={column}
            className="my-0.5 h-0.5 w-full bg-pink-700 opacity-0"
        />
    );
};
