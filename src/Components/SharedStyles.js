import styled from "@emotion/styled";
import { Alert, FormControl, Modal, Paper, createTheme, useMediaQuery } from "@mui/material";

const theme = createTheme();

export const FormContainer = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '300px',
    margin: '0 auto',
    marginTop: theme.spacing(3),
    
})

export const FormField = styled(FormControl)({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
});

export const WarningLabel = styled(Alert)({
    marginTop: '6px',   
    marginBottom: '0px',
    padding: '2px 14px',
    fontSize: '0.8rem',
});