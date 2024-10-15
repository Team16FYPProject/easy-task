"use client";

import { useRouter } from "next/navigation";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";
import { useAchievements } from "@/hooks/useAchievements";
import {
    Container,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
} from "@mui/material";
// import { PieChart } from "@mui/x-charts";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#b862ec", "#0055cc", "#113a44"];

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

const ProgressIcons = ({ progress, maxProgress }: { progress: number; maxProgress: number }) => {
    const filledCount = Math.floor((progress / maxProgress) * 3);
    return (
        <Box>
            {[...Array(filledCount)].map((_, index) => (
                <span key={index} style={{ color: "pink" }}>
                    🌸
                </span>
            ))}
            {[...Array(3 - filledCount)].map((_, index) => (
                <span key={index + filledCount} style={{ color: "lightgrey" }}></span>
            ))}
        </Box>
    );
};

export default function Achievements() {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const { achievements, loading: loadingAchievements } = useAchievements(user?.id ?? "");

    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
    }, [loadingUser, user]);

    if (!user || loadingAchievements) {
        return (
            <Container sx={{ padding: 2 }}>
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    const completedAchievements = achievements.filter((a) => a.completed).length;
    const inProgressAchievements = achievements.filter(
        (a) => a.progress > 0 && !a.completed,
    ).length;

    const pieData = [
        { name: "Completed", value: completedAchievements },
        { name: "In Progress", value: inProgressAchievements },
    ];

    return (
        <Container sx={{ padding: 2 }}>
            <Grid container direction="column" spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h3">Achievements</Typography>
                </Grid>

                <Grid item container spacing={2} justifyContent="space-between">
                    <Grid item xs={12} sm={6}>
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                        >
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
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                        >
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
                        </Box>
                    </Grid>
                </Grid>

                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="achievements table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Progress</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {achievements.map((achievement) => (
                                    <TableRow key={achievement.achievement_id}>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <span style={{ marginRight: "8px" }}>
                                                    {achievement.icon}
                                                </span>
                                                {achievement.achievement_name}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{achievement.achievement_desc}</TableCell>
                                        <TableCell>
                                            <ProgressIcons
                                                progress={achievement.progress}
                                                maxProgress={achievement.max_progress}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {achievement.completed
                                                ? "100%"
                                                : `${Math.round((achievement.progress / achievement.max_progress) * 100)}%`}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Container>
    );
}
