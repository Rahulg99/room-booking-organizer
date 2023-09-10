import { AppBar, Button, Container, IconButton, Toolbar, Typography } from "@mui/material";
import { CONSTANTS } from "../Shared/Constants";
import { ArrowBack } from "@mui/icons-material";

export function NavigationBar({navigator}) {
    return (
        <AppBar position="fixed">
            <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
                <IconButton onClick={e => {navigator(-1)}} edge="start" color="inherit" aria-label="menu">
                    <ArrowBack />
                </IconButton>
                <Container style={{ display: 'flex', gap: '0px'}}>
                    <NavBarButton text={'Home'} path={`/`} navigator={navigator} />
                    <NavBarButton text={'My Bookings'} path={`/meetings`} navigator={navigator} />
                    <LogoutButton navigator={navigator} />
                </Container>
            </Toolbar>
        </AppBar>
    )
}

function NavBarButton ({navigator, path, text}) {
    return(
        <Button variant="outlined" style={{ color: '#ffffff' }}
            onClick={e=>navigator(path)}
        >{text}</Button>
    )
}

function LogoutButton({navigator}) {
    return (
        <Button variant="outlined" style={{ color: '#ffffff', marginLeft: 'auto' }}
            onClick={e=>logoutHandler(e, navigator)}
        >Logout</Button>
    )
}

function logoutHandler(e, navigator) {
    e.preventDefault();
    sessionStorage.removeItem(CONSTANTS.USERNAME_KEY);
    navigator('/login')
}