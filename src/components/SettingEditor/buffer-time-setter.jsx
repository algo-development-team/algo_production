export const BufferTimeSetter = ({
  beforeBufferTime,
  setBeforeBufferTime,
  afterBufferTime,
  setAfterBufferTime,
  isBy30Min,
  title,
}) => {
  const getOptions = () => {
    if (isBy30Min) {
      return (
        <>
          <option value={0}>0</option>
          <option value={30}>30</option>
          <option value={60}>60</option>
        </>
      )
    } else {
      return (
        <>
          <option value={0}>0</option>
          <option value={15}>15</option>
          <option value={30}>30</option>
        </>
      )
    }
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h4>Break for {title}</h4>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <div>
          <select
            value={beforeBufferTime}
            className='select-preference text-color__shallow'
            onChange={(e) => {
              setBeforeBufferTime(parseInt(e.target.value))
            }}
            style={{
              fontSize: '14px',
              marginLeft: '5px',
              marginRight: '5px',
            }}
          >
            {getOptions()}
          </select>
        </div>
        <p>min break before and </p>
        <div>
          <select
            value={afterBufferTime}
            className='select-preference text-color__shallow'
            onChange={(e) => {
              setAfterBufferTime(parseInt(e.target.value))
            }}
            style={{
              fontSize: '14px',
              marginLeft: '5px',
              marginRight: '5px',
            }}
          >
            {getOptions()}
          </select>
        </div>
        <p>min break after</p>
      </div>
    </div>
  )
}
