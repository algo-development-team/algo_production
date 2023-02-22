import { useEffect } from 'react'

export const EventTimeDisplay = ({ isStart, time, setEvents, eventIndex }) => {
  /*The is the Handle of the AM & PM */
  const formatHour = (hour) => {
    if (hour > 12) {
      return hour - 12
    } else if (hour === 0) {
      return 12
    } else {
      return hour
    }
  }

  const formatMin = (min) => {
    if (min < 10) {
      return `0${min}`
    } else {
      return min
    }
  }

  const displayAMPM = (hour) => {
    if (hour >= 12) {
      return 'pm'
    } else {
      return 'am'
    }
  }

  const handleAdjustTime = (isInc) => {
    const newTime = time.clone()
    if (isInc) {
      newTime.add(15, 'minutes')
    } else {
      newTime.subtract(15, 'minutes')
    }
    setEvents((prevEvents) => {
      const newEvents = [...prevEvents]
      if (isStart) {
        newEvents[eventIndex] = {
          ...newEvents[eventIndex],
          startTime: newTime,
        }
      } else {
        newEvents[eventIndex] = {
          ...newEvents[eventIndex],
          endTime: newTime,
        }
      }
      return newEvents
    })
  }

  return (
    <div className='display-row' style={{ cursor: 'pointer' }}>
      {!isStart && <p style={{ marginLeft: '5px' }}>to</p>}
      <p style={{ marginLeft: '5px' }}>{time.format('hh:mm a')}</p>
      <div
        className='display-col'
        style={{ marginLeft: '5px', marginRight: '5px' }}
      >
        <i class='arrow-md up' onClick={() => handleAdjustTime(false)} />
        <i class='arrow-md down' onClick={() => handleAdjustTime(true)} />
      </div>
    </div>
  )
}
