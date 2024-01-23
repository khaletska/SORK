import Signup from "./Signup"
import Login from "./Login"

type Props = {
  isLogin: boolean
}

const Authentication = ({ isLogin }: Props) => {
  return <>{isLogin ? <Login /> : <Signup />}</>
}

export default Authentication
