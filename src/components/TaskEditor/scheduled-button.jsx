import { ReactComponent as ScheduleIcon } from 'assets/svg/scheduler.svg'

// scheduledType: 'NOT_LOADED' | 'SCHEDULED' | 'UNSCHEDULED'
export const ScheduledButton = ({
  scheduledType,
  showScheduledEvents,
  setShowScheduledEvents,
}) => {
  const getScheduledButtonText = () => {
    if (scheduledType === 'SCHEDULED') {
      if (showScheduledEvents) {
        return 'Hide Scheduled Events'
      } else {
        return 'Show Scheduled Events'
      }
    } else if (scheduledType === 'UNSCHEDULED') {
      return 'Not Scheduled'
    }
  }

  if (scheduledType === 'NOT_LOADED') {
    return null
  }

  return (
    <>
      <div
        className='set-new-task__schedule'
        onClick={() => {
          if (scheduledType === 'SCHEDULED') {
            setShowScheduledEvents(!showScheduledEvents)
          }
        }}
      >
        <ScheduleIcon width={'18px'} height={'18px'} />

        {getScheduledButtonText()}
      </div>
    </>
  )
}
