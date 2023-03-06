import { ReactComponent as LinkIcon } from 'assets/svg/link.svg'

export const MenuButton = ({ type, value, setValue }) => {
  const getMenuButtonIcon = (type) => {
    if (type === 'BLOCKS' || type === 'IS_BLOCKED_BY') {
      return <LinkIcon width={'18px'} height={'18px'} />
    }
  }

  const getMenuButtonText = (type) => {
    if (type === 'BLOCKS') {
      return 'Blocks'
    } else if (type === 'IS_BLOCKED_BY') {
      return 'Is Blocked by'
    }
  }

  const handleBlocks = () => {
    setValue(true)
  }

  const handleIsBlockedBy = () => {
    setValue(true)
  }

  const callMenuButtonHandlerFunction = (type) => {
    if (type === 'BLOCKS') {
      return handleBlocks()
    } else if (type === 'IS_BLOCKED_BY') {
      return handleIsBlockedBy()
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
