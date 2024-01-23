import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../../contexts/AuthContext"

import Footer from "../Footer/Footer"
import Menu from "../Menu/Menu"

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useContext(AuthContext)

  return user.id ? ( //Check if logged in
    <>
      <Wrapper>{children}</Wrapper>
    </>
  ) : (
    <Navigate to="/login" /> //Go back to login if not logged in
  )
}

const Wrapper = ({ children }: { children: JSX.Element }) => {
  return (
    <>
      <Menu />
      <div id="main-content-container" className="main-content-container">
        <div className="main-content">{children}</div>
        <Footer />
      </div>
    </>
  )
}

export default PrivateRoute
