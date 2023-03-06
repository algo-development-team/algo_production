import { ReactComponent as SettingIcon } from 'assets/svg/setting.svg'
import { useOverlayContextValue } from 'context'
import { useAuth } from 'hooks'
import { inputIconSelection } from '../../handleAnalytics'

export const SettingButton = () => {
  const { currentUser } = useAuth()
  
  const { setShowDialog } = useOverlayContextValue()

  return (
    <div
      className='quick-add-task header-clickable'
      onClick={() => {setShowDialog('SETTING') ; inputIconSelection(currentUser && currentUser.id, "SETTING")}}
    >
      <SettingIcon strokeWidth={0.1} width={22} height={22} fill='white' />
    </div>
  )
}
