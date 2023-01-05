import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg'
import featherIcon from 'assets/svg/feather-sprite.svg'

export const AddProject = () => {
  return (
    <div
      className='custom-project-group__title-group'
      style={{ width: '10rem' }}
    >
      <div className='custom-project-group__icon'>
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

export const Project = () => {
  return (
    <div>
      <h2>Project</h2>
      <h4>You can create new projects by clicking</h4>
      <AddProject />
      <h4>at the sidebar.</h4>
    </div>
  )
}
