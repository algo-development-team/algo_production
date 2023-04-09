import { SetNewTaskTimeLength } from './add-task-dropdown'
import { TaskEditor } from '../TaskEditor'
import { quickAddTask } from '../../backend/handleUserTasks'
import { useState, useEffect } from 'react'
import { useAuth } from 'hooks'
import { generatePushId } from '../../utils'


export const AddTaskbar = ({setAddValue}) => {
    const [searchText, setSearchText] = useState('')
    const { currentUser } = useAuth()
    const { taskID } = generatePushId()

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
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            />
            {/* <SetNewTaskTimeLength/> */}
        </div>
            <button
            className='taskbar__actions--add-task'
            onClick={() => {
                setAddValue(false)
            }}
            >

            <quickAddTask
                userId={currentUser}
                taskName={searchText}
                taskId={taskID}
                taskDescription=''
                taskTimeLength=''
                projectId=''
            />

                
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