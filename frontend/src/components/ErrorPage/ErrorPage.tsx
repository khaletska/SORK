import "./errorPage.scss";
import { Link } from 'react-router-dom'
import SvgOops from "../../components/assets/SvgOops"

type Props = {
  statusCode: number,
  isLink?: boolean
}

const ErrorPage = ({ statusCode, isLink = true }: Props) => {
  //NOTE: This next line is an example for sending in the error code to this component:
  //<Route path="/error" element={<ErrorPage statusCode={404} />} />
  if (!statusCode) {
    statusCode = 505
  }

  return (
    <div id="ErrorPage">
      <div id="ErrorBox">
        <div id="oopsBox">
          <SvgOops />
        </div>
        <div id="errorCode">{statusCode}</div>
        {isLink &&
          <Link to={"/"}>
            <button className="back-home-btn header-20">Back to home</button>
          </Link>
        }
      </div>
    </div>
  )
}

export default ErrorPage;