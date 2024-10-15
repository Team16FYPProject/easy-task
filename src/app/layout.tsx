// layout.tsx (Server Component)
import type { Metadata } from "next";
import ThemeProviderWrapper from "@/components/ThemeProviderWrapper"; // Child Client Component
import "@/styles/globals.css";
import React from "react";

export const metadata: Metadata = {
    title: "EasyTask",
    description: "The ultimate student project manager",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
            </body>
        </html>
    );
}
