import { Board } from 'components/BoardView/index'
import { TaskList } from 'components/ListView'
import { useSelectedProjectInfo } from 'hooks'
import { useParams } from 'react-router-dom'
import { Calendar } from 'components/Calendar'
import './styles/content.scss'
import './styles/light.scss'
import ScrollContainer from "react-indiana-drag-scroll";
import  React  from 'react';
// import  Draggable  from 'react-draggable';

export const Content = () => {
  const { projectId, defaultGroup } = useParams()
  const projectInfo = useSelectedProjectInfo(projectId)
  const currentView = projectInfo && projectInfo[0]?.projectIsList

  const getProject = () => {
    if (defaultGroup) {
      if (
        defaultGroup === 'Checklist' ||
        defaultGroup === 'Inbox' ||
        defaultGroup === 'Scheduled'
      ) {
        return <TaskList />
      } else if (defaultGroup === 'Calendar') {
        return <Calendar />
      } else {
        return null
      }
    } else {
      return currentView ? <TaskList /> : <Board />
    }
  }

   return ( 
    <div className='content'>
      <ScrollContainer className="container">
       <div className='project__wrapper'>{getProject()}</div>
       </ScrollContainer>
    </div>
    // </div>
    // </Draggable>
  )
}

{/*<Draggable
    axis="x"
    handle=".handle"
    defaultPosition={{x: 0, y: 0}}
    position={null}
    grid={[25, 25]}
    scale={1}
    onStart={this.handleStart}
    onDrag={this.handleDrag}
    onStop={this.handleStop}>
<div>*/}