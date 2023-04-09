import featherIcon from 'assets/svg/feather-sprite.svg'
import { useOverlayContextValue } from 'context/overlay-context'
import { useState } from 'react'
import { useSchedules } from 'hooks'
import { Schedule } from './schedule'

export const Schedules = () => {
  const [showSchedules, setShowSchedules] = useState(true)
  const { setShowDialog } = useOverlayContextValue()
  const { schedules } = useSchedules()

  /* purpose: sorts project names at sidebar alphabetically */
  const sortSchedulesByName = (schedules) => {
    return schedules.sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1
      }
      if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1
      }
      return 0
    })
  }

  return (
    <div className='custom-project-group__wrapper'>
      <div
        className='custom-project-group__title-group'
        onClick={() => setShowSchedules(!showSchedules)}
      >
        <div
          className='custom-project-group__icon'
          style={{ transform: `rotate(${showSchedules ? 0 : -90}deg)` }}
        >
          <svg
            width='24'
            height='24'
            fill='none'
            stroke='#777777'
            strokeWidth='1px'
          >
            <use href={`${featherIcon}#chevron-down`}></use>
          </svg>
        </div>

        <div className='custom-project-group__name'>Schedules</div>

        <button
          className='custom-project-group__add-project'
          onClick={(event) => {
            event.stopPropagation()
            setShowDialog('ADD_SCHEDULE')
          }}
        >
          <svg
            width='21'
            height='21'
            fill='none'
            stroke='currentColor'
            strokeWidth='1'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <use xlinkHref={`${featherIcon}#plus`}></use>
          </svg>
        </button>
      </div>
      {showSchedules && (
        <div
          className='custom-projects'
          style={{ height: `${showSchedules ? '100%' : '0%'}` }}
        >
          {sortSchedulesByName(schedules).map((schedule) => (
            <Schedule key={schedule.id} schedule={schedule} />
          ))}
        </div>
      )}
    </div>
  )
}
