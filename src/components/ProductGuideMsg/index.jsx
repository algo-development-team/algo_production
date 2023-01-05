import { useThemeContextValue } from 'context'
import { useState } from 'react'
import { Intro } from './intro'
import { Navigation } from './navigation'
import { Project } from './project'
import { Task } from './task'
import { GoogleCalendarIntegration } from './google-calendar-integration'
import { Checklist } from './checklist'
import { Setting } from './setting'
import './styles/main.scss'
import './styles/light.scss'

export const ProductGuideMsg = ({ closeOverlay }) => {
  const LAST_PAGE = 6
  const { isLight } = useThemeContextValue()
  const [page, setPage] = useState(0) // 0: first page, 1: second page, ..., LAST_PAGE: last page

  const handleNext = () => {
    setPage(page + 1)
  }

  const getPageComponent = () => {
    switch (page) {
      case 0:
        return <Intro />
      case 1:
        return <Navigation />
      case 2:
        return <Project />
      case 3:
        return <Task />
      case 4:
        return <GoogleCalendarIntegration />
      case 5:
        return <Checklist />
      case 6:
        return <Setting />
      default:
        return <Intro />
    }
  }

  return (
    <div
      className={'add-task__wrapper quick-add__wrapper'}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <div
        className={'add-task__actions quick-add__actions'}
        style={{
          height: '24rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {getPageComponent()}
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {page !== LAST_PAGE && (
            <button
              className=' action add-task__actions--add-task'
              type='button'
              onClick={() => handleNext()}
            >
              Next
            </button>
          )}
          <button
            className={` action  ${
              isLight ? 'action__cancel' : 'action__cancel--dark'
            }`}
            onClick={(event) => closeOverlay()}
          >
            {page === LAST_PAGE ? 'Close' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  )
}
