import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { AuthContextProvider } from "./contexts/AuthContext"

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <AuthContextProvider>
    <App />
  </AuthContextProvider>
)
