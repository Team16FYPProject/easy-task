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
    LinearProgress,
    Box,
} from "@mui/material";
// import { PieChart } from "@mui/x-charts";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F"];

const AchievementTree = ({ completedCount, totalCount }) => {
    const treeHeight = 200 + (completedCount / totalCount) * 100;
    return (
        <svg width="200" height={treeHeight} viewBox={`0 0 200 ${treeHeight}`}>
            <image
                href="/emptytree.jpg"
                x="0"
                y="0"
                width="200"
                height={treeHeight}
                preserveAspectRatio="xMidYMid slice"
            />
            {[...Array(completedCount)].map((_, index) => (
                <circle
                    key={index}
                    cx={100 + Math.cos(index * 0.5) * 40}
                    cy={treeHeight - 100 + Math.sin(index * 0.5) * 40}
                    r="5"
                    fill="pink"
                />
            ))}
        </svg>
    );
};

const ProgressIcons = ({ progress, maxProgress }: { progress: number; maxProgress: number }) => {
    console.log(progress, maxProgress);
    const filledCount = Math.floor((progress / maxProgress) * 5);
    return (
        <Box>
            {[...Array(filledCount)].map((_, index) => (
                <span key={index} style={{ color: "pink" }}>
                    🌸
                </span>
            ))}
            {[...Array(5 - filledCount)].map((_, index) => (
                <span key={index + filledCount} style={{ color: "lightgrey" }}></span>
            ))}
        </Box>
    );
};

export default function Achievements() {
    const router = useRouter();
    const { loadingUser, user } = useUser();
    const { achievements, loading: loadingAchievements } = useAchievements(user?.id);

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
    const notStartedAchievements = achievements.filter((a) => a.progress === 0).length;

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
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
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
                            completedCount={completedAchievements}
                            totalCount={achievements.length}
                        />
                    </Grid>
                </Grid>

                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="achievements table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
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
