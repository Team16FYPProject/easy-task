"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#113A44",
        },
        secondary: {
            main: "#B862EC",
        },
        background: {
            default: "#ffffff",
            paper: "#ffffff",
        },
    },
});

export default theme;
