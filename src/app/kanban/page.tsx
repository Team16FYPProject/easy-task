"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { KanbanBoard } from "@/components/Kanban";
import React from "react";
import { Project } from "../../utils/types";

export default function Kanban() {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [projectsProp, setProjects] = React.useState<Project[]>([]);
    // Redirect to login if user is not logged in
    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
    }, [loadingUser, user]);
    // Fetch projects
    useEffect(() => {
        async function fetchProjects() {
            try {
                setLoadingProjects(true);
                const response = await fetch("/api/projects", {
                    method: "GET",
                    credentials: "include",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.data || "Failed to fetch projects");
                }

                if (result.success) {
                    setProjects(result.projects);
                } else {
                    throw new Error("Failed to fetch projects");
                }
            } catch (e) {
                console.error("Error:", e);
            } finally {
                setLoadingProjects(false);
            }
        }

        fetchProjects();
    }, []);
    return <KanbanBoard projects={projectsProp} />;
}
