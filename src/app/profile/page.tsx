"use client";

import { useRouter } from "next/navigation";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";
import { Avatar, Button, Container, Grid, Link, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts";
import TeamCard from "@/components/TeamCard";

export default function Profile() {
    const router = useRouter();
    const { loadingUser, user } = useUser();

    useEffectAsync(async () => {
        if (!loadingUser && !user) {
            await router.push("/login");
            return;
        }
    }, [loadingUser, user]);

    if (!user) {
        return <></>;
    }

    return (
        <Container sx={{ padding: 6 }}>
            <Grid container direction="column" spacing={2}>
                <Grid item xs={12}>
                    <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <Typography variant="h3">Profile</Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                href="update-profile/page"
                                variant="contained"
                                color="secondary"
                            >
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
                            <Typography variant="h5">[NAME]</Typography>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        [BIO]
                    </Grid>
                </Grid>

                {/* Achievements */}
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                            {/* stats chart */}
                            <PieChart
                                series={[
                                    {
                                        data: [
                                            {
                                                id: 0,
                                                value: 10,
                                                color: "primary",
                                                label: "Completed",
                                            },
                                            {
                                                id: 1,
                                                value: 15,
                                                color: "secondary",
                                                label: "In Progress",
                                            },
                                            {
                                                id: 2,
                                                value: 20,
                                                color: "tertiary",
                                                label: "Not Started",
                                            },
                                        ],
                                        innerRadius: 30,
                                        outerRadius: 100,
                                        paddingAngle: 5,
                                        cornerRadius: 5,
                                        startAngle: 0,
                                        endAngle: 360,
                                        cx: 150,
                                        cy: 150,
                                    },
                                ]}
                                slotProps={
                                    {
                                        // pieCenter: {
                                        //     pieCenterLabel: "XX Achievements",
                                        //     fontSize: 15,
                                        // },
                                    }
                                }
                                width={400}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            {/* empty */}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            {/* tree */}
                            <img src="emptytree.jpg"></img>
                        </Grid>
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
