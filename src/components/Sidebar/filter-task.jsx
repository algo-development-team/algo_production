import { SetNewFilterTask } from './filter-task-dropdown'
import { SetNewFilterValueTask } from './filter-value-task-dropdown'
import { DueDateFilter } from './filter-value-task-dropdown-DueDate'
import { ProjectFilter } from './filter-value-task-dropdown-Project'
import { PriorityFilter } from './filter-value-task-dropdown-Priority'
import { useState } from 'react' 

export const FilterTaskbar = ({filter, setFilter, filterSelect, setFilterSelect, setFilterValue}) => {
    

    const getButtonByFilter = () => {
        if (filter === 'Due Date') {
            return <DueDateFilter isQuickAdd={false} isPoppup={false} filterSelect={filterSelect} setFilterSelect={setFilterSelect} />

        } else if (filter === 'Projects') {
            return <ProjectFilter isQuickAdd={false} isPoppup={false} filterSelect={filterSelect} setFilterSelect={setFilterSelect} />

        } else if (filter === 'Priority') {
            return <PriorityFilter isQuickAdd={false} isPoppup={false} filterSelect={filterSelect} setFilterSelect={setFilterSelect}/>
        }
    }

    return (
        <>
        <div style = {{display:'inline-flex'}}>
            {/* <label
            //className="labels"
            style={{
                padding: '5px 10px 5px 10px',
                borderRadius: '5px',
                border: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                fontSize: '16px',
                outline: 'none',
                width: '35%',
                //height: '30px',
                boxSizing: 'border-box',
                marginBottom: '10px',
                verticalAlign: 'center',
            }}
            >Projects</label>
            <input
            type='text'
            style={{
                padding: '5px 10px 5px 10px',
                borderRadius: '5px',
                border: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                fontSize: '16px',
                outline: 'none',
                width: '65%',
                //height: '30px',
                boxSizing: 'border-box',
                marginBottom: '10px',
            }}
            /> */}
        </div>
        <div style = {{display:'inline-flex', width: '100%',}}>
            <label
            className={'set-filterbar'}
            style={{
                //width: '30%',
                width: '60px',
            }}
            // style={{
            //     padding: '5px 10px 5px 10px',
            //     borderRadius: '5px',
            //     border: 'none',
            //     boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            //     fontSize: '16px',
            //     outline: 'none',
            //     width: '35%',
            //     //height: '30px',
            //     //lineHeight:'6em',
            //     boxSizing: 'border-box',
            //     marginBottom: '10px',
            //     display: 'inline-flex',
            // }}
            >Filter</label>
            <SetNewFilterTask isQuickAdd={false} isPoppup={false} filter={filter} setFilter={setFilter} />
        </div>
        <div style = {{display:'inline-flex', width: '100%', }}>
            <label
            className={'set-filterbar'}
            style={{
               //width: '30%',
               width: '60px',
            }}
            // style={{
            //     padding: '5px 10px 5px 10px',
            //     borderRadius: '5px',
            //     border: 'none',
            //     boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            //     fontSize: '16px',
            //     outline: 'none',
            //     width: '35%',
            //     //height: '30px',
            //     boxSizing: 'border-box',
            //     marginBottom: '15px',
            //     display: 'inline-flex',
            // }}
            >Value</label>

            {getButtonByFilter()}
        
        </div>
            <button
            className='taskbar__actions--cancel'
            style={{
                display: 'block',
            }}
            onClick={() => {
                setFilterValue(false)
            }}
            >
            Close
            </button>
        </>
        )

}