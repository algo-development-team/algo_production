export const RadioToggle = ({ value, setValue, title, label1, label2 }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h4>{title}</h4>
      <span style={{ marginRight: '1rem' }}>
        <input
          style={{ marginRight: '5px' }}
          type='radio'
          id='label1'
          checked={value}
          onClick={() => setValue(true)}
        />
        <label for='label1'>{label1}</label>
      </span>
      <span>
        <input
          style={{ marginRight: '5px' }}
          type='radio'
          id='label2'
          checked={!value}
          onClick={() => setValue(false)}
        />
        <label for='label2'>{label2}</label>
      </span>
    </div>
  )
}
