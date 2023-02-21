import { useParams } from 'react-router-dom'
import { ScheduleHeader } from './schedule-header'
import { PromptsContainer } from './prompts-container'

export const Schedule = () => {
  const { dayId } = useParams()

  return (
    <div className='task-list__wrapper-page'>
      <ScheduleHeader dayId={dayId} />
      <PromptsContainer />
      <PromptsContainer />
    </div>
  )
}
