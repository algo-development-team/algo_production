export const TagsInput = ({ tags, setTags }) => {
  function handleKeyDown(e) {
    if (e.key !== 'Enter') return
    const value = e.target.value
    if (!value.trim()) return
    setTags([...tags, value])
    e.target.value = ''
  }

  function removeTag(index) {
    setTags(tags.filter((el, i) => i !== index))
  }

  return (
    <div>
      <div className='add-project__form-group'>
        <label>Invite Team Members (Email Addresses)</label>
        <input
          onKeyDown={handleKeyDown}
          type='text'
          className='add-project__project-name'
          placeholder='Enter emails'
        />
      </div>
      <div>
        {tags.map((tag, index) => (
          <div className='tag-item' key={index}>
            <span className='text'>{tag}</span>
            <span className='close' onClick={() => removeTag(index)}>
              &times;
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
