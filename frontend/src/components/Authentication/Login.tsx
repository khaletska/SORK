import { useContext, useState } from "react"
import checkEmail from "./CheckEmail"
import "./authentication.scss"
import SvgLogin from "../assets/SvgLogin"
import { TextError } from "../../models/error"
import { AuthContext } from "../../contexts/AuthContext"

const Login = () => {
  const [error, setError] = useState<TextError>({ isError: false, text: "" })
  const { setUser } = useContext(AuthContext)

  const submitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;
    try {
      const res = await fetch(`http://localhost:8080/login`, {
        method: "POST",
        credentials: "include",
        // headers: { 'Content-Type': 'appliction/json' },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (res.ok) {
        const user = await res.json()
        setUser(user)
      } else if (res.status === 401) {
        setError({
          isError: true,
          text: "Please check your email and password and try again.",
        })
      } else {
        throw new Error('')
      }
    } catch (error) {
      setError({
        isError: true,
        text: "There was a problem logging you in to Social Network. Please try again soon.",
      })
    }
  }

  return (
    <div className="content-container">
      <div className="login-form-container">
        <div className="auth-form-logo">
          <SvgLogin />
        </div>
        <form className="auth-form" onSubmit={(e) => submitLogin(e)}>
          <div className="auth-form-field">
            <label className="header-20 text-clip-elipsis" htmlFor="email">
              Email:
            </label>
            <input
              className="input-white header-20 text-clip-elipsis"
              type="email"
              name="email"
              placeholder="Enter your email"
              minLength={2}
              maxLength={50}
              onBlur={(e) => checkEmail(e, setError)}
              onFocus={(e) => setError({ isError: false, text: "" })}
              required
            />
          </div>
          <div className="auth-form-field">
            <label className="header-20 text-clip-elipsis" htmlFor="password">
              Password:
            </label>
            <input
              className="input-white header-20 text-clip-elipsis"
              type="password"
              name="password"
              placeholder="Enter your password"
              minLength={4}
              maxLength={50}
              required
            />
          </div>
          {error.isError && (
            <div className="error text-12">
              <span>{error.text}</span>
            </div>
          )}
          <div className="auth-form-lowest">
            <button className="btn-1" type="submit">
              Log in
            </button>
            <div className="header-20">
              <span className="text-gray">New to SORK? </span>
              <a href="/signup">Sign up</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
