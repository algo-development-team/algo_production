import { useEffect, useState } from 'react'
import { useExternalEventsContextValue } from 'context'
import { useTasks } from 'hooks'
import { ReactComponent as LookupIcon } from 'assets/svg/lookup.svg'
import { AddTaskbar } from './add-task'
import { FilterTaskbar } from './filter-task'

export const SearchField = ({addValue, setAddValue, filterValue, setFilterValue}) => {
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
        <LookupIcon 
          style={{
            padding: '1px 1px 1px 1px',
            borderRadius: '5px',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            fontSize: '16px',
            outline: 'none',
            width: '100%',
            height: '38px',
            boxSizing: 'border-box',
            marginBottom: '10px',
            display: 'flex',
        }}
          // style={{
          //   position: 'absolute',
          //   fontSize: '16px',
          //   //width: '10%',
          //   //height: '-50%',
          //   color: 'black',
          //   }}
          />
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
            width: '100%', 
            boxSizing: 'border-box',
            marginBottom: '10px',
            display: 'flex',
          }}
          placeholder="Search up a task..."
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
        />
      </div>
        
      <div>
        {addValue && !filterValue && ( 
          <AddTaskbar
            setAddValue={setAddValue}
          />
        )}
      </div>
      <div>
        {filterValue && !addValue && (
          <FilterTaskbar
          setFilterValue={setFilterValue}
          />
        )}
      </div>

      <div
        ref={externalEventsRef}
        style={{
          height: '40vh',
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
