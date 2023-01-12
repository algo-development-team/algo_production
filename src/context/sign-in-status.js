import { createContext, useContext, useState } from 'react'

export const SignInStatusContext = createContext()

// Description: 0: Not Loaded, 1: Signed In, 2: Not Signed In
export const SignInStatusContextProvider = ({ children }) => {
  const [signInStatus, setSignInStatus] = useState(0)

  return (
    <SignInStatusContext.Provider value={{ signInStatus, setSignInStatus }}>
      {children}
    </SignInStatusContext.Provider>
  )
}

export const useSignInStatusValue = () => useContext(SignInStatusContext)
