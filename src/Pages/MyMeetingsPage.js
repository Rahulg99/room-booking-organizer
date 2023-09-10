import { Box, Button, Container, MenuItem, Modal, Paper, Select, TextField, Typography, createTheme, useMediaQuery } from "@mui/material"
import { NavigationBar } from "../Components/NavigationBar"
import { useNavigate } from "react-router-dom"
import { CONSTANTS, DateOptions } from "../Shared/Constants";
import { useEffect, useState } from "react";
import { databaseClient } from "../Database/DatabaseClass";
import { green, lightBlue, red } from "@mui/material/colors";
import { condense } from "../Shared/Helper";
import { ResponsiveBox } from "../Components/ResponsiveBox";

export function MyMeetingsPage(props) {
    const navigator = useNavigate()
    const username = sessionStorage.getItem(CONSTANTS.USERNAME_KEY) ? sessionStorage.getItem(CONSTANTS.USERNAME_KEY) : 'joy';
    const [myBookings, setMyBookings] = useState([]);
    const [editBookingModalOpen, setEditBookingModalOpen] = useState(false);
    const [meetingOnFocus, setMeetingOnFocus] = useState({});
    const theme = createTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if(!sessionStorage.getItem(CONSTANTS.USERNAME_KEY)){
            navigator('/login');
        }
        const bookingsForUser = databaseClient.getBookingsForUser(username);
        setMyBookings(bookingsForUser)
    },[])
    if(!sessionStorage.getItem(CONSTANTS.USERNAME_KEY)) return null;

    return (
        <Container maxWidth={'md'} style={{marginTop: '70px'}}>
            <NavigationBar navigator={navigator} />
            <Typography variant="h4" align="center" gutterBottom={true}>
                My bookings
            </Typography>
            <Box>
                {/* ROOM RENDERER */}
                <Box sx={{paddingX: 0, paddingY: 2, display: 'flex', gap: 2, flexDirection: 'column'}}>
                    {myRoomsRenderer(myBookings, username, setMeetingOnFocus, setEditBookingModalOpen, setMyBookings,isSmallScreen)}
                </Box>
            </Box>
            {editBookingModalOpen && 
            <EditBookingModal
                setBookingModalOpen={setEditBookingModalOpen}
                meetingOnFocus={meetingOnFocus}
                setMeetingOnFocus={setMeetingOnFocus}
                setMyBookings={setMyBookings}
            />}
        </Container>
    )
}

function myRoomsRenderer(bookings: [Any], username, setMeetingOnFocus, setEditBookingModalOpen, setMyBookings, isSmallScreen) {
    
    if(bookings.length === 0)
        return (<Typography>You have not made any bookings.</Typography>)
    return bookings.map(slot => {
        return (
            <Paper sx={{padding: 1, backgroundColor: lightBlue[700], color: 'white'}} key={slot.meetingId} elevation={3}>
                <Typography variant="h5">Booked room: {slot.roomId}</Typography>
                <Box sx={{display: 'flex', flexDirection: isSmallScreen ? 'column':'row', justifyContent: 'space-between'}}>
                    <Typography variant="body1">By: {slot.organizer}</Typography>
                    <Typography variant="body1">Slot: {
                        new Date(parseInt(slot.timeStart, 10)).toLocaleDateString('en-GB',DateOptions)
                    } - {
                        new Date(parseInt(slot.timeStart, 10) + 30*60*1000).toLocaleDateString('en-GB',DateOptions)
                    }</Typography>
                </Box>
                <Box sx={{paddingY: 1, display: 'flex', gap: 2}}>
                    <Button type={'button'} sx={{backgroundColor: green[700], color: 'white', ':hover':{backgroundColor: green[800]}}}
                        onClick={e => {
                            setMeetingOnFocus({meetingId: slot.meetingId, organizer: username, roomId: slot.roomId})
                            setEditBookingModalOpen(true)
                        }}>
                        Edit
                    </Button>
                    <Button type={'button'} sx={{backgroundColor: red[500], color: 'white', ':hover':{backgroundColor: red[800]}}}
                        onClick={e => {
                            console.log('deleting meeting', slot.meetingId, username)
                            // logic to delete
                            const response = databaseClient.deleteBookingForUser(username, slot.meetingId);
                            if(response){
                                const bookingsForUser = databaseClient.getBookingsForUser(username);
                                setMyBookings(bookingsForUser)
                            } else {
                                window.alert('Conflict!!! you dont own this meeting')
                            }
                        }}>
                        Delete
                    </Button>
                </Box>
            </Paper>
        )
    })
}

function EditBookingModal({setBookingModalOpen, meetingOnFocus, setMeetingOnFocus, setMyBookings}) {
    const [disableButtons, setDisableButtons] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(' ');
    const username = sessionStorage.getItem(CONSTANTS.USERNAME_KEY) ? sessionStorage.getItem(CONSTANTS.USERNAME_KEY) : 'joy';
    const [roomAvailableTimes, setRoomAvailableTimes] = useState([]);

    useEffect(() => {
        console.log('requesting data from backend')
        const responseRoomAvailableTimes = databaseClient.getRoomBookingDate(meetingOnFocus.roomId).filter(slot => slot.available);
        setRoomAvailableTimes(responseRoomAvailableTimes);
    },[])
    const availabileSlots = condense(roomAvailableTimes);
    console.log(roomAvailableTimes, 'available times')
    console.log(availabileSlots, 'available slots')
    console.log('editing roomid', meetingOnFocus.roomId, 'meeting id', meetingOnFocus.meetingId, username);

    return (
        <ResponsiveBox>
			<Typography variant="h6">
				Make a booking for {meetingOnFocus.roomId}
			</Typography>
			<TextField
				label="username"
				variant="outlined"
				fullWidth
				value={username}
                disabled
				margin="normal"
			/>
            
            <Select
                value={selectedSlot}
                onChange={e => {setSelectedSlot(e.target.value)}}
                fullWidth
            >
                <MenuItem selected value={' '}>Select a slot</MenuItem>
                {
                    availabileSlots.map(slot => {
                        // console.log(slot.timeStart)
                        return (<MenuItem sx={{whiteSpace: 'break-spaces'}} key={slot.timeStart} value={slot.timeStart}>{new Date(parseInt(slot.timeStart, 10)).toLocaleDateString('us-GB',DateOptions)} - {new Date(parseInt(slot.timeEnd, 10)).toLocaleDateString('us-GB',DateOptions)}</MenuItem>)
                    })
                }
            </Select>
			<Container sx={{display: 'flex', paddingY: 1, flexDirection: 'row', justifyContent:'space-evenly'}}>
                <Button disabled={disableButtons} onClick={e=>{
                    e.preventDefault();
                    if(selectedSlot.trim().length === 0){ 
                        console.log(selectedSlot.trim(), 'validtor invalidated')
                        return;
                    }
                    setDisableButtons(true);
                    // logic
                    console.log('edited', meetingOnFocus.meetingId, 'new slot', selectedSlot)
                    const response = databaseClient.editBookingForUser(username, meetingOnFocus.meetingId, selectedSlot);
                    if(response === false)
                        window.alert('Conflict!! meeting already booked by another user');
                    else {
                        setMyBookings(databaseClient.getBookingsForUser(username))
                    }
                    setMeetingOnFocus({})

                    setDisableButtons(false);
                    setBookingModalOpen(false)
                }} variant="contained" color="primary">
                    ReBook!
                </Button>
                <Button disabled={disableButtons} onClick={e=>{
                    e.preventDefault();
                    setDisableButtons(true);
                    // logic
                    setMeetingOnFocus({})
                    
                    setDisableButtons(false);
                    setBookingModalOpen(false)
                }} variant="contained" color="primary">
                    Cancel
                </Button>
            </Container>
        </ResponsiveBox>
    )
}