import Popup from "reactjs-popup";
import { Event } from "../../../models/event"
import AvatarNamePair from "../../Reusable/AvatarNamePair/AvatarNamePair"
import Tabs from "../../Reusable/Tabs/Tabs";

type Props = {
    event: Event,
    isOpen: boolean,
    close: () => void,
    fetchEventsData: () => void,
}

const EventPopup = ({event,isOpen,close,fetchEventsData: fetchEvents}:Props) => {
    async function sendIsGoingToEventStatus(isMemberGoing:boolean) {
        try {
          await fetch(
            `http://localhost:8080/event/participation`, {
                method: "POST",
                credentials: 'include',
                headers: { "Content-Type": "appliction/json" },
                body: JSON.stringify({
                    eventID: event.id,
                    isParticipating: {bool: isMemberGoing, valid:true}
                }),
          });
        } catch (error) {
          console.error(`Error during sending event participation status change request:`, error);
        }
      }
    
    async function handleGoingSelection(){
        await sendIsGoingToEventStatus(true)
        fetchEvents()
        close()
    }

    async function handleNotGoingSelection(){
        await sendIsGoingToEventStatus(false)
        fetchEvents()
        close()
    }
 
 
    return (
        <Popup
        open={isOpen}
        closeOnDocumentClick
        closeOnEscape
        onClose={close}
        >
        <div className="pop-up-container">
            <div className="pop-up event-popup">
                <div className="pop-up-content no-bottom-margin">
                    <div className="pop-up-header">
                    <div className="popup-title">
                        <p className="header-20">{event.title}</p>
                    </div>
                    <svg className="close" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" onClick={close}>
                        <path d="M18 6.88818L6 18.8882" stroke="#222222" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 6.88818L18 18.8882" stroke="#222222" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    </div>
                </div>
                {event.image.Valid ? (
                <img className='event-popup-image' src={event.image.String} alt="" />
                ) : (
                <div className='event-popup-image'></div>
                )}
                <Tabs>
                    <div title="Event Info" className="event-tab-content" >
                    <div className="event-date text-12">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                            <path d="M17 3.59619L17 7.59619" stroke="#222222" strokeWidth="1.2" strokeLinecap="round"/>
                            <path d="M7 3.59619L7 7.59619" stroke="#222222" strokeWidth="1.2" strokeLinecap="round"/>
                            <path d="M3 10.5962C3 8.71057 3 7.76776 3.58579 7.18198C4.17157 6.59619 5.11438 6.59619 7 6.59619H17C18.8856 6.59619 19.8284 6.59619 20.4142 7.18198C21 7.76776 21 8.71057 21 10.5962V11.5962H3V10.5962Z" stroke="#222222" strokeWidth="1.2"/>
                            <rect x="3" y="6.59619" width="18" height="15" rx="2" stroke="#222222" strokeWidth="1.2"/>
                            <path d="M6 15.5962H10" stroke="#7E869E" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round"/>
                            <path d="M14 15.5962H18" stroke="#7E869E" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round"/>
                            <path d="M6 18.5962H10" stroke="#7E869E" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round"/>
                            <path d="M14 18.5962H18" stroke="#7E869E" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                        <p>{event.happeningAT}</p>
                    </div>
                    <div className="event-popup-description header-20">
                        {event.description}
                    </div>
                    <AvatarNamePair id={event.group.id} image={event.group.image} name={event.group.name} isRoundImage={false} urlPath="group"></AvatarNamePair>
                    <AvatarNamePair id={event.author.id} image={event.author.avatar} name={ `Created by ${event.author.firstName} ${event.author.lastName}`} urlPath="profile"></AvatarNamePair>
                        {event.isCurrentUserGoing.Valid?(
                            <div className="event-popup-buttons">
                            <button disabled={event.isCurrentUserGoing.Bool} className={`btn-1 event-popup-button ${event.isCurrentUserGoing.Bool ? "selected-option" : ""}`} onClick={()=> handleGoingSelection()}>Going</button>
                            <button disabled={!event.isCurrentUserGoing.Bool} className={`btn-1 event-popup-button ${!event.isCurrentUserGoing.Bool ? "selected-option" : ""}`} onClick={()=> handleNotGoingSelection()}>Not going</button>
                            </div>
                        ):(
                            <div className="event-popup-buttons">
                            <button className="btn-1 event-popup-button" onClick={()=> handleGoingSelection()}>Going</button>
                            <button className="btn-1 event-popup-button" onClick={()=> handleNotGoingSelection()}>Not going</button>
                            </div>
                        )}
                    </div>
                    <div title={`${event.participants.length} interested`} className="event-tab-content" >
                    {event.participants.length > 0 ? (
                    event.participants.map((participant) => (
                    <AvatarNamePair id={participant.id} image={participant.avatar} name={ `${participant.firstName} ${participant.lastName}`} urlPath="profile" key={`user-${participant.id}`}></AvatarNamePair>
                    ))
                    ) : (
                    <div className="no-participants">
                        <p>No participants confirmed yet. Be the first to sign-up!</p>
                    </div>
                    )}
                    </div>
                </Tabs>
            </div>
        </div>
        </Popup>
    )
}

export default EventPopup