import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { cropLabel } from 'handleLabel'
import { ReactComponent as DeleteIcon } from 'assets/svg/delete.svg'
import { ReactComponent as EditIcon } from 'assets/svg/edit.svg'
import { useParams } from 'react-router-dom'
import { useResponsiveSizes } from 'hooks'

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
      setPromptLength(24)
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
    <div style={{ marginTop: '1rem' }}>
      <div
        style={{
          backgroundColor: '#282828',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '90%',
            marginTop: '10px',
            marginBottom: '10px',
            display: 'flex',
          }}
        >
          <input
            style={{
              fontSize: '16px',
              display: 'flex',
              flexGrow: 1,
              height: '24px',
              border: 'none',
              padding: '10px',
              paddingLeft: '10px',
              fontWeight: 400,
              backgroundColor: '#222222',
              color: 'inherit',
              borderTopLeftRadius: '5px',
              borderBottomLeftRadius: '5px',
              outline: 'none',
            }}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handlePromptInput()
              }
            }}
          />
          <div
            style={{
              fontSize: '16px',
              height: '44px',
              border: 'none',
              fontWeight: 400,
              backgroundColor: '#222222',
              color: 'inherit',
              borderRadius: 0,
              borderTopRightRadius: '5px',
              borderBottomRightRadius: '5px',
              outline: 'none',
            }}
          >
            {/* overlap the elements on top of each other */}
            <div
              style={{
                display: 'block',
                position: 'relative',
                marginRight: '24px',
                marginTop: '14px',
                paddingRight: '10px',
                cursor: 'pointer',
              }}
              onClick={() => handlePromptInput()}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '24px solid #444444',
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  position: 'absolute',
                }}
              ></div>
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '12px solid #222222',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent',
                  position: 'absolute',
                  marginTop: '4px',
                  zIndex: 1,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          backgroundColor: '#282828',
          height: promptsClosed ? 0 : eventsClosed ? '60vh' : '27vh',
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
                  {prompts.map((prompt, index) => (
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
                              {cropLabel(prompt, promptLength)}
                            </p>
                          </div>
                          <EditIcon
                            style={{ marginRight: '5px' }}
                            onClick={() => {
                              setPrompt(prompt)
                              setCurrentPromptIndex(index)
                            }}
                          />
                          <DeleteIcon
                            style={{ marginRight: '5px' }}
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
      <div
        style={{
          backgroundColor: '#282828',
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
          height: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '5px',
        }}
      >
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
