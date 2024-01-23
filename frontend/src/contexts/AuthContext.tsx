import React, { useState, createContext, useEffect } from "react"
import { User } from "../models/user"
import { connect } from "../api/chats"
import ErrorPage from "../components/ErrorPage/ErrorPage"

export type AuthContextType = {
  user: User
  setUser: (value: User) => void
  hasLoaded: boolean
  chatBubbleNumber: number
  setChatBubbleNumber: any
}

type AuthContextProviderType = {
  children: React.ReactNode
}

export const AuthContext = createContext({} as AuthContextType)

export const AuthContextProvider = ({ children }: AuthContextProviderType) => {
  let emptyUser = {} as User

  const [user, setUser] = useState<User>(emptyUser)
  const [hasLoaded, setLoaded] = useState<boolean>(false)
  const [statusCode, setStatusCode] = useState<number>(200)
  connect()
  const [chatBubbleNumber, setChatBubbleNumber] = useState<number>(0)

  //authenticates user
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`http://localhost:8080/check-user`, {
          method: "GET",
          credentials: "include",
        })
        if (response.ok) {
          if (!response.ok) {
            setStatusCode(response.status)
            return
          }
          const json: User = await response.json()
          setUser(json)
          // connect()
        }
        setLoaded(true)
      } catch (error) {
        setStatusCode(500)
        console.error(`Error fetching user context:`, error)
      }
    })()
  }, [])

  // im not sure that there is any sense to put it
  //adds an event listener for the user, updates it accordingly
  useEffect(() => {
    const receiveMessages = (e: any) => {
      if (e.detail.msg.sender.id !== user.id) {
        setChatBubbleNumber((prevBubbleNumber) => prevBubbleNumber + 1)
      }
    }
    if (user.id) {
      document.addEventListener("receive_message", receiveMessages)
    }
    return () => {
      document.removeEventListener("receive_message", receiveMessages)
    }
  }, [user])

  if (statusCode !== 200) return <ErrorPage statusCode={statusCode} isLink={false} />

  return (
    <AuthContext.Provider
      value={{ user, setUser, hasLoaded, chatBubbleNumber, setChatBubbleNumber }}
    >
      {children}
    </AuthContext.Provider>
  )
}
