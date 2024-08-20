import React from "react";
import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";

interface TeamCardProps {
    title: string;
    image: string;
}

const TeamCard: React.FC<TeamCardProps> = ({ title, image }) => {
    return (
        <Card>
            <CardActionArea>
                <CardMedia component="img" height="140" image={image} alt={title} />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {title}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default TeamCard;
