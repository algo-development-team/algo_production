import { SetNewTaskTimeLength } from './add-task-dropdown'

export const AddTaskbar = ({setAddValue}) => {
    return (
        <>
        <div style = {{display:'inline-flex'}}>
            <input
            type='text'
            style={{
                padding: '10px 10px 10px 10px',
                borderRadius: '5px',
                border: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                fontSize: '16px',
                outline: 'none',
                width: '80%',
                boxSizing: 'border-box',
                marginBottom: '10px',
                display: 'inline-flex',
            }}
            placeholder="Add task..."
            />
            <SetNewTaskTimeLength/>
        </div>
            <button
            className='taskbar__actions--add-task'
            onClick={() => {
                setAddValue(false)
            }}
            >
            Add
            </button>
            <button
            className='taskbar__actions--cancel'
            onClick={() => {
                setAddValue(false)
            }}
            >
            Cancel
            </button>
        </>
        )

}