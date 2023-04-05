import { ReactComponent as SettingIcon } from 'assets/svg/setting.svg'
import { useOverlayContextValue } from 'context'

export const SettingButton = () => {
  const { setShowDialog } = useOverlayContextValue()

  return (
    <div
      className='quick-add-task header-clickable'
      onClick={() => {
        setShowDialog('SETTING')
      }}
    >
      <SettingIcon strokeWidth={0.1} width={22} height={22} fill='white' />
    </div>
  )
}
