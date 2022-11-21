import { ReactComponent as PlusIcon } from 'assets/svg/setting.svg'
import { useOverlayContextValue } from 'context'
export const SettingButton = () => {
  const { setShowDialog } = useOverlayContextValue()

  return (
    <div
      className='quick-add-task header-clickable'
      onClick={() => setShowDialog('SETTING')}
    >
      <PlusIcon strokeWidth={0.1} width={22} height={22} fill='white' />
    </div>
  )
}
