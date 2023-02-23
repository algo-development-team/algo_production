import { ReactComponent as NextWeekIcon } from 'assets/svg/next-week.svg'
import './light.scss'
import './main.scss'

export const SetNewTaskTimeLengthPopper = ({
  isQuickAdd,
  isPopup,
  setShowPopup,
  setTaskTimeLength,
  closeOverlay,
  xPosition,
  yPosition,
  parentPosition,
}) => {
  const setMin = (min) => {
    setTaskTimeLength(min)
    isQuickAdd || isPopup ? setShowPopup(false) : closeOverlay()
  }

  const targetedposition = parentPosition
    ? parentPosition
    : { x: xPosition, y: yPosition }

  return (
    <div
      className='option__overlay'
      onClick={(event) => {
        event.stopPropagation()
        isQuickAdd || isPopup ? setShowPopup(false) : closeOverlay(event)
      }}
    >
      <div
        className='set-schedule__popper'
        onClick={(event) => event.stopPropagation()}
        style={{
          top: `${targetedposition.y + 40}px`,
          left: `${targetedposition.x}px`,
        }}
      >
        <ul>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(0)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>None</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(15)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>15min</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(30)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>30min</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(45)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>45min</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(60)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>1h</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(120)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>2h</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(240)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>4h</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(360)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>6h</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(480)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>8h</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(720)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>12h</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(960)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>16h</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(1200)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>20h</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(1800)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>30h</p>
          </li>
          <li
            className='set-schedule__popper--option'
            onClick={() => setMin(2400)}
          >
            <div className=''>
              <NextWeekIcon fill={'grey'} />
            </div>

            <p className='set-new-task__schedule--name'>40h</p>
          </li>
        </ul>
      </div>
    </div>
  )
}
