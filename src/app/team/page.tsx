"use client";

import { useRouter } from "next/navigation";
import { useEffectAsync } from "@/hooks/useEffectAsync";
import { useUser } from "@/hooks/useUser";
import {
    Button,
    Container,
    Grid,
    Typography,
    IconButton,
    TextField,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@mui/material";
import { SettingsFilled } from "@mui/icons-material";

export default function TeamMembers() {
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
                {/* Team Name */}
                <Grid item xs={12}>
                    <Typography variant="h3">Team __</Typography>
                </Grid>

                {/* Team Features */}
                <Grid item xs={12}>
                    {" "}
                    {/* Search bar */}
                    <Grid container spacing={2} alignItems="left" justifyContent="space-between">
                        <Grid item>
                            <TextField
                                id="search-team-member"
                                label="Search"
                                defaultValue="Enter Team Member..."
                            />
                        </Grid>
                    </Grid>
                    {/* All the buttons */}
                    <Grid container spacing={2} alignItems="right" justifyContent="space-between">
                        <Grid item>
                            <Button variant="contained" color="primary">
                                LEAVE TEAM
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="secondary">
                                INVITE MEMBER
                            </Button>
                        </Grid>
                        <Grid item>
                            <IconButton color="default" size="medium">
                                <SettingsFilled />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Team Table */}
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Actions</TableCell>
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
                </Grid>
            </Grid>
        </Container>
    );
}
