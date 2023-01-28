import { useThemeContextValue } from 'context'
import { collection, getDocs, query, updateDoc } from 'firebase/firestore'
import { useAuth, useUserInfo } from 'hooks'
import React, { useEffect, useState } from 'react'
import { db } from '_firebase'
import './styles/main.scss'
import './styles/light.scss'
import { TimeToggler } from './time-toggler'
import { colorIdToHexCode } from 'constants'

const timeRangeType = Object.freeze({
  sleepStart: 0,
  sleepEnd: 1,
  workStart: 2,
  workEnd: 3,
})

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
  const [rankingPreferences, setRankingPreferences] = useState(
    new Array(6).fill(0),
  )
  const [startingDay, setStartingDay] = useState(5)
  const { isLight } = useThemeContextValue()
  const [optionBeforeState, setOptionBeforeState] = useState(false)
  const [optionAfterState, setOptionAfterState] = useState(false)
  const [isWeekly, setIsWeekly] = useState(true)
  const [isGrouping, setIsGrouping] = useState(true)
  const [disableSubmitBtn, setDisableSubmitBtn] = useState(true)

  useEffect(() => {
    if (!loading) {
      setDisableSubmitBtn(false)
    }
  }, [loading])

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
      setRankingPreferences(userInfo.rankingPreferences)
      setStartingDay(userInfo.startingDay)
      setIsWeekly(userInfo.isWeekly)
      setIsGrouping(userInfo.isGrouping)
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
      rankingPreferences: rankingPreferences,
      isWeekly: isWeekly,
      isGrouping: isGrouping,
      calendarIds: calendarIds,
    }
    try {
      const userInfoQuery = await query(
        collection(db, 'user', `${currentUser && currentUser.id}/userInfo`),
      )
      const userInfoDocs = await getDocs(userInfoQuery)
      userInfoDocs.forEach(async (userInfoDoc) => {
        await updateDoc(userInfoDoc.ref, updatedUserInfo)
      })
    } catch (error) {
      console.log(error)
    }
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

  const getTimePeriod = (numPeriod) => {
    switch (numPeriod) {
      case 0:
        return '5-7 am'
      case 1:
        return '8-10 am'
      case 2:
        return '11 am-1 pm'
      case 3:
        return '2-4 pm'
      case 4:
        return '5-7 pm'
      case 5:
        return '8-10 pm'
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
          <h2>Calendar Setting</h2>
          {calendarIds.map((calendarIdInfo) => (
            <div style={{ marginBottom: '5px' }}>
              <input
                type='checkbox'
                id={calendarIdInfo.id}
                checked={calendarIdInfo.selected}
                style={{
                  accentColor: colorIdToHexCode[calendarIdInfo.colorId],
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
          <h2>Time Setting</h2>
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
            <h3 className='reg-left-margin'>to</h3>
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
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
            <h3 className='reg-left-margin'>to</h3>
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
          <h4>Schedule calendar by:</h4>
          <input
            type='radio'
            id='weekly'
            checked={isWeekly}
            onClick={() => setIsWeekly(true)}
          />
          <label for='weekly'>Weekly</label>
          <input
            type='radio'
            id='daily'
            checked={!isWeekly}
            onClick={() => setIsWeekly(false)}
          />
          <label for='daily'>Daily</label>
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
          <h2>Preference Setting</h2>
          <h4>During these time periods, I prefer...</h4>
          <div style={{ marginBottom: '40px' }}>
            {rankingPreferences.map((rankingPreference, i) => (
              <div className='display-row time-period__row'>
                <p className='time-period__label'>{getTimePeriod(i)}</p>
                <select
                  value={rankingPreference}
                  className={`select-preference text-color${
                    rankingPreference === 0
                      ? '__urgent'
                      : rankingPreference === 1
                      ? '__deep'
                      : '__shallow'
                  }`}
                  onChange={(e) => {
                    const newRankingPreferences = [...rankingPreferences]
                    newRankingPreferences[i] = parseInt(e.target.value)
                    setRankingPreferences(newRankingPreferences)
                  }}
                >
                  <option value={0}>Urgent Work (ex: Work Due Today)</option>
                  <option value={1}>Focus Work (ex: Coding)</option>
                  <option value={2}>Easy Work (ex: Check Emails)</option>
                </select>
              </div>
            ))}
            <h4>Grouping Tasks:</h4>
            <input
              type='radio'
              id='grouping'
              checked={isGrouping}
              onClick={() => setIsGrouping(true)}
            />
            <label for='grouping'>Group similar tasks</label>
            <input
              type='radio'
              id='mixing'
              checked={!isGrouping}
              onClick={() => setIsGrouping(false)}
            />
            <label for='mixing'>Mix different tasks</label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <h4>Put</h4>
              <div>
                <select
                  value={optionBeforeState}
                  className='select-preference text-color__shallow'
                  onChange={(e) => {
                    setOptionBeforeState(e.target.value)
                  }}
                  style={{
                    fontSize: '14px',
                    marginLeft: '5px',
                    marginRight: '5px',
                  }}
                >
                  <option value={0}>0</option>
                  <option value={1}>15</option>
                  <option value={2}>30</option>
                </select>
              </div>
              <h4>min break before each meeting.</h4>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <h4>Put</h4>
              <div>
                <select
                  value={optionAfterState}
                  className='select-preference text-color__shallow'
                  onChange={(e) => {
                    setOptionAfterState(e.target.value)
                  }}
                  style={{
                    fontSize: '14px',
                    marginLeft: '5px',
                    marginRight: '5px',
                  }}
                >
                  <option value={0}>0</option>
                  <option value={1}>15</option>
                  <option value={2}>30</option>
                </select>
              </div>
              <h4>min break after each meeting.</h4>
            </div>
          </div>
          <button
            className=' action add-task__actions--add-task'
            type='submit'
            disabled={disableSubmitBtn ? true : false}
          >
            {disableSubmitBtn ? 'Loading' : 'Save'}
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
