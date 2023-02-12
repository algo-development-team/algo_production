import React, { useState, useEffect } from 'react'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import gantt from 'dhtmlx-gantt'

export const TasksVisualisation = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Task 1', start_date: '2021-05-01', duration: 2 },
    { id: 2, text: 'Task 2', start_date: '2021-05-02', duration: 2 },
    {
      id: 3,
      text: 'Task 3',
      start_date: '2021-05-03',
      duration: 2,
      parent: 1,
    },
  ])

  useEffect(() => {
    gantt.init('gantt_container')
    gantt.parse({ data: tasks })
    gantt.config.drag_move = true
    gantt.config.drag_resize = true
    gantt.config.drag_progress = true
    gantt.config.editable = true
    gantt.config.readonly = false
    gantt.config.lightbox.sections = [
      { name: 'description', height: 70, map_to: 'text', type: 'textarea' },
      { name: 'time', type: 'duration', map_to: 'auto' },
    ]
    gantt.render()

    gantt.attachEvent('onAfterTaskUpdate', (id, item) => {
      setTasks(
        tasks.map((task) => {
          if (task.id === id) {
            return {
              ...task,
              text: item.text,
              start_date: item.start_date,
              duration: item.duration,
            }
          }
          return task
        }),
      )
    })
  }, [])

  return <div id='gantt_container' style={{ height: '500px' }} />
}
