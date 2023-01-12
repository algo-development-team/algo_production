import { useThemeContextValue } from 'context'
import { ReactComponent as GoogleCalendarIcon } from 'assets/svg/google-calendar.svg'
import React from 'react'
import './styles/main.scss'
import './styles/light.scss'

export const ScheduleCreatedMsg = ({ closeOverlay }) => {
  const { isLight } = useThemeContextValue()

  return (
    <div
      className={'add-task__wrapper quick-add__wrapper'}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <div className={'add-task__actions quick-add__actions'}>
        <h2>Your daily schedule has been created! 📅🚀</h2>
        <h4>
          Please click on the Google Calendar Icon{' '}
          <GoogleCalendarIcon strokeWidth='.1' /> in the Naviation to view your
          schedule.
        </h4>
        <h4>
          If you don't see the schedule immediately, please refresh the Google
          Calendar page.
        </h4>
        <button
          className={` action  ${
            isLight ? 'action__cancel' : 'action__cancel--dark'
          }`}
          onClick={(event) => closeOverlay()}
        >
          Close
        </button>
      </div>
    </div>
  )
}
