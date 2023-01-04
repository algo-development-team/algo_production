import { ReactComponent as HelpIcon } from 'assets/svg/help.svg'
import { useOverlayContextValue } from 'context'

export const Info = () => {
  const { setShowDialog } = useOverlayContextValue()

  return (
    <div
      className='quick-add-task header-clickable'
      onClick={() => setShowDialog('PRODUCT_GUIDE')}
    >
      <HelpIcon strokeWidth={0.1} width={30} height={30} fill='white' />
    </div>
  )
}
