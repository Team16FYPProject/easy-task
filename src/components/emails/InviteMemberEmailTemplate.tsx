import { Button } from "@mui/material";
import * as React from "react";

interface EmailTemplateProps {
    teamName: string;
    link: string;
}

export const InviteMemberEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = (props) => (
    <div>
        <h1>Hello, you have been invited to join {props.teamName}!</h1>
        <a href={props.link}>
            <button>Join Now</button>
        </a>
    </div>
);
