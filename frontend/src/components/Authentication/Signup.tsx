import { useState } from "react"
import "./authentication.scss"
import "../Reusable/Popup/editProfilePopup.scss"
import ImageBox from "../Reusable/ImageBox/ImageBox"
import checkEmail from "./CheckEmail"
import { BasicUser } from "../../models/user"
import { TextError } from "../../models/error"
import SvgAuthFormLogo from "../assets/Svg-Auth-form-logo"
import { NullStr } from "../../models/nullable"

export type InputError = {
  isError: boolean
  text: string
}

const Signup = () => {
  const [step, setStep] = useState(1)
  const [image, setImageSrc] = useState<string | null>(null)
  const [error, setError] = useState<TextError>({ isError: false, text: "" })

  const submitSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    let user: BasicUser = {
      firstName: e.currentTarget.firstName.value,
      lastName: e.currentTarget.lastName.value,
      dateOfBirth: e.currentTarget.dateOfBirth.value,
      email: e.currentTarget.email.value,
    }

    const password = e.currentTarget.password.value

    try {
      const res = await fetch(`http://localhost:8080/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "appliction/json" },
        body: JSON.stringify({
          user,
          password,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setStep(2)
        } else {
          setError({
            isError: true,
            text: data.error,
          })
        }
      } else {
        setError({
          isError: true,
          text: "There was a problem signing you up to Social Network. Please try again soon.",
        })
      }
    } catch (error) {
      setError({
        isError: true,
        text: "There was a problem signing you up to Social Network. Please try again soon.",
      })
    }
  }

  const submitSignupOptional = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const avatar: string | null = image
    const nickname: string = e.currentTarget.nickname.value
    const about: string = e.currentTarget.about.value

    let avatarSqlNullString: NullStr = {
      Valid: avatar ? true : false,
      String: avatar ? avatar : "",
    }

    let nicknameSqlNullString: NullStr = {
      Valid: nickname !== undefined,
      String: nickname !== undefined ? nickname : "",
    }

    let aboutSqlNullString: NullStr = {
      Valid: about !== undefined,
      String: about !== undefined ? about : "",
    }

    try {
      const res = await fetch(`http://localhost:8080/update-profile`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "appliction/json" },
        body: JSON.stringify({
          "avatar": avatarSqlNullString,
          "nickname": nicknameSqlNullString,
          "about": aboutSqlNullString,
          "isPublic": true,
        }),
      })

      if (res.ok) {
        window.location.replace("/login")
      } else {
        setError({
          isError: true,
          text: "Impossible to apply changes. Please try again soon.",
        })
      }
    } catch (error) {
      setError({
        isError: true,
        text: "Impossible to apply changes. Please try again soon.",
      })
    }
  }

  return (
    <div className="content-container">
      {step === 1 ? (
        <div className="signup-form-container">
          <div className="auth-form-logo">
            <SvgAuthFormLogo />
          </div>
          <form className="auth-form" onSubmit={(e) => submitSignup(e)}>
            <div className="auth-form-field">
              <label className="header-20 text-clip-elipsis" htmlFor="firstName">
                First Name:
              </label>
              <input
                className="input-white header-20 text-clip-elipsis"
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                minLength={2}
                maxLength={20}
                required
              />
            </div>
            <div className="auth-form-field">
              <label className="header-20 text-clip-elipsis" htmlFor="lastName">
                Last Name:
              </label>
              <input
                className="input-white header-20 text-clip-elipsis"
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                minLength={2}
                maxLength={20}
                required
              />
            </div>
            <div className="auth-form-field">
              <label className="header-20 text-clip-elipsis" htmlFor="dateOfBirth">
                Date of birth:
              </label>
              <input
                className="input-white header-20 text-clip-elipsis"
                type="date"
                name="dateOfBirth"
                min={"1923-01-01"}
                max={new Date().toISOString().slice(0, -14)}
                placeholder="mm-dd-yyyy"
                minLength={8}
                maxLength={8}
                required
              />
            </div>
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
                placeholder="Create a password"
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
                Sign up
              </button>
              <div className="header-20">
                <span className="text-gray">Already have an account? </span>
                <a href="/login">Log in</a>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="signup-form-container signup-step-two-form-container">
          <div className="auth-form-logo">
            <SvgAuthFormLogo />
          </div>
          <form className="auth-form" onSubmit={(e) => submitSignupOptional(e)}>
            <div className="auth-form-field">
              <label className="header-20 text-clip-elipsis" htmlFor="nickname">
                Nickname:
              </label>
              <input
                name="nickname"
                className="input-white header-20 text-clip-elipsis"
                type="text"
                placeholder="Enter your nickname"
                minLength={2}
                maxLength={15}
              />
            </div>
            <div className="auth-form-field">
              <label className="header-20 text-clip-elipsis" htmlFor="about">
                About:
              </label>
              <textarea
                name="about"
                className="signup-about input-white header-20 text-clip-elipsis"
                placeholder="Enter something about you"
                maxLength={2000}
              />
            </div>
            <div className="auth-form-field">
              <label className="header-20 text-clip-elipsis" htmlFor="about">
                Add profile picture:
              </label>
              <ImageBox image={image} setImageSrc={setImageSrc} />
            </div>
            <button className="continue-btn btn-1" type="submit">
              <span>Continue</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Signup
