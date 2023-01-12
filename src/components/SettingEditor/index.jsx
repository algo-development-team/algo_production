import { useThemeContextValue } from 'context'
import { collection, getDocs, query, updateDoc } from 'firebase/firestore'
import { useAuth } from 'hooks'
import React, { useEffect, useState } from 'react'
import { db } from '_firebase'
import './styles/main.scss'
import './styles/light.scss'
import { getUserInfo } from '../../handleUserInfo'
import { TimeToggler } from './time-toggler'

const timeRangeType = Object.freeze({
  sleepStart: 0,
  sleepEnd: 1,
  workStart: 2,
  workEnd: 3,
})

export const SettingEditor = ({ closeOverlay }) => {
  const { currentUser } = useAuth()
  const [defaultUserInfo, setDefaultUserInfo] = useState(null)
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
  const [disabled, setDisabled] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const { isLight } = useThemeContextValue()

  useEffect(() => {
    const initializeUserInfo = (userInfo) => {
      const sleepTimesData = userInfo.sleepTimeRange
        .split('-')
        .map((time) => time.split(':'))
        .map((time) => time.map((hourMin) => parseInt(hourMin)))
      const workTimesData = userInfo.workTimeRange
        .split('-')
        .map((time) => time.split(':'))
        .map((time) => time.map((hourMin) => parseInt(hourMin)))
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
    }

    const fetchUserInfo = async () => {
      if (currentUser) {
        const userInfoData = await getUserInfo(currentUser.id)
        const userInfo = userInfoData.userInfoDoc.data()
        setDefaultUserInfo(userInfo)
        initializeUserInfo(userInfo)
        setErrorMsg('')
      } else {
        setErrorMsg('Cannot load user info, please try again later.')
      }
    }

    fetchUserInfo()
  }, [])

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
      rankingPreferences: rankingPreferences,
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
        return 'Early morning'
      case 1:
        return 'Morning'
      case 2:
        return 'Noon'
      case 3:
        return 'Afternoon'
      case 4:
        return 'Late Afternoon'
      case 5:
        return 'Evening'
      default:
        return ''
    }
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
          {errorMsg !== '' && <p className='text-color__error'>*{errorMsg}</p>}
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
            
            {/*JS within HTML */}
            <span style = {{color: 'inherit', paddingLeft: '10px'}}> 
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

          <span style = {{color: 'inherit', paddingLeft: '10px'}}> 
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
            <span style = {{color: 'inherit', paddingLeft: '10px'}}> 
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
            <span style = {{color: 'inherit', paddingLeft: '10px'}}> 
              {workEndTimeHour >= 12 ? 'pm' : 'am'} 
            </span>
          </div>
          <h4>Select Working Days</h4>
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
                  <option value={0}>Urgent, important Work</option>
                  <option value={1}>Deep, focus work</option>
                  <option value={2}>Shallow, easy work</option>
                </select>
              </div>
            ))}
          </div>
          <button
            className=' action add-task__actions--add-task'
            type='submit'
            disabled={defaultUserInfo ? false : disabled}
          >
            {defaultUserInfo ? 'Save' : 'Loading'}
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
