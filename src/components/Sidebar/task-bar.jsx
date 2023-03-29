import { ReactComponent as AddIcon } from 'assets/svg/addnew.svg'
import { ReactComponent as FilterIcon } from 'assets/svg/filternew.svg'

export const Taskbar = ({ type, value, setValue }) => {

    const getTaskbarIcon = (type) => {
        if (type === 'ADD_TASKS') {
            return <AddIcon width={'30px'} height={'18px'} />
        } else if (type === 'FILTER_TASKS') {
            return <FilterIcon width={'30px'} height={'18px'}/>
        }
    }

    const getTaskbarText = (type) => {
        if (type === 'ADD_TASKS') {
        return 'Add'
        } else if (type === 'FILTER_TASKS') {
        return 'Filter'
        } else if (type === 'AUTO_SCHEDULE') {
        return 'Auto Schedule'
        }
    }

    const handleAddTasks = () => {
        setValue(true)
    }

    const handleFilterTasks = () => {
        setValue(true)
    }

    const autoScheduleTasks = () => {
        setValue(true)
    }

    const callTaskbarHandlerFunction = (type) => {
        if (type === 'ADD_TASKS') {
        return handleAddTasks()
        } else if (type === 'FILTER_TASKS') {
        return handleFilterTasks()
        } else if (type === 'AUTO_SCHEDULE') {
        return autoScheduleTasks()
        }
    }

    return (
        <>
          <div
            className='set-Taskbar'
            onClick={() => callTaskbarHandlerFunction(type)}
            >
                <div style={{color:'white'}}>
                    {getTaskbarIcon(type)}
                </div>
                {getTaskbarText(type)}
            </div>
        </>
      )

}