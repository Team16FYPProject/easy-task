export const determineBgColor = (task_priority: String) => {
    if (task_priority === "LOW") {
        return "#DDFFE3";
    } else if (task_priority === "MEDIUM") {
        return "#FFF1BF";
    } else {
        return "#FFD5C4";
    }
};

export const determineTextColor = (task_priority: String) => {
    if (task_priority === "LOW") {
        return "#1B5A35";
    } else if (task_priority === "MEDIUM") {
        return "#644D26";
    } else {
        return "#8C030A";
    }
};
