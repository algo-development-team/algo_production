import axios from 'axios'

export const getUserGoogleCalendarList = async (userId) => {
  try {
    const response = await axios.post(
      'http://localhost:8080/api/google/getValidToken/',
      {
        userId: userId,
      },
    )
    const accessToken = response.data.accessToken

    const request = await fetch(
      `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    const data = await request.json()

    console.log('data:', data) // TESTING

    return data
  } catch (error) {
    console.log(error)
    return null
  }
}
