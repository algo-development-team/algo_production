import { useSchedules } from 'hooks'

export const SetProjectScheduleIdDropdown = ({ setProjectScheduleId }) => {
  const { schedules } = useSchedules()

  return (
    <div className='add-project__set-selected-color' style={{ zIndex: 298 }}>
      <div className='add-project__set-selected-color--option'>
        <ul>
          {schedules &&
            schedules.map((schedule) => (
              <li
                key={schedule.id}
                className='add-project__colour-dropdown--option'
                onClick={() => setProjectScheduleId(schedule.id)}
              >
                <p className='add-project__colour-dropdown--option-name'>
                  {schedule.name}
                </p>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
