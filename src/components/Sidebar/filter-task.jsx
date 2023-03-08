import { SetNewTaskTimeLength } from './filter-task-dropdown'
import { SetNewTaskTimeLength2 } from './filter-value-task-dropdown'

export const FilterTaskbar = ({setFilterValue}) => {
    return (
        <>
        <div style = {{display:'inline-flex'}}>
            <label
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
            />
        </div>
        <div style = {{display:'inline-flex', width: '100%',}}>
            <label
            style={{
                padding: '5px 10px 5px 10px',
                borderRadius: '5px',
                border: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                fontSize: '16px',
                outline: 'none',
                width: '35%',
                //height: '30px',
                //lineHeight:'6em',
                boxSizing: 'border-box',
                marginBottom: '10px',
                display: 'inline-flex',
            }}
            >Filter By</label>
            <SetNewTaskTimeLength/>
        </div>
        <div style = {{display:'inline-flex', width: '100%', }}>
            <label
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
                marginBottom: '15px',
                display: 'inline-flex',
            }}
            >Value</label>
            <SetNewTaskTimeLength2/>
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