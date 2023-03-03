import {
  getDayId,
  getDayDiff,
  getDayOfWeek,
  formatDate,
  getDay,
} from '../../handleDayId'
import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useResponsiveSizes } from 'hooks'
import './styles/light.scss'
import './styles/main.scss'

export const ScheduleHeader = ({ dayId }) => {
  const [isWeeklyView, setIsWeeklyView] = useState(false)
  const { sizes } = useResponsiveSizes()

  return (
    <div className={`schedule-header${sizes.smallPhone ? '-small-phone' : ''}`}>
      {!sizes.smallPhone && (
        <button className='schedule-header__menu-btn'>
          {formatDate(dayId)}
        </button>
      )}
      <div className='schedule-header__date-btn-container'>
        <p className='schedule-header__date-btn-subtitle'>
          {getDayOfWeek(dayId)}
        </p>
        <div className='schedule-header__date-btn-icon-container'>
          <NavLink to={`/schedule/${getDayId(getDayDiff(dayId) - 1)}`}>
            <i class='arrow-xl left' />
          </NavLink>
          <button className='schedule-header__date-btn-icon'>
            {getDay(dayId)}
          </button>
          <NavLink to={`/schedule/${getDayId(getDayDiff(dayId) + 1)}`}>
            <i class='arrow-xl right' />
          </NavLink>
        </div>
      </div>
      {!sizes.smallPhone && (
        <button
          className='schedule-header__menu-btn'
          onClick={() => setIsWeeklyView(!isWeeklyView)}
        >
          {isWeeklyView ? 'Daily' : 'Weekly'}
        </button>
      )}
    </div>
  )
}
