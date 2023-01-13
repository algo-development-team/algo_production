import { ReactComponent as ScheduleIcon } from 'assets/svg/scheduler.svg'

/* This Function makes sures that the scheduled time of the Task is listed in each 'Task'*/
export const TaskScheduleTime = ({ timeLength }) => {
  const getTimeLengthText = () => {
    const min = timeLength % 60
    const hour = (timeLength - min) / 60
    let text = ''
    if (hour !== 0) {
      text += `${hour}h`
    }
    if (hour !== 0 && min !== 0) {
      text += ` ${min}min`
    } else if (min !== 0) {
      text += `${min}min`
    }
    /*return `${text}`*/
    return `${text}`
  }

  return (
    <>
      <span className={`task__date date__no-date`}>
        <ScheduleIcon width='14px' height='14px' />
        {getTimeLengthText()}
      </span>
    </>
  )
}
