import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { cropLabel } from 'handleLabel'
import { ReactComponent as DeleteIcon } from 'assets/svg/delete.svg'
import { ReactComponent as RefreshIcon } from 'assets/svg/refresh.svg'
import { EventTimeDisplay } from './event-time-display'
import moment from 'moment'

const defaultEvents = [
  {
    isDefault: false,
    isWork: true,
    type: 'Work',
    options: [
      { id: 'T-1', value: 'Make Presentation' },
      { id: 'T-2', value: 'Work Report' },
      { id: 'T-3', value: 'Email Customers' },
    ],
    selectedOptionId: 'T-1',
    startTime: moment('2023-02-22 09:00:00'),
    endTime: moment('2023-02-22 11:00:00'),
  },
  {
    isDefault: false,
    isWork: true,
    type: 'Work',
    options: [
      { id: 'T-1', value: 'Make Presentation' },
      { id: 'T-2', value: 'Work Report' },
      { id: 'T-3', value: 'Email Customers' },
    ],
    selectedOptionId: 'T-2',
    startTime: moment('2023-02-22 11:00:00'),
    endTime: moment('2023-02-22 13:00:00'),
  },
  {
    isDefault: false,
    isWork: true,
    type: 'Work',
    options: [
      { id: 'T-1', value: 'Make Presentation' },
      { id: 'T-2', value: 'Work Report' },
      { id: 'T-3', value: 'Email Customers' },
    ],
    selectedOptionId: 'T-3',
    startTime: moment('2023-02-22 13:00:00'),
    endTime: moment('2023-02-22 15:00:00'),
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
            <Droppable droppableId='events'>
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
                          <p
                            className='board-task__name'
                            style={{
                              paddingLeft: '10px',
                            }}
                          >
                            {cropLabel(event.type, 30)}
                          </p>
                          <div style={{ display: 'flex', flexGrow: 1 }} />
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <div
                              style={{
                                display: 'inline-block',
                                marginLeft: '10px',
                              }}
                            >
                              <EventTimeDisplay
                                isStart={true}
                                time={event.startTime}
                                setEvents={setEvents}
                                eventIndex={index}
                              />
                            </div>
                            <div
                              style={{
                                display: 'inline-block',
                              }}
                            >
                              <EventTimeDisplay
                                isStart={false}
                                time={event.endTime}
                                setEvents={setEvents}
                                eventIndex={index}
                              />
                            </div>
                            <div
                              style={{
                                display: 'inline-block',
                                marginLeft: '10px',
                                marginRight: '10px',
                              }}
                            >
                              <select
                                value={event.selectedOptionId}
                                className={'select-preference text-color__none'}
                                onChange={(e) => {
                                  const newEvents = [...events]
                                  newEvents[index].selectedOptionId =
                                    e.target.value
                                  setEvents(newEvents)
                                }}
                              >
                                {event.options.map((option) => (
                                  <option
                                    value={option.id}
                                    style={{ color: '#222222' }}
                                  >
                                    {option.value}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexGrow: 1 }} />
                          <RefreshIcon
                            style={{
                              paddingLeft: '3px',
                              paddingRight: '3px',
                              cursor: 'pointer',
                            }}
                          />
                          <DeleteIcon
                            style={{
                              paddingLeft: '3px',
                              paddingRight: '3px',
                              marginRight: '3px',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              const newEvents = [...events]
                              newEvents.splice(index, 1)
                              setEvents(newEvents)
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
