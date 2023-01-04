import { useEffect } from 'react'
import { Avatar } from './avatar'
import { Info } from './github'
import { HamburgerButton } from './hamburger'
import { HomeButton } from './home'
import './light.scss'
import './main.scss'
import { Notifications } from './notifications'
import { QuickAddTask } from './quick-add-task'
import { AddChecklist } from './add-checklist'
import { GoogleCalendarButton } from './google-calendar'
import { SettingButton } from './setting'

export const Header = (props) => {
  return (
    <div className='header'>
      <div className='header__left'>
        <HamburgerButton onClick={props.onClick} />
        <HomeButton />
      </div>
      <div className='header__right'>
        <AddChecklist />
        <QuickAddTask />
        <GoogleCalendarButton />
        <SettingButton />
        <Info />
        <span style={{ marginLeft: '5px' }}>
          <Avatar />
        </span>
      </div>
    </div>
  )
}
