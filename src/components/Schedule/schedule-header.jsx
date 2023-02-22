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

export const ScheduleHeader = ({ dayId }) => {
  const [isWeeklyView, setIsWeeklyView] = useState(false)
  const { sizes } = useResponsiveSizes()

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: sizes.smallPhone ? 'center' : 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {!sizes.smallPhone && (
        <button
          style={{
            color: 'inherit',
            padding: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            backgroundColor: '#282828',
            width: '120px',
          }}
        >
          {formatDate(dayId)}
        </button>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <p
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#3f4cda',
            marginBottom: '2px',
          }}
        >
          {getDayOfWeek(dayId)}
        </p>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <NavLink to={`/schedule/${getDayId(getDayDiff(dayId) - 1)}`}>
            <i class='arrow-xl left' />
          </NavLink>
          <button
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              marginLeft: '5px',
              marginRight: '5px',
              backgroundColor: '#3f4cda',
              cursor: 'default',
            }}
          >
            {getDay(dayId)}
          </button>
          <NavLink to={`/schedule/${getDayId(getDayDiff(dayId) + 1)}`}>
            <i class='arrow-xl right' />
          </NavLink>
        </div>
      </div>
      {!sizes.smallPhone && (
        <button
          style={{
            color: 'inherit',
            padding: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            backgroundColor: '#282828',
            width: '120px',
          }}
          onClick={() => setIsWeeklyView(!isWeeklyView)}
        >
          {isWeeklyView ? 'Daily' : 'Weekly'}
        </button>
      )}
    </div>
  )
}
