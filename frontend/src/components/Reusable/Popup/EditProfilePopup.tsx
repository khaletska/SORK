import { useState } from "react";
import Popup from "reactjs-popup";
import Switcher from "../Switcher/Switcher";
import ImageBox from "../ImageBox/ImageBox";
import './userListPopup.scss';
import './editProfilePopup.scss';
import { User } from "../../../models/user";
import { NullStr } from "../../../models/nullable";

type Props = {
    user: User
}

const EditProfilePopup = ({ user }: Props) => {
    const [popup, setPopup] = useState(false)
    const [selectedPrivacy, setSelectedPrivacy] = useState(user.isPublic ? 'Public' : 'Private')
    const [image, setImageSrc] = useState<string | null>(user.avatar.Valid ? user.avatar.String : null)

    const closePopup = () => setPopup(false)
    const submitEditProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const avatar = image
        const formData = new FormData(e.currentTarget)
        const nickname: string = formData.get("nickname") as string
        const about: string = formData.get("about") as string;
        const privacy = selectedPrivacy === 'Public' ? true : false

        let avatarSqlNullString: NullStr = {
            Valid: avatar !== null && avatar !== "",
            String: avatar !== null && avatar !== "" ? avatar : "",
        }

        let nicknameSqlNullString: NullStr = {
            Valid: nickname !== undefined && nickname !== "",
            String: nickname !== undefined && nickname !== "" ? nickname : "",
        }

        let aboutSqlNullString: NullStr = {
            Valid: about !== undefined && about !== "",
            String: about !== undefined && about !== "" ? about : "",
        }

        try {
            const response = await fetch(`http://localhost:8080/update-profile`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'appliction/json' },
                body: JSON.stringify({
                    "avatar": avatarSqlNullString,
                    "nickname": nicknameSqlNullString,
                    "about": aboutSqlNullString,
                    "isPublic": privacy,
                })
            })

            if (response.ok) {
                closePopup();
                window.location.reload();
            } else {
                console.log('Error:', response);
            }
        } catch (error) {
            console.error('Request failed with status:', error);
        }
    }

    return (
        <div>
            <button className="user-edit-profile-btn btn-1 header-20" onClick={() => setPopup(o => !o)}>
                Edit profile
            </button>
            <Popup open={popup} onClose={closePopup}>
                <div className="pop-up-container">
                    <div className="pop-up">
                        <div className="pop-up-content">
                            <div className="pop-up-header">
                                <div className="popup-title">
                                    <p className="header-20">Edit profile</p>
                                </div>
                                <svg className="close" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" onClick={closePopup}>
                                    <path d="M18 6.88818L6 18.8882" stroke="#222222" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M6 6.88818L18 18.8882" stroke="#222222" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="border-top">
                                <form className="pop-up-edit" onSubmit={e => submitEditProfile(e)}>
                                    <ImageBox image={image} setImageSrc={setImageSrc} />
                                    <div className="label">
                                        <label className="header-20" htmlFor="nickname">Nickname:</label>
                                        <textarea
                                            name="nickname"
                                            className="input-gray input-nickname text-12"
                                            placeholder={user.nickname.Valid ? undefined : "Write your new nickname..."}
                                            defaultValue={user.nickname.Valid ? user.nickname.String : undefined}
                                            minLength={2}
                                            maxLength={15}
                                        >
                                        </textarea>
                                    </div>
                                    <div className="label">
                                        <label className="header-20" htmlFor="about">About:</label>
                                        <textarea
                                            name="about"
                                            className="input-gray input-about text-12"
                                            placeholder={user.about.Valid ? undefined : "Write something about yourself..."}
                                            defaultValue={user.about.Valid ? user.about.String : undefined}
                                            maxLength={2000}
                                        >
                                        </textarea>
                                    </div>
                                    <Switcher options={['Public', 'Private']} selectedOption={selectedPrivacy} setSelectedOption={setSelectedPrivacy} setBackColorGray={true} />
                                    <button className="edit-apply-btn btn-1" type="submit">
                                        <span>Apply changes</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </Popup>
        </div>
    )
}

export default EditProfilePopup