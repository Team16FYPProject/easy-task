import getTheme from "@/styles/theme";
import { Paper, Theme } from "@mui/material";
import { ThemeProvider, styled } from "@mui/material/styles";
import { MUIStyledCommonProps } from "@mui/system";
import React from "react";
import { Calendar, CalendarProps } from "react-big-calendar";

const StyledCalendar = styled(Calendar)(({ theme }) => ({
    "& .rbc-header": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    "& .rbc-today": {
        backgroundColor: theme.palette.action.selected,
    },
    "& .rbc-off-range-bg": {
        backgroundColor: theme.palette.action.disabledBackground,
    },
    "& .rbc-off-range": {
        color: theme.palette.action.disabled,
    },
    "& .rbc-event": {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.secondary.contrastText,
    },
}));

const MUICalendar = (
    props: React.JSX.IntrinsicAttributes &
        CalendarProps<object, object> &
        MUIStyledCommonProps<Theme> & { ref?: React.Ref<Calendar<object, object>> | undefined },
) => {
    const theme = getTheme("light");

    return (
        // <ThemeProvider theme={theme}>
        <Paper elevation={0}>
            <StyledCalendar {...props} />
        </Paper>
        // </ThemeProvider>
    );
};

export default MUICalendar;
