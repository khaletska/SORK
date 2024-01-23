import { useState, useRef } from "react"
import { Event } from "../../../models/event"
import EventPopup from "./EventPopup"
import SliderItem from "../../Reusable/SliderItem/SliderItem"
import { ScrollingCarousel } from '@trendyol-js/react-carousel';

type Props = {
    eventData: Event[] | undefined
    fetchEventsData: () => void
}

const EventsComponent = ({eventData, fetchEventsData: fetchEvents}:Props) => {
    const [currentEventId, setCurrentEventId] = useState<number | undefined>()
    const mousePosition = useRef(0)

    if (!eventData) {
        return (
            <div>
                <p>Unable to load events. Try again later.</p>
            </div>
        )
    }

    function handleMouseDownOnEventItem (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
      mousePosition.current = event.screenX;
    }

    function handleClickOnEventItem(event: React.MouseEvent<HTMLButtonElement, MouseEvent>){
      const mousePositionDifference = Math.abs(event.screenX - mousePosition.current);
      event.preventDefault();
      if (mousePositionDifference < 5) {
        setCurrentEventId(parseInt(event.currentTarget.value));
      }
    }

    return (
        <div className="group-events-container">
          <p className="header-20 events-header">Events</p>
          <div className="events-slider">
            {eventData.length > 0 ? (
              <ScrollingCarousel>
                {eventData.map((event) => (
                  <button className="btn-unstyled" value={event.id} onMouseDown={handleMouseDownOnEventItem} onClick={handleClickOnEventItem} key={`event-${event.id}`}>
                    <SliderItem 
                      name={event.title} 
                      description={event.description} 
                      image={event.image} 
                    />
                  </button>
                ))}
              </ScrollingCarousel>
            ) : (
              <div className="no-events">
                <p className="header-20">No events yet. Create first event!</p>
              </div>
            )}
          </div>
            {currentEventId && (
              <EventPopup 
                fetchEventsData={fetchEvents}
                event={eventData.find(e => e.id === currentEventId)!} 
                isOpen={true} 
                close={() => setCurrentEventId(undefined)}/>
            )}
        </div>
    )
}

export default EventsComponent