import { useEffect } from 'react'
import { useResponsiveSizes } from 'hooks'

export const EventTimeDisplay = ({ isStart, time, setEvents, eventIndex }) => {
  const { sizes } = useResponsiveSizes()

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
      {!isStart && !sizes.smallPhone && <p style={{ marginLeft: '5px' }}>to</p>}
      <p style={{ marginLeft: !isStart && sizes.smallPhone ? '10px' : '5px' }}>
        {time.format('hh:mm a')}
      </p>
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
