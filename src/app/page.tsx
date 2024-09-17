"use client";

import { Inter } from "next/font/google";
import { useUser } from "@/hooks/useUser";
import React from "react";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
    const { loadingUser, user } = useUser();
    const router = useRouter();
    useEffectAsync(async () => {
        if (loadingUser) return;
        router.push(user ? "/dashboard" : "/login");
    }, [loadingUser, user]);
    return <main className="h-screen w-screen overflow-hidden bg-white"></main>;
}
