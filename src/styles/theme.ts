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
            main: "#36034d",
        },
        secondary: {
            main: "#8519C8",
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
