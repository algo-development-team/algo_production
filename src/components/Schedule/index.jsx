import { useParams } from 'react-router-dom'

export const Schedule = () => {
  const { dayId } = useParams()

  return (
    <div className='task-list__wrapper'>
      <h1>Schedule</h1>
      <p>{dayId}</p>
    </div>
  )
}
