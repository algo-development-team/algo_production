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

export const getUserGoogleCalendarsEvents = async (userId, calendarIds) => {
  try {
    const accessToken = await getValidToken(userId)

    console.log('accessToken:', accessToken) // TESTING

    if (!accessToken) return null

    const calendarsItems = {}

    for (let i = 0; i < calendarIds.length; i++) {
      let nextPageToken = ''
      let items = []

      do {
        // set maxResults to a high number to fetch all events
        const request = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarIds[i]}/events?maxResults=2500&pageToken=${nextPageToken}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        const data = await request.json()

        console.log(`data.items ${i}:`, data.items) // TESTING

        items = items.concat(data.items)
        nextPageToken = data.nextPageToken || ''
      } while (nextPageToken)

      calendarsItems[calendarIds[i]] = items
    }

    return calendarsItems
  } catch (error) {
    console.log(error)
    return null
  }
}
