"use client";

import { createTheme, ThemeOptions } from "@mui/material/styles";

// const theme = createTheme({
//     palette: {
//         mode: mode,
//         primary: {
//             main: "#36034d",
//         },
//         secondary: {
//             main: "#8519C8",
//         },
//         background: {
//             default: "#ffffff",
//             paper: "#ffffff",
//         },
//     },
// });

const getTheme = (mode: "light" | "dark"): ThemeOptions => ({
    palette: {
        mode,
        primary: {
            main: mode === "light" ? "#36034d" : "#BB86FC",
        },
        secondary: {
            main: mode === "light" ? "#8519C8" : "#03DAC6",
        },
        background: {
            default: mode === "light" ? "#ffffff" : "#121212",
            paper: mode === "light" ? "#ffffff" : "#1E1E1E",
        },
        text: {
            primary: mode === "light" ? "#000000" : "#ffffff",
        },
    },
});

// export default theme;
export default getTheme;
