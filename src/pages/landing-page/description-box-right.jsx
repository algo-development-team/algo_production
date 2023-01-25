export default function DescriptionBoxRight({ title, description, imagesrc }) {
  return (
    <div>
      <style
        dangerouslySetInnerHTML={{
          __html:
            '\n  .text {\n  display: grid;\n  padding: 2rem;\n  grid-template-columns: 400px 1fr;\n  gap: 1rem;\n  align-items: center;\n  max-width: 800px;\n  margin: 0 auto;\n  font: 500 100%/1.5 system-ui;\n}\n .imgcontainer {\n  width: 600px;\n  height: 300px;\n  border-radius: 3%;\n}\n    ',
        }}
      />
      <div className='container'>
        <div className='image'>
          <img className='imgcontainer' src={imagesrc} />
        </div>
        <div>
          <div style={{ textAlign: 'center', fontSize: '23px' , font: "500 100%/1.5 system-ui" }}>
           {title}
          </div>
        <div className='text'>
          <p style={{ textAlign: 'center', fontSize: '15px' }}>{description}</p>
        </div>
        </div>
      </div>
      <br></br>
      <br></br>
    </div>
  )
}
