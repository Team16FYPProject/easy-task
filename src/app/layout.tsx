import "@/styles/globals.css";
import type { Metadata } from "next";
import React from "react";
import AppBar from "@/app/appbar/page";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/styles/theme"; // Adjust the import path as necessary

export const metadata: Metadata = {
    title: "Home",
    description: "Welcome to Next.js",
};

export default function RootLayout({
    // Layouts must accept a children prop.
    // This will be populated with nested layouts or pages
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <AppBar /> {/* This is the AppBar component */}
                    <div>{children}</div>
                </ThemeProvider>
            </body>
        </html>
    );
}
