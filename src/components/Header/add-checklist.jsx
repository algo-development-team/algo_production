import { useState, useEffect } from 'react'
import { useOverlayContextValue } from 'context'
import { checkSignInStatus } from 'gapiHandlers'
import { scheduleToday } from 'scheduler/schedule-v1'
import { useAuth, useScheduleCreated } from 'hooks'
import { updateUserInfo } from '../../backend/handleUserInfo'
import { useSignInStatusValue } from 'context'
import { scheduleCalendar } from 'scheduler/schedule-v2'
import { useResponsiveSizes } from 'hooks'

export const AddChecklist = () => {
  const { setShowDialog } = useOverlayContextValue()
  const { currentUser, isClientLoaded } = useAuth()
  const { scheduleCreated } = useScheduleCreated()
  const { signInStatus, setSignInStatus } = useSignInStatusValue() // 0: Not Loaded, 1: Signed In, 2: Not Signed In
  const { sizes } = useResponsiveSizes()
  const [isScheduleBeingGenerated, setIsScheduleBeingGenerated] =
    useState(false)
  const [scheduleButtonText, setScheduleButtonText] = useState(
    'Connect to Google Calendar',
  )

  const getScheduleButtonText = () => {
    if (signInStatus === 0) {
      return `${!sizes.smallPhone ? 'Google Calendar ' : ''}Loading`
    } else if (signInStatus === 2) {
      return `${!sizes.smallPhone ? 'Connect to ' : ''}Google Calendar`
    } else if (isScheduleBeingGenerated) {
      return 'Running'
    } else if (scheduleCreated) {
      return `${!sizes.smallPhone ? 'Daily ' : ''}Schedule Created`
    } else {
      return `Create ${!sizes.smallPhone ? 'Daily ' : ''}Schedule`
    }
  }

  useEffect(() => {
    const checkSignInStatusLoad = async () => {
      const newSignInStatus = await checkSignInStatus()
      setSignInStatus(newSignInStatus)
    }
    checkSignInStatusLoad()
  }, [isClientLoaded])

  useEffect(() => {
    setScheduleButtonText(getScheduleButtonText())
  }, [signInStatus, isScheduleBeingGenerated, scheduleCreated, sizes])

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
        await scheduleCalendar(currentUser.id)
        setIsScheduleBeingGenerated(false)
        if (!scheduleCreated) {
          await updateUserInfo(currentUser.id, { scheduleCreated: true })
          setShowDialog('SCHEDULE_CREATED')
        }
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
        disabled={!isClientLoaded || isScheduleBeingGenerated}
      >
        {scheduleButtonText}
      </button>
    </div>
  )
}
