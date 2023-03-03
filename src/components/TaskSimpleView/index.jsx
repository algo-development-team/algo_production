import { TaskDate } from 'components/task-date'
import { TaskScheduleTime } from 'components/task-timelength'
import { cropLabel } from 'handleLabel'
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg'

export const TaskSimpleView = ({ task, handleClose }) => {
  return (
    <div className='board-task'>
      <div className='task__details'>
        <div className='task__info' style={{ marginBottom: '5px' }}>
          <p style={{ fontSize: '14px' }}>{cropLabel(task.name, 30)}</p>
          <CloseIcon
            style={{ cursor: 'pointer' }}
            width='14px'
            height='14px'
            onClick={() => handleClose()}
          />
        </div>
        <div className='task__info'>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'inline-block', width: '5rem' }}>
              {task.startDate && <TaskDate date={task.startDate} />}{' '}
            </div>
            <div style={{ display: 'inline-block', width: '5rem' }}>
              {task.date && <TaskDate date={task.date} />}{' '}
            </div>
            <div style={{ display: 'inline-block' }}>
              {task.timeLength ? (
                <TaskScheduleTime timeLength={task.timeLength} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
