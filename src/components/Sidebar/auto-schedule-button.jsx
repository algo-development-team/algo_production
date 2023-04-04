import { AutoSchedule } from '../../scheduler/schedule-v3'
import { useCalendarsEventsValue, useAutoScheduleButtonClickedValue, useScheduleValue, useTaskEditorContextValue, useAvailableTimesValue, useTaskListValue} from '../../context'
import { getAllUserTasks } from "handleUserTasks"
import { useAuth } from 'hooks'
import { query, collection, orderBy, getDocs } from 'firebase/firestore'
import { db } from '_firebase'
import moment from 'moment'
import React from 'react'

function getAvailableTimes(array, startDateTime, endDateTime) {
  const availableTimes = [];
  if(!(moment(startDateTime).isAfter(moment(array[0].start)))){
    availableTimes.push({start: moment(startDateTime).format('ddd MMM DD YYYY HH:mm'), end: moment(array[0].start).format('ddd MMM DD YYYY HH:mm')})
  }
    for(let i = 0; i < array.length - 1; i++){
      availableTimes.push({start: moment(array[i].end).format('ddd MMM DD YYYY HH:mm'), end: moment(array[i + 1].start).format('ddd MMM DD YYYY HH:mm')})
    }
    if(!(moment(array[array.length - 1].end).isAfter(moment(endDateTime)))){
      availableTimes.push({start: moment(array[array.length - 1].end).format('ddd MMM DD YYYY HH:mm'), end: moment(endDateTime).format('ddd MMM DD YYYY HH:mm')})
    }
  return availableTimes;
}

function findOverlappingTimes(array1, array2) {
  const overlappingTimes = [];

  array1.forEach(item1 => {
    array2.forEach(item2 => {
      const start1 = moment(item1.start);
      const end1 = moment(item1.end);
      const start2 = moment(item2.start);
      const end2 = moment(item2.end);

      const overlapStart = moment.max(start1, start2);
      const overlapEnd = moment.min(end1, end2);

      if (overlapStart.isBefore(overlapEnd)) {
        overlappingTimes.push({
          start: overlapStart.format('ddd MMM DD YYYY HH:mm'),
          end: overlapEnd.format('ddd MMM DD YYYY HH:mm'),
        });
      }
    });
  });

  return overlappingTimes;
}

function getIntervalArray(startDateStr, endDateStr, startTimeStr, endTimeStr) {
const intervalArray = [];

const Time1 = moment(startTimeStr, 'HH:mm');
const Time2 = moment(endTimeStr, 'HH:mm');
const days = moment(endDateStr).diff(moment(startDateStr), 'days')
if (Time1.isBefore(Time2)){
  for(let i = 0; i < days + 1; i++){
    intervalArray.push({start: `${moment(moment(startDateStr).clone().add(i,'days')).format('ddd MMM DD YYYY')} ${startTimeStr}`, end: `${moment(moment(startDateStr).clone().add(i,'days')).format('ddd MMM DD YYYY')} ${endTimeStr}`})
  }
} else if(Time1.isAfter(Time2)) {
  for(let i = 0; i < days + 1; i++){
    intervalArray.push({start: `${moment(moment(startDateStr).clone().add(i,'days')).format('ddd MMM DD YYYY')} ${startTimeStr}`, end: `${moment(moment(startDateStr).clone().add(i + 1,'days')).format('ddd MMM DD YYYY')} ${endTimeStr}`})
  }
}
  return intervalArray;
}



export const getUserTaskList = async (userId) => {

  const taskslist = []
  const taskQuery = await query(
    collection(db, 'user', `${userId}/tasks`),
    orderBy('index', 'asc'),
  )
  const taskDocs = await getDocs(taskQuery)
  const nonCompletedTasks = []
  const completedTasks = []
  taskDocs.forEach((taskDoc) => {
    const task = taskDoc.data()
    if (!task.completed) {
      nonCompletedTasks.push(task)
    } else {
      completedTasks.push(task)
    }
  })
  for(let i = 0; i < nonCompletedTasks.length; i++) {
    if(nonCompletedTasks[i].priority === 1){
    taskslist.push({name: nonCompletedTasks[i].name, timeLength: nonCompletedTasks[i].timeLength, 
      description: nonCompletedTasks[i].description, id: nonCompletedTasks[i].taskId})
    }
     }
  for(let i = 0; i < nonCompletedTasks.length; i++) {
      if(nonCompletedTasks[i].priority === 2){
      taskslist.push({name: nonCompletedTasks[i].name, timeLength: nonCompletedTasks[i].timeLength, 
        description: nonCompletedTasks[i].description, id: nonCompletedTasks[i].taskId})
      }
       }
  for(let i = 0; i < nonCompletedTasks.length; i++) {
        if(nonCompletedTasks[i].priority === 3){
        taskslist.push({name: nonCompletedTasks[i].name, timeLength: nonCompletedTasks[i].timeLength, 
          description: nonCompletedTasks[i].description, id: nonCompletedTasks[i].taskId})
        }
         }
        return taskslist
}

const parse = (taskString) => {
  const tasks = taskString.split(",");
  return tasks
}
export const AutoScheduleButton = () => {
  const { setAutoScheduleButtonClicked } = useAutoScheduleButtonClickedValue()
  const { setTaskList } = useTaskListValue()
  const { setAvailableTimes } = useAvailableTimesValue() 
  // const { setScheduler } = useScheduleValue()
  const { currentUser} = useAuth()
  const getUserTasks = getAllUserTasks(currentUser.id)
  const { calendarsEvents, setCalendarsEvents } = useCalendarsEventsValue()
  const calendarRefined = (calendarsEvents, starttime, endtime) => {
    const calendarEventsInChosenTime = []
  for (let i = 0; i < calendarsEvents.custom.length; i++) {
    let a = false
    const time1 = moment(calendarsEvents.custom[i].start).format('HH:mm')
    const time2 = moment(calendarsEvents.custom[i].end).format('HH:mm')
    if((moment(`2004-04-05 ${starttime}`).isBetween(moment(`2004-04-05 ${time1}`),moment(`2004-04-05 ${time2}`), null, '[]')) && (moment(`2004-04-05 ${endtime}`).isBetween(moment(`2004-04-05 ${time1}`),moment(`2004-04-05 ${time2}`), null, '[]'))){
      a = true;
    }
    if (moment(`2004-04-05 ${time1}`).isBetween(moment(`2004-04-05 ${starttime}`), moment(`2004-04-05 ${endtime}`), null, '[]') || 
    moment(`2004-04-05 ${time2}`).isBetween(moment(`2004-04-05 ${starttime}`), moment(`2004-04-05 ${endtime}`, null, '[]'))  || (a === true)
    ) {
       calendarEventsInChosenTime.push(calendarsEvents.custom[i])
    }
  }
  return calendarEventsInChosenTime
}
  const handleClick = async () => {
    const startTime = "09:00"
    const endTime = "17:00"

    setAutoScheduleButtonClicked(true)
    // setScheduler(taskslist)
    const refinedTimes = calendarRefined(calendarsEvents, startTime, endTime)
    AutoSchedule(calendarsEvents);
    getUserTaskList(currentUser.id)
    const blockedTimesArray = [];
    for(let i = 0; i < refinedTimes.length; i++) {
      const start1 = refinedTimes[i].start
      const end1 = refinedTimes[i].end
      const start = moment(start1).format('ddd MMM DD YYYY HH:mm:ss')
      const end = moment(end1).format('ddd MMM DD YYYY HH:mm:ss')
    blockedTimesArray.push({start: `${start}`, end:`${end}`})
    }
    function sortEventsByStartDate(events) {
      const sortedEvents = events.sort((a, b) => new Date(a.start) - new Date(b.start));
    
      return sortedEvents.map((event, index) => ({
        ...event,
        index,
      }));
    }
    const sortedTimes = sortEventsByStartDate(blockedTimesArray)
    // const availabletimes = getAvailableTimes(`Tue Mar 28 2023 07:00:00`, `Sat Apr 01 2023 19:00:00`, sortedTimes)
    const intervals = getIntervalArray('Sun Apr 02 2023', 'Fri Apr 07 2023', '09:00', '17:00');
    const availableTimesRaw = getAvailableTimes(sortedTimes, 'Sun Apr 02 2023 09:00', 'Fri Apr 07 2023 17:00')
    const availableTimes = findOverlappingTimes(intervals, availableTimesRaw)
    console.log("available times" , availableTimes)
    setAvailableTimes(availableTimes)
    const userTaskList = await getUserTaskList(currentUser.id)
    setTaskList(userTaskList)
  }

  return (
    <div>
      <button 
      onClick={handleClick}
      >
        Auto Schedule
      </button>
    </div>
  )
}

/*   function checkstart() {
    let r = moment(blockedTimes[1].start).diff(moment(blockedTimes[0].end), 'days');
    if (moment(`2004-04-05 ${moment(blockedTimes[0].start).format('HH:mm')}`).isBetween(moment(`2004-04-05 ${moment(startDate).format('HH:mm')}`), moment(`2004-04-05 ${moment(endDate).format('HH:mm')}`), null, '[]')) {
      availableTimes.push({start: `${moment(blockedTimes[0].start).format('ddd MMM DD YYYY')} ${moment(startDate).format('HH:mm')}`,end:`${moment(blockedTimes[0].start).format('ddd MMM DD YYYY HH:mm')}`});
      a = 1;
    } else if(r === 0) {
      availableTimes.push({start:`${moment(blockedTimes[0].end).format('ddd MMM DD YYYY HH:mm')}`, end:`${moment(blockedTimes[1].start).format('ddd MMM DD YYYY HH:mm')}`});
      a = 2;
    } else {
      a = 2;
      availableTimes.push({start: `${moment(blockedTimes[0].end).format('ddd MMM DD YYYY HH:mm')}`, end:`${moment(blockedTimes[0].end).format('ddd MMM DD YYYY')} 19:00`})
      if(r > 1){
        for(let i = 0; i < r; i++){
          let day = i;
          availableTimes.push({start: `${moment(blockedTimes[0].end).clone().add(day, 'days').format('ddd MMM DD YYYY')} 07:00`, end: `${moment(blockedTimes[0].end).clone().add(day, 'days').format('ddd MMM DD YYYY')} 19:00`})
      }
    }
      availableTimes.push({start: `${moment(blockedTimes[1].start).format('ddd MMM DD YYYY')} 07:00`, end:`${moment(blockedTimes[1].start).format('ddd MMM DD YYYY HH:mm')}`})
    }
} */
/* function getAvailableTimes(startDate, endDate, blockedTimes) {
  const availableTimes = [];
  let a = 0;
  function startEmptyDays() {
    const firstDate = moment(moment(startDate).format('YYYY-MM-DD'))
    const nextDate = moment(moment(blockedTimes[0].start).format('YYYY-MM-DD'))
    if(firstDate.isBefore(nextDate)){
        for(let i = 0; i < nextDate.diff(firstDate, 'days'); i++){
          let day = i;
          availableTimes.push({start: `${moment(firstDate.clone().add(day, 'days')).format('ddd MMM DD YYYY')} 07:00`, end: `${moment(firstDate.clone().add(day, 'days')).format('ddd MMM DD YYYY')} 19:00`})
    }
  }
}
  startEmptyDays()
  function checkstart() {
    let r = moment(blockedTimes[1].start).diff(moment(blockedTimes[0].end), 'days');
    if (moment(`2004-04-05 ${moment(blockedTimes[0].start).format('HH:mm')}`).isBetween(moment(`2004-04-05 ${moment(startDate).format('HH:mm')}`), moment(`2004-04-05 ${moment(endDate).format('HH:mm')}`), null, '[]')) {
      availableTimes.push({start: `${moment(blockedTimes[0].start).format('ddd MMM DD YYYY')} ${moment(startDate).format('HH:mm')}`,end:`${moment(blockedTimes[0].start).format('ddd MMM DD YYYY HH:mm')}`});
      a = 1;
    } else if(r === 0) {
      availableTimes.push({start:`${moment(blockedTimes[0].end).format('ddd MMM DD YYYY HH:mm')}`, end:`${moment(blockedTimes[1].start).format('ddd MMM DD YYYY HH:mm')}`});
      a = 2;
    } else {
      a = 2;
      availableTimes.push({start: `${moment(blockedTimes[0].end).format('ddd MMM DD YYYY HH:mm')}`, end:`${moment(blockedTimes[0].end).format('ddd MMM DD YYYY')} 19:00`})
      if(r > 1){
        for(let i = 0; i < r; i++){
          let day = i;
          availableTimes.push({start: `${moment(blockedTimes[0].end).clone().add(day, 'days').format('ddd MMM DD YYYY')} 07:00`, end: `${moment(blockedTimes[0].end).clone().add(day, 'days').format('ddd MMM DD YYYY')} 19:00`})
      }
    }
      availableTimes.push({start: `${moment(blockedTimes[1].start).format('ddd MMM DD YYYY')} 07:00`, end:`${moment(blockedTimes[1].start).format('ddd MMM DD YYYY HH:mm')}`})
    }
}
checkstart()
  // if the if statement isn't true, nothing needs to be done since a block fills the starting part of the schedule
  let i = a;
  const blockedTimesLength = blockedTimes.length;
  console.log('blocked times:', blockedTimes)
  while(i < (blockedTimesLength)) {
    let s = moment(blockedTimes[i].start).diff(moment(blockedTimes[i - 1].end), 'days')
    if(s === 0){
    availableTimes.push({start: `${moment(blockedTimes[i - 1].end).format('ddd MMM DD YYYY HH:mm')}`,end:`${moment(blockedTimes[i].start).format('ddd MMM DD YYYY HH:mm')}`})
    i++;
    } else {
      availableTimes.push({start: `${moment(blockedTimes[i - 1].end).format('ddd MMM DD YYYY HH:mm')}`, end: `${moment(blockedTimes[i - 1].end).format('ddd MMM DD YYYY')} 19:00`})
      console.log(blockedTimes[i - 1].end)
      console.log(s)
      if(s > 0) {
        for(let i = 1; i < s + 1; i++){
          let day = i;
          availableTimes.push({start: `${moment(blockedTimes[i - 1].end).clone().add(day, 'days').format('ddd MMM DD YYYY')} 07:00`, end: `${moment(blockedTimes[i - 1].end).clone().add(day, 'days').format('ddd MMM DD YYYY')} 19:00`})
        }
      }
      availableTimes.push({start: `${moment(blockedTimes[i].start).format('ddd MMM DD YYYY')} 07:00`, end: `${moment(blockedTimes[i].start).format('ddd MMM DD YYYY HH:mm')}`})
      i++;
    }
  
  }
  function checkend() {
    const n = blockedTimes.length - 1
    let m = moment(`2004-04-05 ${moment(endDate).format('HH:mm')}`).isBetween(moment(`2004-04-05 ${moment(blockedTimes[n].start).format('HH:mm')}`), moment(`2004-04-05 ${moment(blockedTimes[n].end).format('HH:mm')}`))
    if (!m) {
      availableTimes.push({start: `${moment(blockedTimes[n].end).format('ddd MMM DD YYYY HH:mm')}`, end: `${moment(blockedTimes[n].end).format('ddd MMM DD YYYY')} 19:00`});
    }
  }
 checkend()
 function endEmptyDays() {
  let a = blockedTimes.length - 1
  const firstDate = moment(moment(blockedTimes[a].start).format('YYYY-MM-DD'))
  const nextDate = moment(moment(endDate).format('YYYY-MM-DD'))
  if(firstDate.isBefore(nextDate)){
      for(let i = 1; i < nextDate.diff(firstDate, 'days') + 1; i++){
        let day = i;
        availableTimes.push({start: `${moment(firstDate.clone().add(day, 'days')).format('ddd MMM DD YYYY')} 07:00`, end: `${moment(firstDate.clone().add(day, 'days')).format('ddd MMM DD YYYY')} 19:00`})
  }
}
}
endEmptyDays()

 return availableTimes
} */