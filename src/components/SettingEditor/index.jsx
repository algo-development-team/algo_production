import { useThemeContextValue } from 'context'
import { useAuth, useUserInfo } from 'hooks'
import React, { useEffect, useState } from 'react'
import './styles/main.scss'
import './styles/light.scss'
import { updateUserInfo } from '../../backend/handleUserInfo'
import { TimeToggler } from './time-toggler'
import { colorIdToHexCode } from 'constants'
import { timeRangeType } from '../../enums'
import { BufferTimeSetter } from './buffer-time-setter'
import { RadioToggle } from './radio-toggle'
import { PreferenceSetter } from './preference-setter'

const startDays = Object.freeze([0, 1, 2, 3, 4, 5, 6])

export const SettingEditor = ({ closeOverlay }) => {
  const { currentUser } = useAuth()
  const { userInfo, loading } = useUserInfo()
  const [calendarIds, setCalendarIds] = useState([])
  const [sleepStartTimeHour, setSleepStartTimeHour] = useState(0)
  const [sleepStartTimeMin, setSleepStartTimeMin] = useState(0)
  const [sleepEndTimeHour, setSleepEndTimeHour] = useState(0)
  const [sleepEndTimeMin, setSleepEndTimeMin] = useState(0)
  const [workStartTimeHour, setWorkStartTimeHour] = useState(0)
  const [workStartTimeMin, setWorkStartTimeMin] = useState(0)
  const [workEndTimeHour, setWorkEndTimeHour] = useState(0)
  const [workEndTimeMin, setWorkEndTimeMin] = useState(0)
  const [workDays, setWorkDays] = useState(new Array(7).fill(false))
  const [startingDay, setStartingDay] = useState(5)
  const { isLight } = useThemeContextValue()
  const [beforeMeetingBufferTime, setBeforeMeetingBufferTime] = useState(0)
  const [afterMeetingBufferTime, setAfterMeetingBufferTime] = useState(0)
  const [beforeWorkBufferTime, setBeforeWorkBufferTime] = useState(30)
  const [afterWorkBufferTime, setAfterWorkBufferTime] = useState(30)
  const [beforeSleepBufferTime, setBeforeSleepBufferTime] = useState(30)
  const [afterSleepBufferTime, setAfterSleepBufferTime] = useState(30)
  const [isWeekly, setIsWeekly] = useState(true)
  const [isGrouping, setIsGrouping] = useState(true)
  const [disableSubmitBtn, setDisableSubmitBtn] = useState(true)
  const [preferences, setPreferences] = useState(new Array(24).fill(0))
  const [personalPreferences, setPersonalPreferences] = useState(
    new Array(24).fill(0),
  )
  const [workHourPreferences, setWorkHourPreferences] = useState([])
  const [personalHourPreferences, setPersonalHourPreferences] = useState([])

  useEffect(() => {
    if (!loading) {
      setDisableSubmitBtn(false)
    }
  }, [loading])

  const validWorkHour = (hour, workStartTimeHour, workEndTimeHour) => {
    if (workStartTimeHour < workEndTimeHour) {
      return hour >= workStartTimeHour && hour < workEndTimeHour
    } else {
      return hour >= workStartTimeHour || hour < workEndTimeHour
    }
  }

  const validSleepHour = (hour, sleepStartTimeHour, sleepEndTimeHour) => {
    if (sleepStartTimeHour < sleepEndTimeHour) {
      return hour >= sleepStartTimeHour && hour < sleepEndTimeHour
    } else {
      return hour >= sleepStartTimeHour || hour < sleepEndTimeHour
    }
  }

  const validPersonalHour = (
    hour,
    sleepStartTimeHour,
    sleepEndTimeHour,
    workStartTimeHour,
    workEndTimeHour,
  ) => {
    return (
      !validWorkHour(hour, workStartTimeHour, workEndTimeHour) &&
      !validSleepHour(hour, sleepStartTimeHour, sleepEndTimeHour)
    )
  }

  /* initializing work hour preferences */
  useEffect(() => {
    const newWorkHourPreferences = []
    for (let i = 0; i < preferences.length; i++) {
      if (validWorkHour(i, workStartTimeHour, workEndTimeHour)) {
        newWorkHourPreferences.push({ preference: preferences[i], hour: i })
      }
    }
    setWorkHourPreferences(newWorkHourPreferences)
  }, [preferences, workStartTimeHour, workEndTimeHour])

  /* initializing personal hour preferences */
  useEffect(() => {
    const newPersonalHourPreferences = []
    for (let i = 0; i < personalPreferences.length; i++) {
      if (
        validPersonalHour(
          i,
          sleepStartTimeHour,
          sleepEndTimeHour,
          workStartTimeHour,
          workEndTimeHour,
        )
      ) {
        newPersonalHourPreferences.push({
          preference: personalPreferences[i],
          hour: i,
        })
      }
    }
    setPersonalHourPreferences(newPersonalHourPreferences)
  }, [
    personalPreferences,
    sleepStartTimeHour,
    sleepEndTimeHour,
    workStartTimeHour,
    workEndTimeHour,
  ])

  /* initializing setting information from userInfo data */
  useEffect(() => {
    if (userInfo) {
      const sleepTimesData = userInfo.sleepTimeRange
        .split('-')
        .map((time) => time.split(':'))
        .map((time) => time.map((hourMin) => parseInt(hourMin)))
      const workTimesData = userInfo.workTimeRange
        .split('-')
        .map((time) => time.split(':'))
        .map((time) => time.map((hourMin) => parseInt(hourMin)))
      setCalendarIds(userInfo.calendarIds)
      setSleepStartTimeHour(sleepTimesData[0][0])
      setSleepStartTimeMin(sleepTimesData[0][1])
      setSleepEndTimeHour(sleepTimesData[1][0])
      setSleepEndTimeMin(sleepTimesData[1][1])
      setWorkStartTimeHour(workTimesData[0][0])
      setWorkStartTimeMin(workTimesData[0][1])
      setWorkEndTimeHour(workTimesData[1][0])
      setWorkEndTimeMin(workTimesData[1][1])
      setWorkDays(userInfo.workDays)
      setPreferences(userInfo.preferences)
      setPersonalPreferences(userInfo.personalPreferences)
      setStartingDay(userInfo.startingDay)
      setIsWeekly(userInfo.isWeekly)
      setIsGrouping(userInfo.isGrouping)
      setBeforeMeetingBufferTime(userInfo.beforeMeetingBufferTime)
      setAfterMeetingBufferTime(userInfo.afterMeetingBufferTime)
      setBeforeWorkBufferTime(userInfo.beforeWorkBufferTime)
      setAfterWorkBufferTime(userInfo.afterWorkBufferTime)
      setBeforeSleepBufferTime(userInfo.beforeSleepBufferTime)
      setAfterSleepBufferTime(userInfo.afterSleepBufferTime)
    }
  }, [userInfo])

  const formatMin = (min) => {
    const minStr = min.toString()
    return minStr.length === 1 ? `0${minStr}` : minStr
  }

  const updateUserInfoInFirestore = async (e) => {
    e.preventDefault()
    // update user info here
    const updatedUserInfo = {
      sleepTimeRange: `${sleepStartTimeHour}:${formatMin(
        sleepStartTimeMin,
      )}-${sleepEndTimeHour}:${formatMin(sleepEndTimeMin)}`,
      workTimeRange: `${workStartTimeHour}:${formatMin(
        workStartTimeMin,
      )}-${workEndTimeHour}:${formatMin(workEndTimeMin)}`,
      workDays: workDays,
      startingDay: startingDay,
      preferences: preferences,
      personalPreferences: personalPreferences,
      isWeekly: isWeekly,
      isGrouping: isGrouping,
      calendarIds: calendarIds,
      beforeMeetingBufferTime: beforeMeetingBufferTime,
      afterMeetingBufferTime: afterMeetingBufferTime,
      beforeWorkBufferTime: beforeWorkBufferTime,
      afterWorkBufferTime: afterWorkBufferTime,
      beforeSleepBufferTime: beforeSleepBufferTime,
      afterSleepBufferTime: afterSleepBufferTime,
    }
    await updateUserInfo(currentUser && currentUser.id, updatedUserInfo)
    // USER INFO UPDATE CODE
    closeOverlay()
  }

  const applyChangeTime = (hour, min, timeRangeTypeVal) => {
    switch (timeRangeTypeVal) {
      case timeRangeType.sleepStart:
        setSleepStartTimeHour(hour)
        setSleepStartTimeMin(min)
        break
      case timeRangeType.sleepEnd:
        setSleepEndTimeHour(hour)
        setSleepEndTimeMin(min)
        break
      case timeRangeType.workStart:
        setWorkStartTimeHour(hour)
        setWorkStartTimeMin(min)
        break
      case timeRangeType.workEnd:
        setWorkEndTimeHour(hour)
        setWorkEndTimeMin(min)
        break
      default:
        break
    }
  }

  const getTimeFromTimeRangeType = (timeRangeTypeVal) => {
    let hour = 0
    let min = 0
    if (timeRangeTypeVal === timeRangeType.sleepStart) {
      hour = sleepStartTimeHour
      min = sleepStartTimeMin
    } else if (timeRangeTypeVal === timeRangeType.sleepEnd) {
      hour = sleepEndTimeHour
      min = sleepEndTimeMin
    } else if (timeRangeTypeVal === timeRangeType.workStart) {
      hour = workStartTimeHour
      min = workStartTimeMin
    } else if (timeRangeTypeVal === timeRangeType.workEnd) {
      hour = workEndTimeHour
      min = workEndTimeMin
    }
    return { hour: hour, min: min }
  }

  const calcChangeTime = (isInc, isHour, timeRangeTypeVal) => {
    let { hour, min } = getTimeFromTimeRangeType(timeRangeTypeVal)
    if (isInc && isHour) {
      hour += 1
    } else if (!isInc && isHour) {
      hour -= 1
    } else if (isInc && !isHour) {
      min += 15
    } else if (!isInc && !isHour) {
      min -= 15
    }

    if (min > 45) {
      hour += 1
      min = 0
    } else if (min < 0) {
      hour -= 1
      min = 45
    }
    if (hour > 23) {
      hour = 0
    } else if (hour < 0) {
      hour = 23
    }
    return { hour: hour, min: min }
  }

  const isBetween = (
    hour,
    min,
    timeRangeTypeValFirst,
    timeRangeTypeValSecond,
    isInclusive,
  ) => {
    let totalMinTest = hour * 60 + min
    const timeFirst = getTimeFromTimeRangeType(timeRangeTypeValFirst)
    let totalMinFirst = timeFirst.hour * 60 + timeFirst.min
    const timeSecond = getTimeFromTimeRangeType(timeRangeTypeValSecond)
    const totalMinSecond = timeSecond.hour * 60 + timeSecond.min

    if (totalMinFirst > totalMinSecond) {
      totalMinFirst -= 1440
    }
    if (totalMinTest > totalMinSecond) {
      totalMinTest -= 1440
    }
    if (isInclusive) {
      return totalMinTest >= totalMinFirst && totalMinTest <= totalMinSecond
    } else {
      return totalMinTest > totalMinFirst && totalMinTest < totalMinSecond
    }
  }

  const validateChangeTime = (hour, min, timeRangeTypeVal) => {
    if (timeRangeTypeVal === timeRangeType.sleepStart) {
      return (
        !isBetween(
          hour,
          min,
          timeRangeType.workStart,
          timeRangeType.workEnd,
          true,
        ) &&
        isBetween(
          hour,
          min,
          timeRangeType.workEnd,
          timeRangeType.sleepEnd,
          false,
        )
      )
    } else if (timeRangeTypeVal === timeRangeType.sleepEnd) {
      return (
        !isBetween(
          hour,
          min,
          timeRangeType.workEnd,
          timeRangeType.sleepStart,
          true,
        ) &&
        isBetween(
          hour,
          min,
          timeRangeType.sleepStart,
          timeRangeType.workStart,
          false,
        )
      )
    } else if (timeRangeTypeVal === timeRangeType.workStart) {
      return (
        !isBetween(
          hour,
          min,
          timeRangeType.sleepStart,
          timeRangeType.sleepEnd,
          true,
        ) &&
        isBetween(
          hour,
          min,
          timeRangeType.sleepEnd,
          timeRangeType.workEnd,
          false,
        )
      )
    } else if (timeRangeTypeVal === timeRangeType.workEnd) {
      return (
        !isBetween(
          hour,
          min,
          timeRangeType.sleepEnd,
          timeRangeType.workStart,
          true,
        ) &&
        isBetween(
          hour,
          min,
          timeRangeType.workStart,
          timeRangeType.sleepStart,
          false,
        )
      )
    }
  }

  const changeTime = (isInc, isHour, timeRangeTypeVal) => {
    const changeInTime = calcChangeTime(isInc, isHour, timeRangeTypeVal)
    const validationResult = validateChangeTime(
      changeInTime.hour,
      changeInTime.min,
      timeRangeTypeVal,
    )
    if (validationResult) {
      applyChangeTime(changeInTime.hour, changeInTime.min, timeRangeTypeVal)
    }
  }

  const getDay = (numDay) => {
    switch (numDay) {
      case 0:
        return 'Sun'
      case 1:
        return 'Mon'
      case 2:
        return 'Tue'
      case 3:
        return 'Wed'
      case 4:
        return 'Thu'
      case 5:
        return 'Fri'
      case 6:
        return 'Sat'
      default:
        return ''
    }
  }

  const uncheckCalendar = (calendarId) => {
    const newCalendarIds = calendarIds.map((calendarIdInfo) => {
      if (calendarIdInfo.id === calendarId) {
        calendarIdInfo.selected = !calendarIdInfo.selected
      }
      return calendarIdInfo
    })
    setCalendarIds(newCalendarIds)
  }

  return (
    <div
      className={'add-task__wrapper quick-add__wrapper'}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <form
        className='add-task'
        onSubmit={(event) => updateUserInfoInFirestore(event)}
        style={{ width: '100%' }}
      >
        <div className={'add-task__actions quick-add__actions'}>
          <div className={'setting__title'}>
            <h1>Settings</h1>
          </div>
          <div className={'setting__section'}>
            <h2>Calendar</h2>
            {calendarIds.map((calendarIdInfo) => (
              <div style={{ marginBottom: '5px' }}>
                <input
                  type='checkbox'
                  id={calendarIdInfo.id}
                  checked={calendarIdInfo.selected}
                  style={{
                    accentColor: colorIdToHexCode[calendarIdInfo.colorId],
                    marginRight: '8px',
                  }}
                  onClick={() => uncheckCalendar(calendarIdInfo.id)}
                />
                <label for='calendarIdInfo.calendarId'>
                  {calendarIdInfo.summary === currentUser?.email
                    ? `${currentUser?.displayName} (Primary)`
                    : calendarIdInfo.summary}
                </label>
              </div>
            ))}
          </div>
          <div className={'setting__section'}>
            <h2>Time</h2>
            <h4>Sleep Hours</h4>
            <div className='display-row'>
              <TimeToggler
                time={sleepStartTimeHour}
                changeTime={changeTime}
                isHour={true}
                timeRangeTypeVal={timeRangeType.sleepStart}
              />
              <TimeToggler
                time={sleepStartTimeMin}
                changeTime={changeTime}
                isHour={false}
                timeRangeTypeVal={timeRangeType.sleepStart}
              />
              <span style={{ color: 'inherit', paddingLeft: '10px' }}>
                {sleepStartTimeHour >= 12 ? 'pm' : 'am'}
              </span>
              <p className='reg-left-margin'>to</p>
              <TimeToggler
                time={sleepEndTimeHour}
                changeTime={changeTime}
                isHour={true}
                timeRangeTypeVal={timeRangeType.sleepEnd}
              />
              <TimeToggler
                time={sleepEndTimeMin}
                changeTime={changeTime}
                isHour={false}
                timeRangeTypeVal={timeRangeType.sleepEnd}
              />

              <span style={{ color: 'inherit', paddingLeft: '10px' }}>
                {sleepEndTimeHour >= 12 ? 'pm' : 'am'}
              </span>
            </div>
            <h4>Work Hours</h4>
            <div className='display-row'>
              <TimeToggler
                time={workStartTimeHour}
                changeTime={changeTime}
                isHour={true}
                timeRangeTypeVal={timeRangeType.workStart}
              />
              <TimeToggler
                time={workStartTimeMin}
                changeTime={changeTime}
                isHour={false}
                timeRangeTypeVal={timeRangeType.workStart}
              />
              <span style={{ color: 'inherit', paddingLeft: '10px' }}>
                {workStartTimeHour >= 12 ? 'pm' : 'am'}
              </span>
              <p className='reg-left-margin'>to</p>
              <TimeToggler
                time={workEndTimeHour}
                changeTime={changeTime}
                isHour={true}
                timeRangeTypeVal={timeRangeType.workEnd}
              />
              <TimeToggler
                time={workEndTimeMin}
                changeTime={changeTime}
                isHour={false}
                timeRangeTypeVal={timeRangeType.workEnd}
              />
              <span style={{ color: 'inherit', paddingLeft: '10px' }}>
                {workEndTimeHour >= 12 ? 'pm' : 'am'}
              </span>
            </div>
            <h4>Select working days:</h4>
            <div>
              {workDays.map((workDay, i) => (
                <button
                  className={`work-day-btn${
                    workDay ? '__selected' : '__not-selected'
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    const newWorkDays = [...workDays]
                    newWorkDays[i] = !newWorkDays[i]
                    setWorkDays(newWorkDays)
                  }}
                >
                  {getDay(i)}
                </button>
              ))}
            </div>
            <RadioToggle
              value={isWeekly}
              setValue={setIsWeekly}
              title='Schedule Calendar By'
              label1='Weekly'
              label2='Daily'
            />
            <h4 style={{ marginTop: '10px' }}>
              Starting date for scheduling next week:
            </h4>
            <div>
              {startDays.map((_, i) => (
                <button
                  className={`work-day-btn${
                    startingDay === i ? '__selected' : '__not-selected'
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    setStartingDay(i)
                  }}
                >
                  {getDay(i)}
                </button>
              ))}
            </div>
          </div>
          <div className={'setting__section'}>
            <h2>Preference</h2>
            <BufferTimeSetter
              beforeBufferTime={beforeMeetingBufferTime}
              setBeforeBufferTime={setBeforeMeetingBufferTime}
              afterBufferTime={afterMeetingBufferTime}
              setAfterBufferTime={setAfterMeetingBufferTime}
              isBy30Min={false}
              title='Each Meeting'
            />
            <BufferTimeSetter
              beforeBufferTime={beforeWorkBufferTime}
              setBeforeBufferTime={setBeforeWorkBufferTime}
              afterBufferTime={afterWorkBufferTime}
              setAfterBufferTime={setAfterWorkBufferTime}
              isBy30Min={true}
              title='Work Hours'
            />
            <BufferTimeSetter
              beforeBufferTime={beforeSleepBufferTime}
              setBeforeBufferTime={setBeforeSleepBufferTime}
              afterBufferTime={afterSleepBufferTime}
              setAfterBufferTime={setAfterSleepBufferTime}
              isBy30Min={true}
              title='Sleep Hours'
            />
            <RadioToggle
              value={isGrouping}
              setValue={setIsGrouping}
              title='Group Tasks By Project In Schedule'
              label1='Group tasks in same project'
              label2='Mix tasks in different projects'
            />
            <PreferenceSetter
              selectedPreferences={workHourPreferences}
              preferences={preferences}
              setPreferences={setPreferences}
              type='work'
              title='During work hours, I prefer...'
            />
            <PreferenceSetter
              selectedPreferences={personalHourPreferences}
              preferences={personalPreferences}
              setPreferences={setPersonalPreferences}
              type='personal'
              title='During personal hours, I prefer...'
            />
          </div>
          <button
            className=' action add-task__actions--add-task'
            type='submit'
            disabled={disableSubmitBtn ? true : false}
          >
            {disableSubmitBtn ? 'Loading' : 'Sav'}
          </button>
          <button
            className={` action  ${
              isLight ? 'action__cancel' : 'action__cancel--dark'
            }`}
            onClick={(event) => closeOverlay()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
