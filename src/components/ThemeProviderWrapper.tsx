// components/ThemeProviderWrapper.tsx
"use client";

import SiteAppBar from "@/components/AppBar";
import getTheme from "@/styles/theme";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useState, useMemo, useEffect } from "react";

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<"light" | "dark">("light");

    useEffect(() => {
        const savedMode = localStorage.getItem("theme") as "light" | "dark";
        if (savedMode) setMode(savedMode);
    }, []);

    const toggleTheme = () => {
        const newMode = mode === "light" ? "dark" : "light";
        setMode(newMode);
        localStorage.setItem("theme", newMode);
    };

    const theme = useMemo(() => createTheme(getTheme(mode)), [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SiteAppBar toggleTheme={toggleTheme} currentMode={mode} />
            {children}
        </ThemeProvider>
    );
}
