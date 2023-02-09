export const getDefaultUserTasks = () => {
  const defaultUserTasks = [
    {
      name: 'Start your own project! 🚀',
      startDate: '',
      date: '',
      projectId: 'welcome',
      taskId: 'icebreaker_1',
      boardStatus: 'TODO',
      completed: false,
      important: false,
      description: 'Click + button to add new project.', // string
      priority: 3, // number (int) (range: 1-3)
      timeLength: 15, // number (int) (range: 15-480)
      eventIds: [],
      index: 0,
    },
    {
      name: 'Schedule tasks 📅 ',
      startDate: '',
      date: '',
      projectId: 'welcome',
      taskId: 'icebreaker_2',
      boardStatus: 'TODO',
      completed: false,
      important: false,
      description: 'Add new tasks.', // string
      priority: 3, // number (int) (range: 1-3)
      timeLength: 15, // number (int) (range: 15-480)
      eventIds: [],
      index: 1,
    },
  ]
  return defaultUserTasks
}

export const getDefaultUserProject = (userId) => {
  const defaultUserProject = {
    name: 'Welcome 👋',
    projectId: userId,
    projectColour: {
      name: 'Charcoal',
      hex: '#808080',
    },
    projectIsList: false,
    projectIsWork: true,
    columns: [
      {
        id: 'NOSECTION',
        title: '(No Section)',
      },
      {
        id: 'TODO',
        title: 'To do',
      },
      {
        id: 'INPROGRESS',
        title: 'In Progress',
      },
      {
        id: 'COMPLETE',
        title: 'Complete',
      },
    ],
  }
  return defaultUserProject
}

export const getDefaultUserTeam = (userId, userName) => {
  const defaultUserTeam = {
    teamId: userId,
    projects: [userId],
    name: userName,
    description: `Default team for ${userName}`,
  }
  return defaultUserTeam
}

export const getDefaultUserInfo = (userId, email) => {
  const defaultPreferences = new Array(24).fill(0) // all preferences are urgent
  const defaultPersonalPreferences = new Array(24).fill(0) // all preferences are personal work
  const defaultUserInfo = {
    userId: userId,
    teams: [],
    workTimeRange: '9:00-17:00',
    sleepTimeRange: '23:00-07:00',
    preferences: defaultPreferences,
    personalPreferences: defaultPersonalPreferences,
    workDays: [false, true, true, true, true, true, false],
    isSetup: false,
    calendarId: null,
    calendarIds: [{ id: email, selected: true, summary: email, colorId: 7 }],
    checklist: [], // soon to be deprecated, and replaced by weeklyChecklist
    weeklyChecklist: [],
    scheduleCreated: false,
    isGrouping: true,
    isWeekly: true,
    startingDay: 5,
    beforeMeetingBufferTime: 0,
    afterMeetingBufferTime: 0,
    beforeWorkBufferTime: 0,
    afterWorkBufferTime: 0,
    beforeSleepBufferTime: 0,
    afterSleepBufferTime: 0,
  }
  return defaultUserInfo
}
