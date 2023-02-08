import featherIcon from 'assets/svg/feather-sprite.svg'
import { useOverlayContextValue } from 'context/overlay-context'

export const AddCustomTeam = ({ showTeams, setShowTeams }) => {
  const { setShowDialog } = useOverlayContextValue()

  return (
    <div
      className='custom-project-group__title-group'
      onClick={() => setShowTeams(!showTeams)}
    >
      <div
        className='custom-project-group__icon'
        style={{ transform: `rotate(${showTeams ? 0 : -90}deg)` }}
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

      <div className='custom-project-group__name'>Teams</div>

      <button
        className='custom-project-group__add-project'
        onClick={(event) => {
          event.stopPropagation()
          setShowDialog('ADD_TEAM')
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
