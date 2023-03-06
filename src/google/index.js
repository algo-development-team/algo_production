import axios from 'axios'

export const getValidToken = async (userId) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/api/google/getValidToken/`,
      {
        userId: userId,
      },
    )
    const accessToken = response.data.accessToken

    return accessToken
  } catch (error) {
    console.log(error)
    return null
  }
}

export const getUserGoogleCalendarList = async (userId) => {
  try {
    const accessToken = await getValidToken(userId)

    if (!accessToken) return null

    const request = await fetch(
      `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    const data = await request.json()

    return data.items
  } catch (error) {
    console.log(error)
    return null
  }
}
