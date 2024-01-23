import { useEffect, useState } from "react"
import { Group } from "../../models/group"
import "./mainPage.scss"
import { ScrollingCarousel } from '@trendyol-js/react-carousel';
import CreateGroupSlider from "../Reusable/GroupSlider/GroupSlider";

const MainPageGroups = () => {
    const [groups, setGroups] = useState<Group[] | null>(null)

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`http://localhost:8080/groups`, {
                    method: 'GET',
                    credentials: 'include'
                })
                const json: Group[] = await response.json()
                setGroups(json)
            } catch (error) {
                console.error(`Error fetching groups:`, error)
            }
        })()
    }, [])

    if (!groups || groups.length === 0) {
        return (
            <div className="hidden-div"></div>
        )
    }

    return (
        <div>
            <p className="groups-header header-20 border-top">Groups</p>
            <div className="groups-list">
                <ScrollingCarousel>
                    {groups.map(CreateGroupSlider)}
                </ScrollingCarousel>
            </div>
        </div>
    )
}

export default MainPageGroups