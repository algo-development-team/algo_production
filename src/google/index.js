import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { generatePushId } from 'utils'
import { timeZone } from 'handleCalendars'

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

    const fetchedCalendarsEvents = {}
    const fetcehdNextSyncTokens = {}

    for (let i = 0; i < calendarIds.length; i++) {
      let nextSyncToken = ''
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
        nextSyncToken = data.nextSyncToken || ''
      } while (nextPageToken)

      fetchedCalendarsEvents[calendarIds[i]] = items
      fetcehdNextSyncTokens[calendarIds[i]] = nextSyncToken
    }

    return {
      fetchedCalendarsEvents: fetchedCalendarsEvents,
      nextSyncTokens: fetcehdNextSyncTokens,
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

export const getUserGoogleCalendarEventsIncSync = async (
  userId,
  calendarId,
  syncToken,
) => {
  try {
    const accessToken = await getValidToken(userId)

    if (!accessToken) return null

    let nextPageToken = ''
    let items = []

    do {
      // set maxResults to a high number to fetch all events
      const request = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=2500&syncToken=${syncToken}pageToken=${nextPageToken}`,
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

    return items
  } catch (error) {
    console.log(error)
  }
}

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

export const addEventToUserGoogleCalendar = async (
  userId,
  calendarId,
  event,
) => {
  try {
    const accessToken = await getValidToken(userId)

    if (!accessToken) return null

    const request = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
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

export const deleteEventFromUserGoogleCalendar = async (
  userId,
  calendarId,
  eventId,
) => {
  try {
    const accessToken = await getValidToken(userId)

    if (!accessToken) return null

    const request = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
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

export const updateRecurringEventFromUserGoogleCalendar = async (
  userId,
  calendarId,
  eventId,
  updatedRecurrence,
) => {
  try {
    const accessToken = await getValidToken(userId)

    if (!accessToken) return null

    const body = {
      recurrence: updatedRecurrence,
    }

    const request = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    )

    console.log('request', request) // DEBUGGING

    const data = await request.json()

    console.log('data', data) // DEBUGGING

    return data
  } catch (error) {
    console.log(error)
    return null
  }
}

export const updateEventFromUserGoogleCalendar = async (
  userId,
  calendarId,
  eventId,
  event,
) => {
  try {
    const accessToken = await getValidToken(userId)

    if (!accessToken) return null

    const request = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
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

export const addWebhookToGoogleCalendar = async (userId, calendarId) => {
  try {
    const accessToken = await getValidToken(userId)

    if (!accessToken) return null

    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/watch`
    const webhookUrl = `https://${process.env.REACT_APP_NGROK_BODY}/webhooks/google/calendar`
    const requestBody = {
      id: uuidv4(),
      type: 'web_hook',
      address: webhookUrl,
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    const data = await response.json()

    return data
  } catch (error) {
    console.log(error)
  }
}

export const createGoogleMeet = async (userId, calendarId, eventId) => {
  try {
    const accessToken = await getValidToken(userId)

    if (!accessToken) return null

    // Send a PATCH request to update the event with the new conferenceData
    const updateResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}?conferenceDataVersion=1`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conferenceData: {
            createRequest: {
              requestId: generatePushId(),
            },
          },
        }),
      },
    )

    if (!updateResponse.ok) {
      throw new Error('Failed to generate Google Meet link')
    }

    // Extract the Meet link from the updated event data
    const updatedEventData = await updateResponse.json()
    console.log('updatedEventData', updatedEventData) // DEBUGGING
    const meetLink = updatedEventData.hangoutLink

    return meetLink
  } catch (error) {
    console.error(error)
  }
}

export const deleteGoogleMeet = async (userId, calendarId, eventId) => {
  try {
    const accessToken = await getValidToken(userId)

    if (!accessToken) return null

    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}?conferenceDataVersion=1`
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conferenceData: null,
      }),
    })

    if (!response.ok) {
      throw new Error(
        `Failed to delete Google Meet: ${response.status} - ${response.statusText}`,
      )
    }

    return response.json()
  } catch (error) {
    console.error(error)
  }
}

export const fetchDeletedEventInstances = async (
  userId,
  calendarId,
  eventId,
) => {
  try {
    const accessToken = await getValidToken(userId)

    if (!accessToken) return null
    const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}/instances?showDeleted=true`

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(
        `Failed to fetch event instances: ${response.status} ${response.statusText}`,
      )
    }

    const data = await response.json()

    // Filter the instances to only include deleted occurrences
    const deletedInstances = data.items.filter(
      (instance) => instance.status === 'cancelled',
    )

    return deletedInstances
  } catch (error) {
    console.error(error)
  }
}
