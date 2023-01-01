import { ScheduleCreatedMsg } from 'components/ScheduleCreatedMsg'

export const ScheduleCreated = ({ closeOverlay }) => {
  return (
    <div className='option__overlay' onClick={(event) => closeOverlay(event)}>
      <div className='quick-add-task__wrapper'>
        <ScheduleCreatedMsg closeOverlay={closeOverlay} />
      </div>
    </div>
  )
}
