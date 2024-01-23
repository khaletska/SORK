import { useState } from "react"
import ImageBox from "../Reusable/ImageBox/ImageBox"
import "./createPost.scss"
import Switcher from "../Reusable/Switcher/Switcher"
import { TextError } from "../../models/error"

const CreatePostComponent = () => {
    const [selectedPrivacy, setSelectedPrivacy] = useState('Public')
    const [image, setImageSrc] = useState<string | null>(null)
    const [error, setError] = useState<TextError>({ isError: false, text: "" });

    const submitCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const title: string = formData.get("title") as string
        const post: string = formData.get("post") as string;
        const privacy = selectedPrivacy

        try {
            const response = await fetch(`http://localhost:8080/create-post`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'appliction/json' },
                body: JSON.stringify({
                    "title": title,
                    "content": post,
                    "image": {string: image, valid: image? true: false },
                    "privacy": privacy,
                })
            })

            if (response.ok) {
                const data = await response.json();
                window.location.href = `/post/${data}`;
            } else {
                setError({
                    isError: true,
                    text: "There was a problem adding your post to Social Network. Please try again soon.",
                });
            }
        } catch (error) {
            setError({
                isError: true,
                text: "There was a server problem adding your post to Social Network. Please try again soon.",
            });
        }
    }

    return (
        <form className="create-post-form" onSubmit={e => submitCreatePost(e)}>
            <div className="create-form-containers">
                <label className="header-20" htmlFor="title">Title</label>
                <input name="title" className="input-white input text-12" type="text" placeholder="Write the title..."
                    minLength={2} maxLength={50} required></input>
            </div>
            <div className="create-form-containers">
                <label className="header-20" htmlFor="post">Post</label>
                <textarea name="post" className="input-white input text-12" placeholder="Write your post..."
                    minLength={2} maxLength={10000} rows={window.innerHeight >= 900 ? 20 : 15} required></textarea>
            </div>
            <div className="create-form-containers">
                <ImageBox image={image} setImageSrc={setImageSrc} />
            </div>
            <div className="create-form-containers error text-12">
                {error.text}
            </div>
            <div className="create-form-containers switcher-submit-container">
                <Switcher options={['Public', 'Private', 'Close friends']} selectedOption={selectedPrivacy} setSelectedOption={setSelectedPrivacy} setBackColorGray={false} />
                <button className="btn-1 create-apply-btn" type="submit" style={{ height: window.innerWidth >= 770 ? "50px" : "40px" }}>
                    <span>Create</span>
                </button>
            </div>
        </form>
    )
}
export default CreatePostComponent