import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import PostRoute from "./components/Post/PostRoute"
import ProfileRoute from "./components/Profile/ProfileRoute"
import GroupRoute from "./components/Group/GroupRoute"
import ChatsPageComponent from "./components/Chat/ChatsPageComponent"
import CreatePostComponent from "./components/CreatePost/CreatePostComponent"
import CreateGroupComponent from "./components/CreateGroup/CreateGroupComponent"
import "./app.scss"
import MainPageComponent from "./components/Main/MainPageComponent"
import Authentication from "./components/Authentication/Authentication"
import { useContext } from "react"
import { AuthContext } from "./contexts/AuthContext"
import PrivateRoute from "./components/Authentication/PrivateRoute"

const App = () => {
  const { user, hasLoaded } = useContext(AuthContext)

  if (!hasLoaded) {
    return <></>
  }

  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          {!user.id ? (
            <>
              <Route path="*" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Authentication isLogin={true} />} />
              <Route path="/signup" element={<Authentication isLogin={false} />} />
            </>
          ) : (
            <>
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <MainPageComponent />
                  </PrivateRoute>
                }
              />
              <Route
                path="/chats/:reqUserID?"
                element={
                  <PrivateRoute>
                    <ChatsPageComponent />
                  </PrivateRoute>
                }
              />
              <Route
                path="/create-post"
                element={
                  <PrivateRoute>
                    <CreatePostComponent />
                  </PrivateRoute>
                }
              />
              <Route
                path="/create-group"
                element={
                  <PrivateRoute>
                    <CreateGroupComponent />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile/:id"
                element={
                  <PrivateRoute>
                    <ProfileRoute />
                  </PrivateRoute>
                }
              />
              <Route
                path="/group/:id"
                element={
                  <PrivateRoute>
                    <GroupRoute />
                  </PrivateRoute>
                }
              />
              <Route
                path="/post/:id"
                element={
                  <PrivateRoute>
                    <PostRoute />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
