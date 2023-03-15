import { Header } from 'components/Header'
import { LoadingPage } from 'components/LoadingPage'
import { Overlay } from 'components/Overlay'
import { Sidebar } from 'components/Sidebar'
import { useThemeContextValue } from 'context'
import { TaskEditorContextProvider } from 'context/board-task-editor-context'
import { ColumnEditorContextProvider } from 'context/board-column-editor-context'
import { useProjects } from 'hooks'
import { useCallback, useEffect, useState, createContext } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { updateUserInfo } from '../../backend/handleUserInfo'
import { useIsSetup, useAuth } from 'hooks'
import { useOverlayContextValue } from 'context'


export const MyContext = createContext();
export const Layout = () => {
  const { isLight } = useThemeContextValue()
  const [showSidebar, setShowSidebar] = useState(true)
  const toggleSidebar = useCallback(() => setShowSidebar((value) => !value))
  const params = useParams()
  useEffect(() => {
    const { innerWidth: width } = window
    width < 900 && setShowSidebar(false)
  }, [params])
  const { loading } = useProjects()
  const { currentUser } = useAuth()
  const { isSetup } = useIsSetup()
  const { setShowDialog } = useOverlayContextValue()

  useEffect(() => {
    const showProductGuide = async () => {
      const timer = setTimeout(async () => {
        setShowDialog('PRODUCT_GUIDE')
      }, 2000)
      return () => clearTimeout(timer)
    }
    const updateIsSetup = async () => {
      await updateUserInfo(currentUser.id, { isSetup: true })
    }
    if (currentUser && !loading && !isSetup) {
      showProductGuide()
      updateIsSetup()
    }
  }, [currentUser, loading, isSetup])

  return (
    <>
    <MyContext.Provider value={showSidebar}>
      <TaskEditorContextProvider>
        <ColumnEditorContextProvider>
          {!loading ? (
            <div
              className={`${isLight ? 'light' : ''} ${
                !showSidebar ? 'hide-sidebar ' : ''
              }app`}
            >
              <Header onClick={toggleSidebar} showSideBar={showSidebar} />
              <Overlay />
              <Sidebar onClick={toggleSidebar} />
              <Outlet />
            </div>
          ) : (
            <LoadingPage />
          )}{' '}
        </ColumnEditorContextProvider>
      </TaskEditorContextProvider>
      </MyContext.Provider>
    </>
  )
}
