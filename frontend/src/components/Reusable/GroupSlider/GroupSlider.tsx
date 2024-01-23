import { NullStr } from "../../../models/nullable";
import SliderItem from "../SliderItem/SliderItem";

function CreateGroupSlider(group: { id: number; name: string; description: string; image: NullStr; }) {
    return (
    <a href={`../group/${group.id}`} key={`group-${group.id}`}>
    <SliderItem
    name={group.name}
    description={group.description}
    image={group.image} />
    </a>
    );
}

export default CreateGroupSlider