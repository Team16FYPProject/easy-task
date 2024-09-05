import React, { useState } from "react";
export const KanbanBoard = () => {
    return (
        <div className="h-screen w-full text-black">
            <Board />
        </div>
    );
};

export const Board = () => {
    const [cards, setCards] = useState(TestCards);
    return (
        <div className="flex h-full w-full justify-center gap-5 p-12">
            <Column
                title="TO DO"
                column="todo"
                headingColor="text-black"
                cards={cards}
                setCards={setCards}
            />
            <Column
                title="IN PROGRESS"
                column="doing"
                headingColor="text-black"
                cards={cards}
                setCards={setCards}
            />
            <Column
                title="COMPLETE"
                column="complete"
                headingColor="text-black"
                cards={cards}
                setCards={setCards}
            />
        </div>
    );
};

const Column = ({ title, headingColor, column, cards, setCards }) => {
    const [active, setActive] = useState(false);
    const filteredCards = cards.filter((c) => c.column === column);
    return (
        <div className="w-1/3 shrink-0 px-2">
            <div className="mb-5 flex items-center justify-evenly">
                <h3 className={`${headingColor} font-medium`}>{title}</h3>
                <span className="rounded text-sm text-black"> {filteredCards.length}</span>
            </div>
            <div
                className={`h-5/6 w-full transition-colors ${active ? "bg-black" : "bg-blue-500"}`}
            >
                {filteredCards.map((c) => {
                    return <Card key={c.id} {...c} />;
                })}
            </div>
        </div>
    );
};

const Card = ({ title, id, column }) => {
    return (
        <>
            <DropIndicator beforeId={id} column={column} />
            <div
                draggable="true"
                className="cursor-grab rounded border border-neutral-700 bg-white p-3 active:cursor-grabbing"
            >
                <p className="text-sm text-black">{title}</p>
            </div>
        </>
    );
};

const DropIndicator = ({ beforeId, column }) => {
    return (
        <div
            data-before={beforeId || "-1"}
            data-column={column}
            className="my-0.5 h-0.5 w-full bg-violet-400 opacity-100"
        />
    );
};
const TestCards = [
    { title: "Create Kanban Screen", id: "1", column: "todo" },
    { title: "Create Kanban Screen", id: "1", column: "todo" },
    { title: "Hello", id: "1", column: "doing" },
    { title: "Placeholder", id: "1", column: "complete" },
];
