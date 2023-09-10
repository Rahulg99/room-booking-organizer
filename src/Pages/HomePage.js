import { Grid, Card, CardHeader, CardContent, Typography, Paper, Container, Button } from '@mui/material';
import { Room as RoomIcon } from '@mui/icons-material';
import {databaseClient} from '../Database/DatabaseClass.js';
import { Link, useNavigate } from 'react-router-dom';
import { CONSTANTS, DateOptions } from '../Shared/Constants.js';
import { useEffect } from 'react';
import { NavigationBar } from '../Components/NavigationBar.js';

export function Home(props) {
    const roomData = databaseClient.getAllRooms();
    const navigator = useNavigate();
    
    useEffect(() => {
        if(!sessionStorage.getItem(CONSTANTS.USERNAME_KEY)){
            navigator('/login');
        }
    },[]);
    
    if(!sessionStorage.getItem(CONSTANTS.USERNAME_KEY)) return null;
    console.log(roomData)

    return (
        <Container maxWidth={'md'} style={{marginTop: '70px'}}>
            <NavigationBar navigator={navigator} />
            <Typography variant="h4" align="center" gutterBottom={true}>
                Welcome {sessionStorage.getItem(CONSTANTS.USERNAME_KEY)}, view all rooms
            </Typography>
            <Grid container spacing={3}>
                {roomData.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room.id}>
                    <Link style={{textDecoration: 'none'}} to={`/room/${room.id}`}>
                        <Card elevation={2}>
                            <CardHeader
                                title={room.id}
                                avatar={<RoomIcon />}
                            />
                            <CardContent>
                                <Typography variant="body2" color="textSecondary">
                                    Room available at: {new Date(parseInt(room.available_timestamp, 10)).toLocaleDateString('en-GB', DateOptions)}
                                </Typography>
                                {/* Add more card content as needed */}
                            </CardContent>
                        </Card>
                    </Link>
                </Grid>
                ))}
            </Grid>
        </Container>
    )
}