import { NullStr } from "../../../models/nullable"
import './avatarNamePair.scss'
type Props = {
    id: number,
    name: string,
    image: NullStr,
    //small text is 12px, default is 20px
    isSmallText?: boolean,
    isRoundImage?:boolean,
    urlPath: string,
}

const AvatarNamePair = ({id, image, name, isSmallText = false, isRoundImage = true,urlPath}: Props) => {
    return (
        <a className='post-author' href={`/${urlPath}/${id}`}>
            {image && image.Valid ? (
                <img className={`avatar ${isRoundImage? 'border-radius-15': 'border-radius-5'}`} src={image.String} alt="" />
            ) : (
                <div className={`avatar ${isRoundImage? 'border-radius-15': 'border-radius-5'}`}></div>
            )}
            <p className= {`name header-20`}>{name}</p>
        </a>
    )
}

export default AvatarNamePair