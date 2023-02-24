import { ReactComponent as LinkIcon } from 'assets/svg/link.svg'

export const MenuButton = ({ type }) => {
  const getMenuButtonIcon = (type) => {
    if (type === 'LINK_TASKS') {
      return <LinkIcon width={'18px'} height={'18px'} />
    }
  }

  const getMenuButtonText = (type) => {
    if (type === 'LINK_TASKS') {
      return 'Link Tasks'
    }
  }

  const handleLinkTasks = () => {}

  const callMenuButtonHandlerFunction = (type) => {
    if (type === 'LINK_TASKS') {
      return handleLinkTasks()
    }
  }

  return (
    <>
      <div
        className='set-new-task__schedule'
        onClick={() => callMenuButtonHandlerFunction(type)}
      >
        {getMenuButtonIcon(type)}

        {getMenuButtonText(type)}
      </div>
    </>
  )
}
