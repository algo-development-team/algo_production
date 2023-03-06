import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { cropLabel } from 'handleLabel'
import { ReactComponent as DeleteIcon } from 'assets/svg/delete.svg'
import { ReactComponent as EditIcon } from 'assets/svg/edit.svg'
import { ReactComponent as AirplaneIcon } from 'assets/svg/airplane.svg'
import { useParams } from 'react-router-dom'
import { useResponsiveSizes, useTasks } from 'hooks'
import { useOverlayContextValue } from 'context'
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg'
import './styles/light.scss'
import './styles/main.scss'

export const PromptsContainer = ({
  promptsClosed,
  setPromptsClosed,
  eventsClosed,
}) => {
  const [prompt, setPrompt] = useState('')
  const [prompts, setPrompts] = useState([])
  const [currentPromptIndex, setCurrentPromptIndex] = useState(-1)
  const [promptLength, setPromptLength] = useState(20)
  const [selectedTasks, setSelectedTasks] = useState([])
  const { dayId } = useParams()
  const { sizes } = useResponsiveSizes()
  const { showDialog, setShowDialog, setDialogProps } = useOverlayContextValue()
  const { tasks } = useTasks()

  useEffect(() => {
    if (sizes.smallPhone) {
      setPromptLength(20)
    } else if (sizes.phone) {
      setPromptLength(40)
    } else if (sizes.tabPort) {
      setPromptLength(52)
    } else if (sizes.desktop) {
      setPromptLength(90)
    } else if (sizes.bigDesktop) {
      setPromptLength(120)
    }
  }, [sizes])

  /* connect prompts to Firebase */
  useEffect(() => {
    setPrompt('')
    setPrompts([])
  }, [dayId])

  const handlePromptInput = () => {
    if (prompt.length > 0) {
      if (currentPromptIndex >= 0) {
        const newPrompts = [...prompts]
        newPrompts[currentPromptIndex] = prompt
        setPrompts(newPrompts)
        setCurrentPromptIndex(-1)
      } else {
        setPrompts([...prompts, prompt])
      }
      setPrompt('')
    }
  }

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

    const newPrompts = Array.from(prompts)
    const [removed] = newPrompts.splice(source.index, 1)
    newPrompts.splice(destination.index, 0, removed)
    setPrompts(newPrompts)
  }

  return (
    <div className='prompts__container'>
      <div className='prompts__header-container'>
        {selectedTasks.length > 0 && (
          <div className='set-new-task__linked-tasks'>
            {selectedTasks.map((linkedTask) => {
              return (
                <div className='set-new-task__linked-tasks__bubble-text'>
                  <p style={{ marginRight: '5px' }}>{linkedTask.name}</p>
                  <CloseIcon
                    height='12px'
                    width='12px'
                    onClick={() => {
                      setSelectedTasks(
                        selectedTasks.filter(
                          (task) => task.taskId !== linkedTask.taskId,
                        ),
                      )
                    }}
                  />
                </div>
              )
            })}
          </div>
        )}
        <div className='prompts__input-container'>
          <input
            className='prompts__input'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handlePromptInput()
              }
            }}
            /* LOOK AT THIS SECTION FOR POPUP */
            onSelect={(e) => {
              setDialogProps(
                Object.assign(
                  {
                    elementPosition: e.currentTarget.getBoundingClientRect(),
                  },
                  { tasks },
                  { selectedTasks },
                  { setSelectedTasks },
                ),
              )
              setShowDialog('SET_SELECTED_TASKS')
            }}
          />
          <div
            className='prompts__input-submit-btn'
            onClick={handlePromptInput}
          >
            <AirplaneIcon />
          </div>
        </div>
      </div>
      <div
        className={`prompts__body-container${
          promptsClosed ? '--closed' : eventsClosed ? '--extended' : ''
        }`}
      >
        <div style={{ width: '90%' }}>
          <DragDropContext onDragEnd={(result) => onDragEnd(result)}>
            <Droppable droppableId='prompts'>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {prompts.map((prompt, index) => (
                    <Draggable draggableId={index.toString()} index={index}>
                      {(provided) => (
                        <div
                          className='board-task-schedule'
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                        >
                          <p
                            className='board-task__name'
                            style={{ paddingLeft: '10px' }}
                          >
                            {cropLabel(prompt, promptLength)}
                          </p>
                          <div style={{ display: 'flex', flexGrow: 1 }} />
                          <EditIcon
                            style={{
                              paddingLeft: '3px',
                              paddingRight: '3px',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              setPrompt(prompt)
                              setCurrentPromptIndex(index)
                            }}
                          />
                          <DeleteIcon
                            style={{
                              minWidth: '16px',
                              minHeight: '16px',
                              paddingLeft: '3px',
                              paddingRight: '3px',
                              marginRight: '3px',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              setPrompts(prompts.filter((p) => p !== prompt))
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
      <div className='prompts__footer-container'>
        {!(eventsClosed && !promptsClosed) && (
          <i
            class={`arrow-lg ${promptsClosed ? 'down' : 'up'}`}
            onClick={() => setPromptsClosed(!promptsClosed)}
          />
        )}
      </div>
    </div>
  )
}
