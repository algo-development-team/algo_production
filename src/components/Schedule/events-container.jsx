import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { cropLabel } from 'handleLabel'
import { ReactComponent as DeleteIcon } from 'assets/svg/delete.svg'

const defaultEvents = [
  {
    isDefault: false,
    isWork: true,
    type: 'Make Presentation',
    what: 'Make Presentation',
    options: ['Make Presentation', 'Work Report', 'Email Customers'],
    startTimeHour: 9,
    startTimeMin: 0,
    endTimeHour: 11,
    endTimeMin: 0,
  },
  {
    isDefault: false,
    isWork: true,
    type: 'Make Presentation',
    what: 'Make Presentation',
    options: ['Make Presentation', 'Work Report', 'Email Customers'],
    startTimeHour: 9,
    startTimeMin: 0,
    endTimeHour: 11,
    endTimeMin: 0,
  },
  {
    isDefault: false,
    isWork: true,
    type: 'Make Presentation',
    what: 'Make Presentation',
    options: ['Make Presentation', 'Work Report', 'Email Customers'],
    startTimeHour: 9,
    startTimeMin: 0,
    endTimeHour: 11,
    endTimeMin: 0,
  },
  {
    isDefault: false,
    isWork: true,
    type: 'Make Presentation',
    what: 'Make Presentation',
    options: ['Make Presentation', 'Work Report', 'Email Customers'],
    startTimeHour: 9,
    startTimeMin: 0,
    endTimeHour: 11,
    endTimeMin: 0,
  },
  {
    isDefault: false,
    isWork: true,
    type: 'Make Presentation',
    what: 'Make Presentation',
    options: ['Make Presentation', 'Work Report', 'Email Customers'],
    startTimeHour: 9,
    startTimeMin: 0,
    endTimeHour: 11,
    endTimeMin: 0,
  },
  {
    isDefault: false,
    isWork: true,
    type: 'Make Presentation',
    what: 'Make Presentation',
    options: ['Make Presentation', 'Work Report', 'Email Customers'],
    startTimeHour: 9,
    startTimeMin: 0,
    endTimeHour: 11,
    endTimeMin: 0,
  },
  {
    isDefault: false,
    isWork: true,
    type: 'Make Presentation',
    what: 'Make Presentation',
    options: ['Make Presentation', 'Work Report', 'Email Customers'],
    startTimeHour: 9,
    startTimeMin: 0,
    endTimeHour: 11,
    endTimeMin: 0,
  },
  {
    isDefault: false,
    isWork: true,
    type: 'Make Presentation',
    what: 'Make Presentation',
    options: ['Make Presentation', 'Work Report', 'Email Customers'],
    startTimeHour: 9,
    startTimeMin: 0,
    endTimeHour: 11,
    endTimeMin: 0,
  },
  {
    isDefault: false,
    isWork: true,
    type: 'Make Presentation',
    what: 'Make Presentation',
    options: ['Make Presentation', 'Work Report', 'Email Customers'],
    startTimeHour: 9,
    startTimeMin: 0,
    endTimeHour: 11,
    endTimeMin: 0,
  },
  {
    isDefault: false,
    isWork: true,
    type: 'Make Presentation',
    what: 'Make Presentation',
    options: ['Make Presentation', 'Work Report', 'Email Customers'],
    startTimeHour: 9,
    startTimeMin: 0,
    endTimeHour: 11,
    endTimeMin: 0,
  },
]

export const EventsContainer = ({
  eventsClosed,
  setEventsClosed,
  promptsClosed,
}) => {
  const [events, setEvents] = useState([])

  /* connect events to Firebase */
  useEffect(() => {
    setEvents(defaultEvents)
  }, [])

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    if (!destination) {
      return
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newEvents = Array.from(events)
    const [removed] = newEvents.splice(source.index, 1)
    newEvents.splice(destination.index, 0, removed)
    setEvents(newEvents)
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <div
        style={{
          backgroundColor: '#282828',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          borderBottomLeftRadius: eventsClosed ? '10px' : 0,
          borderBottomRightRadius: eventsClosed ? '10px' : 0,
          height: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: '5px',
        }}
      >
        {!(promptsClosed && !eventsClosed) && (
          <i
            class={`arrow-lg ${eventsClosed ? 'up' : 'down'}`}
            onClick={() => setEventsClosed(!eventsClosed)}
          />
        )}
      </div>
      <div
        style={{
          backgroundColor: '#282828',
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
          height: eventsClosed ? 0 : promptsClosed ? '60vh' : '33vh',
          overflowX: 'scroll',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '90%' }}>
          <DragDropContext onDragEnd={(result) => onDragEnd(result)}>
            <Droppable droppableId='prompts'>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {events.map((event, index) => (
                    <Draggable draggableId={index.toString()} index={index}>
                      {(provided) => (
                        <div
                          className='board-task-prompt'
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                        >
                          <div
                            className='task__details'
                            style={{ paddingLeft: '10px' }}
                          >
                            <p className='board-task__name'>
                              {cropLabel(event.type, 30)}
                            </p>
                          </div>
                          <DeleteIcon
                            style={{ marginRight: '5px' }}
                            onClick={() => {
                              setEvents(events.filter((e) => e !== prompt))
                            }}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  )
}
