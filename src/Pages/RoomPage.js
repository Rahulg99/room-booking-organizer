import { Box, Button, Container, MenuItem, Modal, Paper, Select, TextField, Typography, createTheme, useMediaQuery } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { NavigationBar } from "../Components/NavigationBar";
import { useEffect, useState } from "react";
import { databaseClient } from "../Database/DatabaseClass";
import { CONSTANTS, DateOptions } from "../Shared/Constants";
import { lightBlue, teal } from "@mui/material/colors";
import { condense, findSlotCount } from "../Shared/Helper";
import { ResponsiveBox } from "../Components/ResponsiveBox";

// {"meetingId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6", "roomId": "Room101", "organizer": "joy", "timeStart": "1693646100000"},
// {"meetingId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcbd", "roomId": "Room101", "organizer": "joy", "timeStart": "1693647900000"},
// {"meetingId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dc6d", "roomId": "Room101", "organizer": "joy", "timeStart": "1693651500000"}

export function RoomPage(props) {
    const params = useParams();
    const [roomId, setRoomId] = useState(params.roomId)
    const navigator = useNavigate();
    const [roomAvailablityData, setRoomAvailablityData] = useState([]);
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const theme = createTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    useEffect(() => {
        console.log(sessionStorage.getItem(CONSTANTS.USERNAME_KEY))
        if(!sessionStorage.getItem(CONSTANTS.USERNAME_KEY)){
            navigator('/login');
        }
    },[]);
    useEffect(() => {
        if(roomAvailablityData !== null && roomAvailablityData.length === 0){
            console.log('re rendering for', params.roomId);
            const response = databaseClient.getRoomBookingDate(roomId);
            setRoomAvailablityData(response)
        }
    }, [roomAvailablityData])
    if(!sessionStorage.getItem(CONSTANTS.USERNAME_KEY)) return null;

    
    return (
        <Container maxWidth={'md'} style={{marginTop: '70px'}}>
            <NavigationBar navigator={navigator} />
            <Typography variant="h4" align="center" gutterBottom={true}>
                {roomId}
            </Typography>
            <Box>
                <Box sx={{justifyContent: 'space-between', display: 'flex'}}>
                    <Box sx={{display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
                        {roomAvailablityData.length ? `Next availabile time: ${new Date(parseInt(roomAvailablityData.find(slot => slot.available).timeStart, 10)).toLocaleDateString('us-GB', DateOptions)}` : ''}
                    </Box>
                    <Button color={'success'} variant={'contained'} type={'button'} onClick={e => {e.preventDefault();setBookingModalOpen(true)}}>Book a slot</Button>
                </Box>
                <Box sx={{paddingX: 0, paddingY: 2, display: 'flex', gap: 2, flexDirection: 'column'}}>
                    {roomRenderer(roomAvailablityData, isSmallScreen)}
                </Box>
            </Box>
            {bookingModalOpen && 
            <BookingModal
                setBookingModalOpen={setBookingModalOpen}
                roomId={roomId}
                roomAvailablityData={roomAvailablityData}
                setRoomAvailablityData={setRoomAvailablityData}
            />}
        </Container>
    )
}

function roomRenderer(roomAvailablityData: [Any], isSmallScreen) {
    if(roomAvailablityData === null)
        return (<div>Room not found</div>)
    if(roomAvailablityData.length === 0)
        return (<Typography variant={'body1'}>No booking has been made yet</Typography>)
    return roomAvailablityData.map(slot => {
        return slot.available ? (
            <Paper sx={{padding: 1, backgroundColor: teal[500], color: "white"}} key={slot.meetingId} elevation={3}>
                <Typography variant="h5">Available slots: {findSlotCount(parseInt(slot.timeStart), parseInt(slot.timeEnd))}</Typography>
                <Typography variant="body1">Timing: {
                    new Date(parseInt(slot.timeStart, 10)).toLocaleDateString('en-GB',DateOptions)
                } - {
                    new Date(parseInt(slot.timeEnd, 10)).toLocaleDateString('en-GB',DateOptions)
                }</Typography>
            </Paper>
        ) : (
            <Paper sx={{padding: 1, backgroundColor: lightBlue[700], color: 'white'}} key={slot.meetingId} elevation={3}>
                <Typography variant="h5">Booked</Typography>
                <Box sx={{display: 'flex', flexDirection: isSmallScreen ? 'column':'row', justifyContent: 'space-between'}}>
                    <Typography variant="body1">Organizer: {slot.organizer}</Typography>
                    <Typography variant="body1">Slot: {
                        new Date(parseInt(slot.timeStart, 10)).toLocaleDateString('en-GB',DateOptions)
                    } - {
                        new Date(parseInt(slot.timeEnd, 10)).toLocaleDateString('en-GB',DateOptions)
                    }</Typography>
                </Box>
            </Paper>
        )
    })
}

function BookingModal({setBookingModalOpen, roomId, roomAvailablityData, setRoomAvailablityData}) {
    const [disableButtons, setDisableButtons] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(' ');
    const username = sessionStorage.getItem(CONSTANTS.USERNAME_KEY) ? sessionStorage.getItem(CONSTANTS.USERNAME_KEY) : 'joy';
    const roomAvailableTimes = roomAvailablityData.filter(meeting => meeting.available)
    console.log(roomAvailableTimes)
    const availabileSlots = condense(roomAvailableTimes);
    return (
        <ResponsiveBox>
			<Typography variant="h6">
				Make a booking for {roomId}
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
                    bookingHandler(e, username, roomId, selectedSlot)
                    setRoomAvailablityData([])
                    setDisableButtons(false);
                    setBookingModalOpen(false)
                }} variant="contained" color="primary">
                    Book!
                </Button>
                <Button disabled={disableButtons} onClick={e=>{e.preventDefault();setBookingModalOpen(false)}} variant="contained" color="primary">
                    Cancel
                </Button>
            </Container>
        </ResponsiveBox>
    )
}

function bookingHandler(e, username, roomId, startTime) {
    // logic
    databaseClient.createABooking(username, roomId, startTime);
}