/*
const avtimes = AvailableTimes
const tlist = TaskList

const addEventsToFullCalendar = (tlist, avtimes) => {
  if (AvailableTimes != null && TaskList != null) {
    const newCustomEvents = [...calendarsEvents.custom]
    let m = 0
    let t = avtimes[m].start
    let buffer = 0
    let smalltasknumber = 0
    let y = 0
    for (let i = 0; i < tlist.length; i++) {
      if (
        moment(avtimes[avtimes.length - 1].end).diff(moment(t), 'minutes') <
        tlist[i].timeLength
      ) {
        break
      }
      if (tlist[i].timeLength >= 0) {
        if (tlist[i].timeLength < 120) {
          smalltasknumber = smalltasknumber + 1
        }
        buffer = 0
      }
      if (tlist[i].timeLength >= 120) {
        buffer = 15
      }
      if (tlist[i].timeLength >= 240) {
        buffer = 30
      }
      if (tlist[i].timeLength >= 480) {
        buffer = 60
      }
      if (smalltasknumber === 3) {
        buffer = 15
        smalltasknumber = 0
      }
      const diff = moment(avtimes[m].end).diff(
        moment(t).clone().add(tlist[i].timeLength, 'minutes'),
        'minutes',
      )
      if (diff < 0) {
        let a = null
        for (let p = m + 1; p < avtimes.length; p++) {
          if (
            moment(avtimes[p].end).diff(moment(avtimes[p].start), 'minutes') >=
            tlist[i].timeLength
          ) {
            m = p
            t = avtimes[p].start
            a = 1
            break
          }
        }
        if (a !== null) {
          y = 2
          // for nothing
        } else {
          y = 1
        }
      }
      if (y === 1) {
        break
      }
      const newEvent1 = {
        id: tlist[i].id,
        title: tlist[i].name,
        start: moment(t).format('YYYY-MM-DD HH:mm'),
        end: moment(t)
          .add(tlist[i].timeLength, 'minutes')
          .format('YYYY-MM-DD HH:mm'),
        taskId: tlist[i].id,
        description: tlist[i].description,
      }
      t = moment(t).add(tlist[i].timeLength, 'minutes')
      t = moment(t).add(buffer, 'minutes')
      calendar.addEvent(newEvent1)
      newCustomEvents.push(newEvent1)
    }
    setCalendarsEvents({
      ...calendarsEvents,
      custom: newCustomEvents,
    })
  } else {
    if (AvailableTimes === null) {
      console.log('no available times')
    }
    if (TaskList === null) {
      console.log('tasklist empty')
    }
    console.log('cannot schedule')
  }
}
if (AutoScheduleButtonClicked === true) {
  addEventsToFullCalendar(tlist, avtimes)
  setAutoScheduleButtonClicked(false)
  setAvailableTimes(null)
  setTaskList(null)
}
*/

// tasklist goes empty sometimes
// leaves empty spaces that could have otherwise been filled, if next task is too long - to be solved after scheduled tracker is implemented
// Does not consider breaks other than breaks it has put on it's own(and that too only during the current run) - to be solved after thought and discussions
// Notification if nothing can be added, should be added.(suggestion)
// Doesn't consider soft deadlines, just one line of code change to solve, later, after discussion.
