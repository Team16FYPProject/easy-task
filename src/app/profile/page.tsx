"use client";

import { useRouter } from "next/navigation";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";
import { Avatar, Button, Container, Grid, Typography } from "@mui/material";
import Image from "next/image";
import TeamCard from "@/components/TeamCard";
import { useState } from "react";
import type { ApiResponse, ProfileResponse } from "@/utils/types";
import { useAchievements } from "@/hooks/useAchievements";
import { ResponsiveContainer, Pie, Cell, PieChart } from "recharts";

const COLORS = ["#0088FE", "#00C49F"];

const AchievementTree = ({ filledCount }: { filledCount: number }) => {
    const treeHeight = 300; // Fixed tree height
    const treeWidth = 200; // Fixed tree width
    const maxCircles = 20; // Maximum number of circles to display

    return (
        <svg width={treeWidth} height={treeHeight} viewBox={`0 0 ${treeWidth} ${treeHeight}`}>
            <image
                href="/emptytree.jpg"
                x="0"
                y="0"
                width={treeWidth}
                height={treeHeight}
                preserveAspectRatio="xMidYMid slice"
            />
            {[...Array(Math.min(filledCount, maxCircles))].map((_, index) => (
                <circle
                    key={index}
                    cx={100 + Math.cos(index * 0.5 + Math.PI) * 70} // Rotate by 180 degrees
                    cy={treeHeight - 200 + Math.sin(index * 0.5 + Math.PI) * 70} // Rotate by 180 degrees
                    r="7" // Increased radius of circle
                    fill="pink"
                />
            ))}
        </svg>
    );
};

export default function ProfilePage() {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const { achievements, loading: loadingAchievements } = useAchievements(user?.id);
    const [profile, setProfile] = useState<ProfileResponse | null>(null);

    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
        if (user) {
            const response = await fetch("/api/user/profile");
            const data: ApiResponse<ProfileResponse> = await response.json();
            if (!data.success) {
                alert("Unable to load your profile data.");
                return;
            }
            setProfile(data.data);
        }
    }, [loadingUser, user]);

    const completedAchievements = achievements.filter((a) => a.completed).length;
    const inProgressAchievements = achievements.filter(
        (a) => a.progress > 0 && !a.completed,
    ).length;

    const pieData = [
        { name: "Completed", value: completedAchievements },
        { name: "In Progress", value: inProgressAchievements },
    ];

    if (!user || !profile) {
        return <></>;
    }

    return (
        <Container sx={{ padding: 2 }}>
            <Grid container direction="column" spacing={2}>
                <Grid item xs={12}>
                    <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <Typography variant="h3">Profile</Typography>
                        </Grid>
                        <Grid item>
                            <Button href="/update-profile" variant="contained" color="secondary">
                                EDIT PROFILE
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Profile Information */}
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item>
                            <Avatar></Avatar>
                        </Grid>
                        <Grid item>
                            <Typography variant="h5">
                                {profile.first_name} {profile.last_name}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        Bio: {profile.bio || ""}
                    </Grid>
                </Grid>

                {/* Achievements */}
                <Grid item container spacing={2} justifyContent="space-between">
                    <Grid item xs={12} sm={6}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, value }) => `${name} (${value})`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <AchievementTree
                            filledCount={achievements.reduce(
                                (sum, achievement) =>
                                    sum +
                                    Math.floor(
                                        (achievement.progress / achievement.max_progress) * 3,
                                    ),
                                0,
                            )}
                        />
                    </Grid>
                </Grid>
                {/* Profile Information */}
                <Grid item xs={12}>
                    <Typography variant="h5">Teams</Typography>
                </Grid>

                {/* Teams */}
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TeamCard title="Team 1" image="/GroupIcon.png" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TeamCard title="Team 2" image="/GroupIcon.png" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TeamCard title="Team 3" image="/GroupIcon.png" />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
}
