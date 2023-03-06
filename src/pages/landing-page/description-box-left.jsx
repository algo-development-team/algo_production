export default function DescriptionBoxLeft({ description, imagesrc }) {
  return (
    <div>
      <style
        dangerouslySetInnerHTML={{
          __html:
            '\n      .container {\n        display: flex;\n        align-items: center;\n        justify-content: center\n      }\n      img {\n        max-width: 100%\n      }\n      .image {\n        flex-basis: 40%\n      }\n      .text {\n        font-size: 20px;\n        padding-left: 20px;\n      }\n    ',
        }}
      />
      <div className='container'>
      <div>
        <div className='text'>
          <p style={{ textAlign: 'center', fontSize: '15px' }}>{description}</p>
        </div>
        </div>
        <div className='image'>
          <img className='imgcontainer' src={imagesrc} />
        </div>
      </div>
      <br></br>
      <br></br>
    </div>
  )
}
