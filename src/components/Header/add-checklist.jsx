import { useState } from 'react'
import { useOverlayContextValue } from 'context'
import { checkSignInStatus } from 'gapiHandlers'
import { scheduleToday } from 'scheduler/schedule'
import { useAuth, useScheduleCreated } from 'hooks'
import { updateUserInfo } from '../../handleUserInfo'
import useScreenType from 'react-screentype-hook'

export const AddChecklist = () => {
  const { setShowDialog } = useOverlayContextValue()
  const { currentUser, isClientLoaded } = useAuth()
  const { scheduleCreated } = useScheduleCreated()
  const [isScheduleBeingGenerated, setIsScheduleBeingGenerated] =
    useState(false)
  const screenType = useScreenType()

  const getScheduleButtonText = () => {
    if (isScheduleBeingGenerated) {
      return 'Running'
    } else if (scheduleCreated) {
      return `${!screenType.isMobile ? 'Daily ' : ''}Schedule Created`
    } else {
      return `Create ${!screenType.isMobile ? 'Daily ' : ''}Schedule`
    }
  }

  const handleScheduleToday = async () => {
    const signInStatus = await checkSignInStatus()
    if (signInStatus === 0) {
      console.log('Not Loaded (Google OAuth2 - Google Calendar API Access)')
    } else if (signInStatus === 1) {
      console.log('Signed In (Google OAuth2 - Google Calendar API Access)')
      if (!currentUser) {
        alert('Please try again soon.')
      } else {
        // Calling Scheduler Algorithm for Today
        setIsScheduleBeingGenerated(true)
        await scheduleToday(currentUser.id)
        if (!scheduleCreated) {
          await updateUserInfo(currentUser.id, { scheduleCreated: true })
          setShowDialog('SCHEDULE_CREATED')
        }
        setIsScheduleBeingGenerated(false)
      }
    } else if (signInStatus === 2) {
      console.log('Not Signed In (Google OAuth2 - Google Calendar API Access)')
      setShowDialog('GOOGLE_CALENDAR_AUTH')
    }
  }

  return (
    <div>
      <button
        onClick={() => handleScheduleToday()}
        className='schedule__btn'
        style={{ width: screenType.isMobile ? '140px' : '180px' }}
        disabled={!isClientLoaded || isScheduleBeingGenerated}
      >
        {getScheduleButtonText()}
      </button>
    </div>
  )
}
