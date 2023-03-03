import { Avatar } from './avatar'
import { Info } from './info'
import { HamburgerButton } from './hamburger'
import { HomeButton } from './home'
import { CalendarButton } from './calendar'
import { ProjectsButton } from './projects'
import './light.scss'
import './main.scss'
import { QuickAddTask } from './quick-add-task'
import { AddChecklist } from './add-checklist'
import { GoogleCalendarButton } from './google-calendar'
import { SettingButton } from './setting'
import { GISAuthButton } from './gis-auth-button'
import { useEffect } from 'react'

export const Header = (props) => {
  return (
    <div className='header'>
      <div className='header__left'>
        <HamburgerButton onClick={props.onClick} />
        <HomeButton />
        <CalendarButton />
        <ProjectsButton />
      </div>
      <div className='header__right'>
        <AddChecklist />
        <QuickAddTask />
        <GISAuthButton />
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
