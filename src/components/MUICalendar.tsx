import React from "react";
import { Calendar, CalendarProps } from "react-big-calendar";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import { Paper, Theme, useTheme } from "@mui/material";
import { MUIStyledCommonProps } from "@mui/system";

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
    // Add more custom styles here
}));

const MUICalendar = (
    props: React.JSX.IntrinsicAttributes &
        CalendarProps<object, object> &
        MUIStyledCommonProps<Theme> & { ref?: React.Ref<Calendar<object, object>> | undefined },
) => {
    const theme = useTheme(); // Use your custom theme here if you have one

    return (
        <ThemeProvider theme={theme}>
            <Paper elevation={0}>
                <StyledCalendar {...props} />
            </Paper>
        </ThemeProvider>
    );
};

export default MUICalendar;
