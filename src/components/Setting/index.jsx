import { useAuth, useAutoScheduleDays } from 'hooks'
import { updateUserInfo } from 'backend/handleUserInfo'
import './styles/main.scss'

export const Setting = () => {
  const { currentUser } = useAuth()
  const { untilNextSunday, setUntilNextSunday, numDays, setNumDays } =
    useAutoScheduleDays()

  const handleUpdateNumDays = async (numDays) => {
    setNumDays(numDays)
    await updateUserInfo(currentUser.id, {
      numDays: numDays,
    })
  }

  const handleUpdateUntilNextSunday = async (untilNextSunday) => {
    setUntilNextSunday(untilNextSunday)
    await updateUserInfo(currentUser.id, {
      untilNextSunday: untilNextSunday,
    })
  }

  if (!currentUser) return null

  return (
    <div className='page__wrapper'>
      <h1>Setting</h1>
      <div style={{ marginTop: '30px' }}>
        <h3>Number of Days to be Auto-Scheduled</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div>
            <input
              type='radio'
              checked={!untilNextSunday}
              onClick={() => handleUpdateUntilNextSunday(false)}
            />
            <label
              htmlFor='custom'
              style={{ marginLeft: '10px', marginRight: '10px' }}
            >
              Custom Number of Days
            </label>
            <input
              style={{
                backgroundColor: 'transparent',
                color: 'inherit',
                border: 0,
                width: '36px',
              }}
              type='number'
              disabled={untilNextSunday}
              value={numDays}
              onChange={(e) => handleUpdateNumDays(parseInt(e.target.value))}
            />
          </div>
          <div>
            <input
              type='radio'
              checked={untilNextSunday}
              onClick={() => handleUpdateUntilNextSunday(true)}
            />
            <label htmlFor='sunday' style={{ marginLeft: '10px' }}>
              Until Next Sunday
            </label>
          </div>
        </div>
        {/* If "Custom Number of Days" is selected, show a number input */}
      </div>
    </div>
  )
}
