import featherIcon from 'assets/svg/feather-sprite.svg'
import { useAuth } from 'hooks'
import { setProjectView } from '../../backend/handleProjects'

export const ViewOptions = ({
  closeOverlay,
  xPosition,
  yPosition,
  projectId,
}) => {
  const { currentUser } = useAuth()

  return (
    <div className='option__overlay' onClick={(e) => closeOverlay(e)}>
      <div
        className='menu__list'
        style={{ top: `${yPosition}px`, left: `${xPosition}px` }}
      >
        <ul>
          <li
            role='button'
            className='menu__list--item'
            onClick={() => setProjectView(projectId, true)}
          >
            <div className='menu__list--icon'>
              <svg
                width='18'
                height='18'
                stroke='currentColor'
                fill='none'
                strokeWidth='1px'
              >
                <use href={`${featherIcon}#align-justify`}></use>
              </svg>
            </div>

            <span className='menu__list--content'>List</span>
          </li>
          <li
            role='button'
            className='menu__list--item'
            onClick={() => setProjectView(projectId, false)}
          >
            <div className='menu__list--icon'>
              <svg
                width='18'
                height='18'
                stroke='currentColor'
                fill='none'
                strokeWidth='1px'
              >
                <use href={`${featherIcon}#columns`}></use>
              </svg>
            </div>

            <span className='menu__list--content'>Board</span>
          </li>
          <li role='button' className='menu__list--item'>
            <div className='menu__list--icon'>
              <svg
                width='18'
                height='18'
                stroke='currentColor'
                fill='none'
                strokeWidth='1px'
              >
                <use href={`${featherIcon}#align-justify`}></use>
              </svg>
            </div>

            <span className='menu__list--content'>Timeline</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
