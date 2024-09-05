"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { KanbanBoard } from "@/components/Kanban";

export default function Kanban() {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    // Redirect to login if user is not logged in
    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
    }, [loadingUser, user]);

    return <KanbanBoard></KanbanBoard>;
}
