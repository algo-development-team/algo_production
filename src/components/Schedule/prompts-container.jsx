import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { cropLabel } from 'handleLabel'
import { ReactComponent as DeleteIcon } from 'assets/svg/delete.svg'
import { ReactComponent as EditIcon } from 'assets/svg/edit.svg'
import { ReactComponent as AirplaneIcon } from 'assets/svg/airplane.svg'
import { useParams } from 'react-router-dom'
import { useResponsiveSizes } from 'hooks'
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
  const { dayId } = useParams()
  const { sizes } = useResponsiveSizes()

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
    <div className='prompt__container'>
      <div className='prompt__header-container'>
        <div className='prompt__input-container'>
          <input
            className='prompt__input'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handlePromptInput()
              }
            }}
          />
          <div className='prompt__input-submit-btn' onClick={handlePromptInput}>
            <AirplaneIcon fill='white' />
          </div>
        </div>
      </div>
      <div
        className={`prompt__body-container${
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
                          className='board-task-prompt'
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
      <div className='prompt__footer-container'>
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
