import featherIcon from 'assets/svg/feather-sprite.svg'
import { useOverlayContextValue } from 'context/overlay-context'

export const AddCustomProject = ({ showProjects, setShowProjects }) => {
  const { setShowDialog } = useOverlayContextValue()

  return (
    <div
      className='custom-project-group__title-group'
      onClick={() => setShowProjects(!showProjects)}
    >
      <div
        className='custom-project-group__icon'
        style={{ transform: `rotate(${showProjects ? 0 : -90}deg)` }}
      >
        <svg
          width='24'
          height='24'
          fill='none'
          stroke='#777777'
          strokeWidth='1px'
        >
          <use href={`${featherIcon}#chevron-down`}></use>
        </svg>
      </div>

      <div className='custom-project-group__name'>Projects</div>

      <button
        className='custom-project-group__add-project'
        onClick={(event) => {
          event.stopPropagation()
          setShowDialog('ADD_PROJECT')
        }}
      >
        <svg
          width='21'
          height='21'
          fill='none'
          stroke='currentColor'
          strokeWidth='1'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <use xlinkHref={`${featherIcon}#plus`}></use>
        </svg>
      </button>
    </div>
  )
}
