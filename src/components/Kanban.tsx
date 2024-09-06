import React, { useState } from "react";

type CardType = {
    id: string;
    title: string;
    column: string;
};

type ColumnProps = {
    title: string;
    column: string;
    cards: CardType[];
    setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
};

type CardProp = {
    id: string;
    title: string;
    column: string;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, card: CardType) => void;
};

type DropIndicatorProps = {
    beforeId: string | null;
    column: string;
};
export const KanbanBoard = () => {
    return (
        <div className="h-full w-full">
            <Board />
        </div>
    );
};

export const Board = () => {
    const [cards, setCards] = useState(TestCards);
    return (
        <div className="flex h-full w-full justify-center gap-5 p-10">
            <Column title="TO DO" column="todo" cards={cards} setCards={setCards} />
            <Column title="IN PROGRESS" column="doing" cards={cards} setCards={setCards} />
            <Column title="COMPLETE" column="complete" cards={cards} setCards={setCards} />
        </div>
    );
};

const Column: React.FC<ColumnProps> = ({ title, column, cards, setCards }) => {
    const [active, setActive] = useState(false);
    const filteredCards = cards.filter((c) => c.column === column);
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: CardType) => {
        e.dataTransfer.setData("cardId", card.id);
    };
    const handleActiveDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        highlight(e);
        setActive(true);
    };
    const highlight = (e: React.DragEvent<HTMLDivElement>) => {
        const indicator = getindicator();
        clearAllHighlights(indicator);
        const elm = getClosestIndicator(e, indicator);
        elm.element.style.opacity = "1";
    };
    const clearAllHighlights = (elm?: HTMLElement[]) => {
        const indicator = elm || getindicator();
        indicator.forEach((e) => {
            e.style.opacity = "0";
        });
    };
    const getClosestIndicator = (e: React.DragEvent<HTMLDivElement>, indicator: HTMLElement[]) => {
        const OFFSET = 50;

        const elm = indicator.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();

                const offset = e.clientY - (box.top + OFFSET);

                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            },
            {
                offset: Number.NEGATIVE_INFINITY,
                element: indicator[indicator.length - 1],
            },
        );

        return elm;
    };

    const getindicator = (): HTMLElement[] => {
        return Array.from(document.querySelectorAll(`[data-column="${column}"]`)) as HTMLElement[];
    };
    const handleDragInactive = () => {
        setActive(false);
        clearAllHighlights();
    };
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        const cardId = e.dataTransfer.getData("cardId");
        setActive(false);
        clearAllHighlights();

        const indicator = getindicator();
        const { element } = getClosestIndicator(e, indicator);

        const before = element.dataset.before || "-1";

        if (before !== cardId) {
            let copy = [...cards];

            let cardToBeTransferred = copy.find((c) => c.id === cardId);
            if (!cardToBeTransferred) return;

            cardToBeTransferred = { ...cardToBeTransferred, column };

            copy = copy.filter((c) => c.id !== cardId);

            const oldPos = before === "-1";

            if (oldPos) {
                copy.push(cardToBeTransferred);
            } else {
                const insertIndex = copy.findIndex((elm) => elm.id === before);
                copy.splice(insertIndex, 0, cardToBeTransferred);
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
                {filteredCards.map((c) => {
                    return <Card key={c.id} {...c} handleDragStart={handleDragStart} />;
                })}
                <DropIndicator beforeId={null} column={column} />
            </div>
        </div>
    );
};

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

const DropIndicator: React.FC<DropIndicatorProps> = ({ beforeId, column }) => {
    return (
        <div
            data-before={beforeId || "-1"}
            data-column={column}
            className="my-0.5 h-0.5 w-full bg-pink-700 opacity-0"
        />
    );
};
const TestCards = [
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
