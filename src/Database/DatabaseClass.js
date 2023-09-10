import { CONSTANTS, DateOptions } from '../Shared/Constants';
import data from './db.json';
import { v4 as uuidv4  } from 'uuid';

class DatabaseClass {
    constructor() {
        if(!DatabaseClass.instance) {
            this.rooms = data.rooms;
            this.users = data.users;
            this.meetings = data.meetings;
            DatabaseClass.instance = this;
            this.rooms =  this.rooms.map(room => {
                const givenTimeDate = new Date(parseInt(room.available_timestamp, 10));
                const dateTimeNow = new Date();
                // console.log(givenTimeDate.toLocaleDateString('en-GB', DateOptions), dateTimeNow.getTime())
                // now is in the future
                if(dateTimeNow.getTime() > givenTimeDate.getTime()){
                    room.available_timestamp = dateTimeNow.getTime();
                }
                const dateTime = new Date(parseInt(room.available_timestamp, 10));
                room.available_timestamp = this.#getNextValidTimeSlotTimeStamp(dateTime);
                return room;
            })
            // console.log(this.rooms);
        }
        return DatabaseClass.instance;
    }
    /**
     * 
     * @returns array of all rooms with their next availble time stamp
     */
    getAllRooms() {
        return this.rooms.map(room => {
            // filter => !=0 => getRoomMeetingData() => filter(avil true) => (0) => starting
            // const bookingsForRoom = this.#getRoomMeetingData(room.id);
            const doesMeetingExist = this.meetings.find(meeting => meeting.roomId === room.id);
            if(doesMeetingExist)
                return {...room, available_timestamp: this.getRoomBookingDate(room.id).find(slot => slot.available === true).timeStart}
            else{
                return {...room, available_timestamp: this.#getNextValidTimeSlotTimeStamp(new Date())}
            }
        });
    }
    /**
     * create a booking for a room
     * @param {String} username unique username of user
     * @param {String} roomId room id for which you want to make a booking of
     * @param {String} startTime timestamp of starting time of meeting
     */
    createABooking(username, roomId, startTime) {
        // console.log(username, startTime);
        this.meetings.push({
            meetingId: uuidv4(),
            roomId: roomId,
            organizer: username,
            timeStart: startTime
        })
        // console.log('meeting set at', new Date(parseInt(startTime, 10)))
        // console.log('all meetings',this.meetings)
    }
    /**
     * get all bookings made by a user
     * @param {String} username username of user
     * @returns array of all bookings made by a user that are upcoming
     */
    getBookingsForUser(username) {
        return this.meetings.filter(meeting => (meeting.organizer === username && parseInt(meeting.timeStart, 10) > Date.now()))
    }
    /**
     * edit a booking made by user
     * @param {String} username username of user
     * @param {String} meetingId unique meetings id whose timing you want to shift must be meeting created by user with passed username
     * @param {String} requestedStartTime timestamp of start time you want your meeting to be shifted to
     * @returns false if some other user has booked before you / true if shifting was successful
     */
    editBookingForUser(username, meetingId, requestedStartTime) {
        requestedStartTime = parseInt(requestedStartTime, 10)
        const targetMeeting = this.meetings.find(meeting => (meeting.meetingId === meetingId && username === meeting.organizer))
        if(!targetMeeting)
            return false;
        const meetingsForRoom = this.meetings.filter(meeting => meeting.roomId === targetMeeting.roomId);
        const conflictingMeeting = meetingsForRoom.find(meeting => {
            const startTime = parseInt(meeting.timeStart, 10);
            const verdict = requestedStartTime >= startTime && ((requestedStartTime-startTime) < (30*60*1000));
            return verdict
        })
        console.log(conflictingMeeting, 'conflicting meetingid')
        if(conflictingMeeting)
            return false;
        this.meetings = this.meetings.map(meeting => {
            if(meeting.meetingId === meetingId){
                return {...meeting, timeStart: `${requestedStartTime}`}
            }else{
                return meeting;
            }
        })
        return true;
    }
    /**
     * delete a booking made by user for
     * @param {String} username username of user
     * @param {String} meetingId meeting id you want to delete, user must be organizer
     * @returns true if meeting was successfully deleted / false if user is not organizer or meeting doesnt exist
     */
    deleteBookingForUser(username, meetingId) {
        const targetMeeting = this.meetings.find(meeting => (meeting.meetingId === meetingId && username === meeting.organizer))
        if(!targetMeeting)
            return false;
        this.meetings = this.meetings.filter(meeting => meeting.meetingId !== meetingId);
        return true;
    }
    /**
     * 
     * meetings 
     * meetingId: uuid
     * roomId: RoomId
     * organizer: UserId
     * timeStart: timestamp 
     */
    /**
     * get all meetings for a room id
     * @param {String} roomId get all meetings held in room id
     * @returns array of meetings, sorted
     */
    #getRoomMeetingData(roomId) {
        const room = this.rooms.find(room => {
            return room.id === roomId
        });
        if(!room)
            return null;
        const meetingsForRoom = this.meetings.filter(meeting => (meeting.roomId === roomId));
        const nowTimeStamp = new Date().getTime();
        return meetingsForRoom.filter(meeting => {
            return parseInt(meeting.timeStart) > nowTimeStamp;
        }).sort((a, b) => (parseInt(a.timeStart) - parseInt(b.timeStart)));
    }
    /**
     * get all meetings slot and available slots in a room
     * @param {String} roomId room id of room you want to query
     * @returns array of all meetings in room along with available slots
     */
    getRoomBookingDate(roomId) {
        const meetingForRoom = this.#getRoomMeetingData(roomId);
        const availablilityData: [AvailabilitySlot] = [];
        // console.log(meetingForRoom);
        if(meetingForRoom === null)
            return null;
        // no future meetings
        if(meetingForRoom.length === 0){
            availablilityData.push(
                ...this.#workingDayFilter(this.#getNextValidTimeSlotTimeStamp(new Date()), this.#getNextValidTimeSlotTimeStamp(new Date()) + 7*24*3600*1000)
            )
            return availablilityData;
        }
        
        const preNextValidTimeSlot = this.#getNextValidTimeSlotTimeStamp(new Date());
        console.log('next time slot before', preNextValidTimeSlot)
        console.log(parseInt(meetingForRoom.at(0).timeStart), 'first meeting starting time')
        if(preNextValidTimeSlot < parseInt(meetingForRoom.at(0).timeStart)) {
            availablilityData.push(
                ...this.#workingDayFilter(preNextValidTimeSlot, parseInt(meetingForRoom.at(0).timeStart))
            )
        }
        console.log('for room', availablilityData)
        let start=0, end=0;
        while(start<meetingForRoom.length && end<meetingForRoom.length){
            if(start === end) {
                availablilityData.push({
                    meetingId: meetingForRoom.at(start).meetingId,
                    organizer: meetingForRoom.at(start).organizer,
                    timeStart: meetingForRoom.at(start).timeStart,
                    timeEnd: `${parseInt(meetingForRoom.at(start).timeStart) + (30*60*1000)}`,
                    available: false
                })
                end++;
            } else {
                // is not adjecent meeting
                if( parseInt(meetingForRoom.at(start).timeStart) + (30*60*1000) !== parseInt(meetingForRoom.at(end).timeStart)) {
                    availablilityData.push(
                        ...this.#workingDayFilter(parseInt(meetingForRoom.at(start).timeStart)+(30*60*1000), parseInt(meetingForRoom.at(end).timeStart))
                    )
                }
                start++;
            }
        }
        // next valid slot is on the end of last meeting
        const postNextValidTimeSlot = parseInt(meetingForRoom.at(meetingForRoom.length-1).timeStart) + (30*60*1000);
        availablilityData.push(
            ...this.#workingDayFilter(postNextValidTimeSlot, postNextValidTimeSlot + (7*24*3600*1000))
        )
        return availablilityData;
    }
    /**
     * authenticate a user with username and password
     * @param {String} username username of user
     * @param {String} password password for a user
     * @returns true if authentication was correct / false if unsuccessful
     */
    authenticate(username, password) {
        if(this.users.find(user => (user.username === username && user.password === password)))
            return true;
        else
            return false;
    }
    /**
     * create a user with username and password
     * @param {String} username username of new user
     * @param {String} password password for new user
     * @returns true if successfully created / false if username already taken
     */
    registerUser(username, password) {
        if(this.users.find(user => user.username === username))
            return false;
        this.users.push({username, password});
        console.log(this.users);
        return true;
    }
    /**
     * get timestamp: Number of next possible time slot
     * @param {Date} dateTime Date object from which next valid slot is needed
     * @returns Number: timestamp of starting time of next possible time slot
     */
    #getNextValidTimeSlotTimeStamp(dateTime) {
        console.log('date', dateTime)
        // not in working day
        while (!(dateTime.getDay() >= CONSTANTS.WEEKDAY_START && dateTime.getDay() <= CONSTANTS.WEEKDAY_END)){
            dateTime.setDate(dateTime.getDate()+1);
            dateTime.setHours(0,0,0,0);
        }
        // not in working hour
        while (!(dateTime.getHours()>=CONSTANTS.WORKING_HOUR_START && dateTime.getHours()<=CONSTANTS.WORKING_HOUR_END)){
            dateTime.setHours(dateTime.getHours()+1);
            dateTime.setMinutes(0,0,0,0)
        }
        // change to :30 else change to :00
        if(dateTime.getMinutes() < 30){
            dateTime.setMinutes(0, 0, 0);
        } else {
            dateTime.setMinutes(30, 0,0);
        }

        return dateTime.getTime();
    }
    /**
     * from starting timestamp and ending timestamp of available slot return available slot in working time and date
     * @param {Number} startTimeStamp timestamp of starting time of slot
     * @param {Number} endTimeStamp timestamp of ending time of slot
     * @returns array of all availble slots in working day and time
     */
    #workingDayFilter(startTimeStamp, endTimeStamp) {
        let startDateTime = new Date(startTimeStamp);
        let endDateTime=new Date(endTimeStamp);
        let currentDateTime = startDateTime;
        console.log(startDateTime, endDateTime)

        const workDayAvailableSlots = [];
        while (currentDateTime < endDateTime) {
            const currentDay = currentDateTime.getDay();
            if (currentDay >= CONSTANTS.WEEKDAY_START && currentDay <= CONSTANTS.WEEKDAY_END) {
                
                const workStartDateTime = new Date(currentDateTime);
                workStartDateTime.setHours(CONSTANTS.WORKING_HOUR_START, 0, 0, 0);
        
                const workEndDateTime = new Date(currentDateTime);
                workEndDateTime.setHours(CONSTANTS.WORKING_HOUR_END, 0, 0, 0);
        
                if (workEndDateTime.getTime() > startTimeStamp && workStartDateTime.getTime() < endTimeStamp) {
                    const availabilityStartTimeStamp = Math.max(workStartDateTime.getTime(), startTimeStamp);
                    const availabilityEndTimeStamp = Math.min(workEndDateTime.getTime(), endTimeStamp);
            
                    workDayAvailableSlots.push({
                        timeStart: `${availabilityStartTimeStamp}`,
                        timeEnd: `${availabilityEndTimeStamp}`,
                        available: true,
                        meetingId: uuidv4()
                    });
                }
            }
            currentDateTime.setDate(currentDateTime.getDate()+1)
        }
        return workDayAvailableSlots;
    }
}

export const databaseClient = new DatabaseClass();
