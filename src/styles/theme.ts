"use client";

import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
    interface Palette {
        tertiary: Palette["primary"];
    }
    interface PaletteOptions {
        tertiary?: PaletteOptions["primary"];
    }
}

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#113A44",
        },
        secondary: {
            main: "#B862EC",
        },
        tertiary: {
            main: "#0055CC",
        },
        background: {
            default: "#ffffff",
            paper: "#ffffff",
        },
    },
});

export default theme;
