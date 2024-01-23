import { NullStr } from "../../../models/nullable"
import './sliderItem.scss'

type Props = {
    name: string,
    description: string,
    image: NullStr,
}

const SliderItem = ({name, description, image }: Props) => {
    return (
        <div className="slider-item">
            <div className="slider-item-text">
                <p className="slider-name header-20">{name}</p>
                <p className="slider-desc text-12">{description}</p>
            </div>
            {image.Valid ? (
                <img className='slider-item-image' src={image.String} alt="" />
            ) : (
                <div className='slider-item-image'></div>
            )}
        </div>
    )
}

export default SliderItem