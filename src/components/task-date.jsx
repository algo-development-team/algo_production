import { ReactComponent as ScheduleIcon } from 'assets/svg/scheduler.svg'
import moment from 'moment'

export const TaskDate = ({ date }) => {
  moment.defaultFormat = 'DD-MM-YYYY'

  const dateInMoment = moment(date, 'DD-MM-YYYY')
  const today = moment().startOf('day')
  const yesterday = moment().startOf('day').subtract(1, 'day')
  const tomorrow = moment().startOf('day').add(1, 'day')

  const isToday = dateInMoment.isSame(today)
  const isYesterday = dateInMoment.isSame(yesterday)
  const isTomorrow = dateInMoment.isSame(tomorrow)
  const isPast = dateInMoment.isBefore(today)
  //console.log("DATE!!!!!!!!!!!!!", moment(date, moment.defaultFormat).format("dddd"), isWeekend, date);

  //todo: rename this function
  const getDateCustomClass = () => {
    if (isToday) {
      return 'date__today'
    }
    if (isTomorrow) {
      return 'date__tomorrow'
    }
    if (isPast || isYesterday) {
      return 'date__overdue'
    }
    return 'date__next-week'
  }
  const getDayName = () => {
    if (isToday) {
      return 'Today'
    }
    if (isTomorrow) {
      return 'Tomorrow'
    }
    if (isYesterday) {
      return 'Yesterday'
    }
    return moment(date, moment.defaultFormat).format('MMM DD')
    // return moment(date, moment.defaultFormat).format('dddd')
  }
  return (
    <span className={`task__date ${getDateCustomClass()}`}>
      <ScheduleIcon width='14px' height='14px' />
      {/* {moment(date, moment.defaultFormat).format("DD MMM")} */}
      {getDayName()}
    </span>
  )
}
