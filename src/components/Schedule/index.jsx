import { useParams } from 'react-router-dom'
import { ScheduleHeader } from './schedule-header'
import { PromptsContainer } from './prompts-container'
import { EventsContainer } from './events-container'
import { useState } from 'react'

export const Schedule = () => {
  const { dayId } = useParams()
  const [promptsClosed, setPromptsClosed] = useState(false)
  const [eventsClosed, setEventsClosed] = useState(false)

  return (
    <div className='task-list__wrapper-page'>
      <ScheduleHeader dayId={dayId} />
      <PromptsContainer
        promptsClosed={promptsClosed}
        setPromptsClosed={setPromptsClosed}
        eventsClosed={eventsClosed}
      />
      <EventsContainer
        eventsClosed={eventsClosed}
        setEventsClosed={setEventsClosed}
        promptsClosed={promptsClosed}
      />
    </div>
  )
}
