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
        return "#46C97E";
    } else if (task_priority === "MEDIUM") {
        return "#B08943";
    } else {
        return "#EE020E";
    }
};
