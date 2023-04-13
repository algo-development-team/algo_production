export const PriorityEditor = ({ priority, setPriority }) => {
  return (
    <select value={priority} onChange={(e) => setPriority(e.target.value)}>
      <option value={1}>Low</option>
      <option value={2}>Medium</option>
      <option value={3}>High</option>
    </select>
  )
}
