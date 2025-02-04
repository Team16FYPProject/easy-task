import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import React from "react";

interface TeamCardProps {
    title: string;
    image: string;
}

const TeamCard: React.FC<TeamCardProps> = ({ title, image }) => {
    return (
        <Card>
            {/* <CardActionArea> */}
            <CardMedia
                component="img"
                height="140"
                image={image}
                alt="Group Icon"
                sx={{ padding: 2, paddingLeft: 10, paddingRight: 10 }}
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {title}
                </Typography>
            </CardContent>{" "}
            {/* </CardActionArea> */}
        </Card>
    );
};

export default TeamCard;
