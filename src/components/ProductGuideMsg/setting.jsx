import { ReactComponent as SettingIcon } from 'assets/svg/setting.svg'
import { useAuth } from 'hooks'

const Avatar = () => {
  const { currentUser } = useAuth()
  const userDisplayName = currentUser?.displayName?.replace(' ', '+')

  return (
    <span className='avatar'>
      <img
        className='avatar__img'
        src={`https://ui-avatars.com/api/?name=${userDisplayName}&rounded=true&size=24&background=ffffff`}
        alt='displayName'
      />
    </span>
  )
}

export const Setting = () => {
  return (
    <div>
      <h2>Setting</h2>
      <h4>
        You can click on{' '}
        <SettingIcon strokeWidth={0.1} width={22} height={22} fill='white' /> to
        view and modify your preferences.
      </h4>
      <h4>
        You can click on <Avatar /> to switch between dark mode and light mode
        or log out.
      </h4>
      <h4>This is the end of the guide, please enjoy using Algo!</h4>
    </div>
  )
}
