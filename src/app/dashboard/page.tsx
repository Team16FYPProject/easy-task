"use client";

import { useRouter } from "next/navigation";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";
import {
    Button,
    ButtonGroup,
    Container,
    Grid,
    Pagination,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import TeamCard from "@/components/TeamCard";

export default function Dashboard() {
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
        <Container>
            {/* <div>
                Hello {user?.user_metadata?.first_name} ({user?.email})
            </div> */}
            <Container>
                <Grid container spacing={2}>
                    <Typography variant="h2">Teams</Typography>
                    <Button variant="contained">CREATE TEAM</Button>
                </Grid>
                <Grid container spacing={2}>
                    <TeamCard
                        title="Team 1"
                        image="/static/images/cards/contemplative-reptile.jpg"
                    />
                    <TeamCard
                        title="Team 2"
                        image="/static/images/cards/contemplative-reptile.jpg"
                    />
                    <TeamCard
                        title="Team 3"
                        image="/static/images/cards/contemplative-reptile.jpg"
                    />
                </Grid>
                <ButtonGroup>{/* View buttons */}</ButtonGroup>
                <Typography variant="h2">Upcoming Tasks</Typography>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date and Time</TableCell>
                                <TableCell align="right">Team/Task</TableCell>
                                <TableCell align="right">Priority</TableCell>
                                <TableCell align="right">Meeting</TableCell>
                                <TableCell align="right">Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* {rows.map((row) => (
                                <TableRow
                                    key={row.name}
                                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {row.name}
                                    </TableCell>
                                    <TableCell align="right">{row.calories}</TableCell>
                                    <TableCell align="right">{row.fat}</TableCell>
                                    <TableCell align="right">{row.carbs}</TableCell>
                                    <TableCell align="right">{row.protein}</TableCell>
                                </TableRow>
                            ))} */}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* <Pagination /> */}
            </Container>
        </Container>
    );
}
