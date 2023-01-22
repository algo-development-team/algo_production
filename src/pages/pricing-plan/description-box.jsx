export default function DescriptionBox({ title, description }) {
  return (
    <div>
      <h1 style={{ textAlign: 'center', fontSize: '250%' }}>{title}</h1>
      <br></br>
      <br></br>
      <div className='container'>
        <div className='text'>
          <p style={{ textAlign: 'center', fontSize: '120%' }}>{description}</p>
        </div>
      </div>
      <br></br>
      <br></br>
    </div>
  )
}