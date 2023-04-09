import { ReactComponent as AddIcon } from 'assets/svg/addnew.svg'
import { ReactComponent as FilterIcon } from 'assets/svg/filternew.svg'


// Taskbar: This is where the Hhndler (On & Off) of the 
//          [Add Task, Fiter Task, AutoSchedule] is located in. 
export const Taskbar = ({ type, onOff, value, setValue }) => {

    // TaskbarIcon: Get the Icons of the tasks action
    const getTaskbarIcon = (type) => {
        if (type === 'ADD_TASKS') {
            return <AddIcon width={'30px'} height={'18px'} />
        } else if (type === 'FILTER_TASKS') {
            return <FilterIcon width={'15px'} height={'38px'}/>
        }
    }

    // getTaskbarText: Get the type of the tasks action to match
    const getTaskbarText = (type) => {
        if (type === 'ADD_TASKS') {
        return 'Add'
        } else if (type === 'FILTER_TASKS') {
        return ''
        } else if (type === 'AUTO_SCHEDULE') {
        return 'Auto Schedule'
        }
    }

    const handleAddTasks = () => {
        setValue(true)
    }

    const handleFilterTasks = (onOff) => {
        setValue(!onOff)
    }

    const autoScheduleTasks = () => {
        setValue(true)
    }

    // callTaskbarHandlerFunction: Handler of the each action tasks
    const callTaskbarHandlerFunction = (type, onOff) => {
        {console.log(onOff)}
        if (type === 'ADD_TASKS') {
        return handleAddTasks(onOff)
        } else if (type === 'FILTER_TASKS') {
        return handleFilterTasks(onOff)
        } else if (type === 'AUTO_SCHEDULE') {
        return autoScheduleTasks(onOff)
        }
    }

    return (
        <>
          <div
            // className='set-Taskbar'
            style={{ display: 'flex',
                           textalign: 'center',
                           whitespace: 'nowrap' }}
            onClick={() => callTaskbarHandlerFunction(type, onOff)}
            > 
                <div style={{color:'white'}}>
                    {getTaskbarIcon(type)}
                </div>
                {getTaskbarText(type)}
            </div>
        </>
      )

}