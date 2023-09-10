export function condense(roomAvailablityData: [Any]) {
    // const allAvailableSlots
    const availabileSlots = [];
    for (let i = 0; i < roomAvailablityData.length; i++) {
        let timeStart = parseInt(roomAvailablityData.at(i).timeStart, 10);
        let timeEnd = parseInt(roomAvailablityData.at(i).timeEnd, 10);

        let j = timeStart + (30*60*1000);
        while (j<timeEnd) {
            availabileSlots.push({
                timeStart: `${timeStart}`,
                timeEnd: `${j}`
            })
            timeStart = j;
            j = j + (30*60*1000);
        }
        availabileSlots.push({
            timeStart: `${timeStart}`,
            timeEnd: `${timeEnd}`
        })
    }
    return availabileSlots;
}

export function findSlotCount(startDateTime: Number, endDateTime: Number) {
    if(startDateTime >= endDateTime)
        return 0;
    const diffMs = endDateTime - startDateTime;
    return diffMs/(60000*30);
}