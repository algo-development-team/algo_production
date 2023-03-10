import { ScheduleCreatedMsg } from 'components/ScheduleCreatedMsg'

export const Block = ({ closeOverlay }) => {
  return (
    <div className='option__overlay' onClick={(event) => closeOverlay(event)}>
      <div className='quick-add-task__wrapper'>
        aaa
      </div>
    </div>
  )
}
