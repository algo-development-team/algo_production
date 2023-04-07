import { ReactComponent as AddIcon } from 'assets/svg/addnew.svg'
import { ReactComponent as FilterIcon } from 'assets/svg/filternew.svg'

export const Taskbar = ({ type, onOff, value, setValue }) => {

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