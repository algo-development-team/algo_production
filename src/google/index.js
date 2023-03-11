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

// write a function that adds a new calendar to a user's Google Calendar list
export const addCalendarToUserGoogleCalendarList = async (
  userId,
  calendarName,
) => {
  try {
    const accessToken = await getValidToken(userId)

    if (!accessToken) return null

    const request = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: calendarName,
        }),
      },
    )

    const data = await request.json()

    return data
  } catch (error) {
    console.log(error)
    return null
  }
}

// write a function that adds a new event to a calendar
export const addEventToUserGoogleCalendar = async (userId, event) => {
  try {
    const accessToken = await getValidToken(userId)

    if (!accessToken) return null

    const request = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      },
    )

    const data = await request.json()

    return data
  } catch (error) {
    console.log(error)
    return null
  }
}

// write a function that deletes an event from a calendar
export const deleteEventFromUserGoogleCalendar = async (userId, eventId) => {
  try {
    const accessToken = await getValidToken(userId)

    if (!accessToken) return null

    const request = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return true
  } catch (error) {
    console.log(error)
    return null
  }
}

// write a function that partially updates an event from a calendar
export const updateEventFromUserGoogleCalendar = async (
  userId,
  eventId,
  event,
) => {
  try {
    const accessToken = await getValidToken(userId)

    if (!accessToken) return null

    const request = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      },
    )

    const data = await request.json()

    return data
  } catch (error) {
    console.log(error)
    return null
  }
}
