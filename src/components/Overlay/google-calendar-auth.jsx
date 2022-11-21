import { GoogleLogin, GoogleLogout } from 'react-google-login'
import axios from 'axios'

export const GoogleCalendarAuth = ({ closeOverlay }) => {
  const responseGoogle = (response) => {
    // console.log(response) // contains access token
    // Request to Server-side
    // Not used in current implementation
    // axios
    //   .patch(
    //     `${process.env.REACT_APP_SERVER_URL}/some-endpoint`,
    //     {
    //       code,
    //     },
    //   )
    //   .then((response) => {
    //     console.log(response.data)
    //   })
    //   .catch((error) => {
    //     console.log(error.message)
    //   })
  }

  const responseError = (error) => {
    console.log(error)
  }

  const responseLogout = (response) => {
    console.log(response)
  }

  return (
    <div className='option__overlay' onClick={(event) => closeOverlay(event)}>
      <div
        className='quick-add-task__wrapper'
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '100px',
          paddingBottom: '100px',
        }}
      >
        <GoogleLogin
          clientId={process.env.REACT_APP_CLIENT_ID}
          buttonText='Sign in & Authorize Calendar'
          onSuccess={responseGoogle}
          onFailure={responseError}
          cookiePolicy={'single_host_origin'}
          // This is important
          responseType='code'
          // prompt='consent'
          accessType='offline'
          scope='openid email profile https://www.googleapis.com/auth/calendar'
          style={{ height: '10px', width: '50px' }}
        />
      </div>
    </div>
  )
}

/***
 * Logout Component Code
 * (Google OAuth2 - Google Calendar API Access)
<GoogleLogout
  clientId={process.env.REACT_APP_CLIENT_ID}
  buttonText='Logout'
  onLogoutSuccess={responseLogout}
/>
 * ***/
