import {
  getDayId,
  getDayDiff,
  getDayOfWeek,
  formatDate,
  getDay,
} from '../../handleDayId'
import { NavLink } from 'react-router-dom'

export const ScheduleHeader = ({ dayId }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <button
        style={{
          color: 'inherit',
          padding: '10px',
          fontSize: '16px',
          borderRadius: '5px',
          backgroundColor: '#282828',
        }}
      >
        {formatDate(dayId)}
      </button>
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
      <button
        style={{
          color: 'inherit',
          padding: '10px',
          fontSize: '16px',
          borderRadius: '5px',
          backgroundColor: '#282828',
        }}
      >
        See Weekly View
      </button>
    </div>
  )
}
