import { Button, FormControl, InputLabel, MenuItem } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import React, { useEffect, useState } from "react";
import { Project } from "../utils/lib/types";
// Types
/**
 * @param id: The id of the card, has to be unique
 * @param title: The title of the card
 * @param column: The column to which it belongs to i.e todo,doing,complete
 */
type CardType = {
    id: string;
    title: string;
    column: string;
};
/**
 * @param title: The title of the card
 * @param column: The column to which it belongs to i.e todo,doing,complete
 * @param cards: The cards that are associated with this column
 * @param setCards: Function to update card state
 */
type ColumnProps = {
    title: string;
    column: string;
    cards: CardType[];
    setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
};
/**
 * @param id: The id of the card, has to be unique
 * @param title: The title of the card
 * @param column: The column to which it belongs to i.e todo,doing,complete
 * @param handleDragStart: Function to start drag event
 */
type CardProp = {
    id: string;
    title: string;
    column: string;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, card: CardType) => void;
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
            <Board {...projects} />
        </div>
    );
};

/**
 * Actual board of the Kanban Board
 * @returns react component with board of the Kanban Board
 */
export const Board = (projects: Project[]) => {
    const [cards, setCards] = useState(TestCards); // state for the cards
    const [open, setOpen] = React.useState(false); // state for modal task add
    const handleOpen = () => setOpen(true); // opens modal
    const handleClose = () => setOpen(false); // closes modal
    const [team, setTeam] = React.useState(""); // state for selected team
    // convert js object into array
    projects = Object.values(projects);
    const handleChange = (event: SelectChangeEvent) => {
        const oldTeam = team;
        //updates team state on selection change
        setTeam(event.target.value as string);

        if (oldTeam === "Team 1") {
            TestCards = cards;
        } else if (oldTeam === "Team 2") {
            TestCards2 = cards;
        } else {
            TestCards3 = cards;
        }

        // set the cards to be a new array, make sure to save the old array
        if ((event.target.value as string) === "Team 1") {
            setCards(TestCards);
        } else if ((event.target.value as string) === "Team 2") {
            setCards(TestCards2);
        } else {
            setCards(TestCards3);
        }
    };
    return (
        <div className="flex-col">
            <div className="flex justify-between p-5">
                <div className="flex items-center gap-3">
                    <h3 className="text-3xl">Kanban View</h3>
                    <FormControl sx={{ minWidth: 120 }} size="small">
                        <InputLabel id="select-team-label">Team</InputLabel>
                        <Select
                            labelId="select-team-label"
                            id="simple-team-select"
                            value={team}
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
                </div>
                <Button variant="contained" color="secondary" onClick={handleOpen}>
                    CREATE TASK
                </Button>
            </div>
            {/* Renders the actual columns of the Kanban Board */}
            <div className="flex h-full w-full justify-center gap-5 p-10 md:min-h-[750px]">
                <Column title="TO DO" column="todo" cards={cards} setCards={setCards} />
                <Column title="IN PROGRESS" column="doing" cards={cards} setCards={setCards} />
                <Column title="COMPLETE" column="complete" cards={cards} setCards={setCards} />
            </div>
        </div>
    );
};
/**
 * Column component for the Kanban Board
 * @param {ColumnProps}
 * @returns react component with columns of the Kanban Board
 */
const Column: React.FC<ColumnProps> = ({ title, column, cards, setCards }) => {
    const [active, setActive] = useState(false); // state for active drag
    const filteredCards = cards.filter((c) => c.column === column); // filters cards to only those in the same column

    // function to handle the start of a drag
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: CardType) => {
        e.dataTransfer.setData("cardId", card.id); // pass the id of the card
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

            let cardToBeTransferred = copy.find((c) => c.id === cardId); // find the id of the card to be moved
            if (!cardToBeTransferred) return;

            cardToBeTransferred = { ...cardToBeTransferred, column }; //update the card's column

            copy = copy.filter((c) => c.id !== cardId); // get all cards other than the one we need to move

            const oldPos = before === "-1"; // check to see if we add to end of list

            if (oldPos) {
                copy.push(cardToBeTransferred); // add card to the end of the list
            } else {
                const insertIndex = copy.findIndex((elm) => elm.id === before); //find index to insert at
                copy.splice(insertIndex, 0, cardToBeTransferred); // insert the card at position
            }
            setCards(copy);
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
                    return <Card key={c.id} {...c} handleDragStart={handleDragStart} />;
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
const Card: React.FC<CardProp> = ({ title, id, column, handleDragStart }) => {
    return (
        <>
            <DropIndicator beforeId={id} column={column} />
            <div
                draggable="true"
                onDragStart={(e) => handleDragStart(e, { title, id, column })}
                className="cursor-grab rounded border border-neutral-700 bg-white p-3 active:cursor-grabbing"
            >
                <p className="text-sm text-black">{title}</p>
            </div>
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
let TestCards = [
    { title: "Create Kanban Screen", id: "1", column: "todo" },
    { title: "Create Kanban Screen", id: "2", column: "todo" },
    { title: "Placeholder", id: "5", column: "todo" },
    { title: "Placeholder", id: "6", column: "complete" },
    { title: "Placeholder", id: "7", column: "complete" },
    { title: "Placeholder", id: "8", column: "complete" },
    { title: "Placeholder", id: "9", column: "complete" },
    { title: "Placeholder", id: "10", column: "complete" },
    { title: "Placeholder", id: "11", column: "complete" },
    { title: "Placeholder", id: "12", column: "complete" },
    { title: "Placeholder", id: "13", column: "complete" },
    { title: "Placeholder", id: "14", column: "complete" },
    { title: "Placeholder", id: "15", column: "complete" },
    { title: "Placeholder", id: "16", column: "complete" },
    { title: "Placeholder", id: "17", column: "complete" },
    { title: "Placeholder", id: "18", column: "complete" },

    { title: "Hello", id: "3", column: "doing" },
    { title: "Placeholder", id: "4", column: "complete" },
];
let TestCards2 = [
    { title: "Testing", id: "1", column: "todo" },
    { title: "Placeholder", id: "17", column: "complete" },
    { title: "Placeholder", id: "18", column: "complete" },

    { title: "Hello", id: "3", column: "doing" },
    { title: "Placeholder", id: "4", column: "complete" },
];

let TestCards3 = [
    { title: "Testing", id: "1", column: "complete" },
    { title: "Placeholder", id: "17", column: "complete" },
    { title: "Placeholder", id: "18", column: "complete" },

    { title: "Hello", id: "3", column: "complete" },
    { title: "Placeholder", id: "4", column: "complete" },
];
