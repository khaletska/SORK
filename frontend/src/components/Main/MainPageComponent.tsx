import { useParams } from "react-router-dom"
import "./mainPage.scss"
import MainPageGroups from "./MainPageGroups"
import MainPagePosts from "./MainPagePosts"

const MainPageComponent = () => {

    return(
        <div className="main-wrapper">
            <MainPageGroups />
            <MainPagePosts />
        </div>
    )
}

export default MainPageComponent