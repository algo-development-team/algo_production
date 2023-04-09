
import moment from "moment"

export const AutoSchedule = (calendarsEvents) => {
  for (let i = 0; i < calendarsEvents.custom.length; i++) {
  const BlockedTimeStartDay = calendarsEvents.custom[i].start
  if (moment(BlockedTimeStartDay).isBefore(moment().add(7, 'days'))) {
    const formattedStartDate = moment(calendarsEvents.custom[i].start).format('ddd HH:mm')
    const formattedEndDate = moment(calendarsEvents.custom[i].end).format('ddd HH:mm')
  
  // console.log(`${formattedStartDate}:${formattedEndDate}`) 
  }
}
}
