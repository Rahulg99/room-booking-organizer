import { Container, Paper, FormContain, Typography, InputLabel, Input, Button } from "@mui/material";
import { useState } from "react";
import { FormContainer, FormField, WarningLabel } from "../Components/SharedStyles";
import { databaseClient } from "../Database/DatabaseClass";
import { Link, useNavigate } from "react-router-dom";
import { CONSTANTS } from "../Shared/Constants";

export function RegisterPage(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [ warningMessage, setWarningMessage ] = useState('');
    const navigator = useNavigate();
    
    return (
        <FormContainer>
            <Typography variant={'h4'}>Login to meetings</Typography>
            {warningWatcher(warningMessage)}
            <FormField>
                <InputLabel>username</InputLabel>
                <Input value={username} onChange={e => setUsername(e.target.value)} type="text" onFocus={e => setWarningMessage('')} />
            </FormField>
            <FormField>
                <InputLabel>password</InputLabel>
                <Input value={password} onChange={e => setPassword(e.target.value)} type='password' onFocus={e => setWarningMessage('')} />
            </FormField>
            <FormField>
                <InputLabel>confirm password</InputLabel>
                <Input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type='password' onFocus={e => setWarningMessage('')} />
            </FormField>
            <Button type={'button'} variant={'contained'} onClick={e => {e.preventDefault(); submissionHandler(username, password, confirmPassword, setWarningMessage, navigator)}}>
                Register
            </Button>
            <Typography variant="body2" sx={{ marginTop: 1 }}>
                ALready have an account?
                <Link to="/login">Login here</Link>
            </Typography>
        </FormContainer>
    )
}

const warningWatcher = (warningMessage) => {
    if(warningMessage.trim().length === 0)
        return null;
    else {
        return(
            <WarningLabel severity="warning" sx={{ marginBottom: 2 }}>
                {warningMessage}
            </WarningLabel>
        )
    }
}

const validator = (username, password, confirmPassword, setWarningMessage) => {
    if(username.trim().length === 0) {
        setWarningMessage('Username is empty')
        return false;
    }
    if(password.trim().length === 0){
        setWarningMessage('Password can not be empty')
        return false;
    }
    if(confirmPassword !== password){
        setWarningMessage('Password and confirm password are different');
        return false;
    }
    return true;
}

function submissionHandler(username, password, confirmPassword, setWarningMessage, navigator) {
    if(!validator(username, password, confirmPassword, setWarningMessage))
        return;
    if(databaseClient.registerUser(username, password)){
        sessionStorage.setItem(CONSTANTS.USERNAME_KEY, username);
        navigator('/');
    }else{
        setWarningMessage('username already taken');
    }
}