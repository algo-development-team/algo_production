import { useParams } from 'react-router-dom'
import { ScheduleHeader } from './schedule-header'
import { PromptsContainer } from './prompts-container'
import { EventsContainer } from './events-container'

export const Schedule = () => {
  const { dayId } = useParams()

  return (
    <div className='task-list__wrapper-page'>
      <ScheduleHeader dayId={dayId} />
      <PromptsContainer />
      <EventsContainer />
    </div>
  )
}
