import { Avatar } from './avatar'
import { Info } from './info'
import { HamburgerButton } from './hamburger'
import { HomeButton } from './home'
import { CalendarButton } from './calendar'
import { ProjectsButton } from './projects'
import './light.scss'
import './main.scss'
import { GoogleAuthButton } from './google-auth-button'

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
        <GoogleAuthButton />
        {/* update the content of info later */}
        {/* <Info />  */}
        <Avatar />
      </div>
    </div>
  )
}
