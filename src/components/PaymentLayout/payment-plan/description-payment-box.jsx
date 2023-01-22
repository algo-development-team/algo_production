export default function PaymentDescriptionBox({ title, price, price_description, description }) {
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>{title}</h1>
      <br></br>
      <h1 style={{ textAlign: 'center' }}>{price}</h1>
      <h1 style={{ textAlign: 'center', fontSize: '120%' }}>{price_description}</h1>
      <br></br>
      <div className='separator'>
          <div className='middle_separator'>Includes</div>
      </div>
      <p>{description}</p>
      <ul>
        <li style={{ fontSize: '100%' }}>✅ Keep track of your tasks using "Checklist".</li>
        <li style={{ fontSize: '100%' }}>✅ Manage both work and personal tasks using "Projects".</li>
        <li style={{ fontSize: '100%' }}>✅ Organize your task using "Kanban Board".</li>
        <li style={{ fontSize: '100%' }}>✅ Personalize the Schedule Generator using "Setting".</li>
        <li style={{ fontSize: '100%' }}>✅ Add tasks with two clicks using "Quick Task Add".</li>
      </ul>
      <br></br>
      <br></br>
    </div>
  )
}