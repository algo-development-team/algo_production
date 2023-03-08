import { useEffect, useState } from 'react'
import { useExternalEventsContextValue } from 'context'
import { useTasks } from 'hooks'
import { ReactComponent as LookupIcon } from 'assets/svg/lookup.svg'

export const SearchField = () => {
  const [searchText, setSearchText] = useState('')
  const { externalEventsRef } = useExternalEventsContextValue()
  const { tasks } = useTasks()

  const searchTasks = (searchText, tasks) => {
    if (!searchText) {
      return tasks
    }

    const result = [...tasks]
    const searchTextWords = searchText
      .toLowerCase()
      .split(' ')
      .filter((word) => word !== '')
    for (const word of searchTextWords) {
      for (let i = 0; i < result.length; i++) {
        if (!result[i].name.toLowerCase().includes(word)) {
          result.splice(i, 1)
          i--
        }
      }
    }

    return result
  }

  const displayHourMin = (timeLength) => {
    const hours = Math.floor(timeLength / 60)
    const minutes = timeLength % 60
    if (hours === 0) {
      return `${minutes}min`
    } else if (minutes === 0) {
      return `${hours}h`
    }
    return `${hours}h ${minutes}min`
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ paddingLeft: '5px' }}>
          <LookupIcon />
        </div>
        <input
          type='text'
          style={{
            padding: '10px 10px 10px 10px',
            borderRadius: '5px',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            fontSize: '16px',
            outline: 'none',
            width: 'calc(100% - 23px)',
            boxSizing: 'border-box',
            marginBottom: '15px',
          }}
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
        />
      </div>
      <div
        ref={externalEventsRef}
        style={{
          height: '600px',
          overflowY: 'scroll',
          overflowX: 'hidden',
        }}
      >
        {searchTasks(searchText, tasks).map((task) => {
          return (
            <div
              className='fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event'
              data-event={JSON.stringify(task)}
              style={{
                width: '100%',
                height: `${task.timeLength}px`,
                marginBottom: '10px',
              }}
            >
              {task.timeLength < 60 ? (
                <div className='fc-event-main'>
                  <span style={{ marginRight: '10px' }}>{task.name}</span>
                  <span>{displayHourMin(task.timeLength)}</span>
                </div>
              ) : (
                <>
                  <div className='fc-event-main'>{task.name}</div>
                  <div className='fc-event-main'>
                    {displayHourMin(task.timeLength)}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
