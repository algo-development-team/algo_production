import { Avatar } from './avatar'
import { HamburgerButton } from './hamburger'
import { HomeButton } from './home'
import { CalendarButton } from './calendar'
import { ProjectsButton } from './projects'
import { SettingButton } from './setting'
import './light.scss'
import './main.scss'
import { GoogleAuthButton } from './google-auth-button'
import { CalendarOrProjectsButton } from './calendar-or-projects'
import { useResponsiveSizes } from 'hooks'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export const Header = (props) => {
  const { sizes } = useResponsiveSizes()
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const params = useParams()

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className='header'>
      <div className='header__left'>
        {!(params?.defaultGroup === 'Calendar' && windowWidth >= 900) && (
          <HamburgerButton onClick={props.onClick} />
        )}
        <HomeButton />
        {!sizes.phone ? (
          <>
            <CalendarButton />
            <ProjectsButton />
            {/* <SettingButton /> */}
          </>
        ) : (
          <CalendarOrProjectsButton />
        )}
      </div>
      <div className='header__right'>
        <GoogleAuthButton />
        <Avatar />
      </div>
    </div>
  )
}
