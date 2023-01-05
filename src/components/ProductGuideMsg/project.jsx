import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg'

export const Project = () => {
  return (
    <div>
      <h2>Project</h2>
      <h4>
        You can create new projects by clicking <PlusIcon strokeWidth={0.1} />{' '}
        on beside the Projects dropdown at the sidebar.
      </h4>
    </div>
  )
}
