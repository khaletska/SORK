import { useState } from 'react'
import ImageBox from '../Reusable/ImageBox/ImageBox'
import './createGroup.scss'
import { TextError } from '../../models/error'

const CreateGroupComponent = () => {
    const [image, setImageSrc] = useState<string | null>(null)
    const [error, setError] = useState<TextError>({ isError: false, text: "" })

    const submitCreateGroup = async (e:  React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const title: string = formData.get("title") as string
        const description: string = formData.get("description") as string;

        try {
            const response = await fetch(`http://localhost:8080/create-group`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'appliction/json' },
                body: JSON.stringify({
                    "name": title,
                    "description": description,
                    "image": {string: image, valid: image? true: false },
                })
            })

            if (response.ok) {
                const data = await response.json();
                window.location.href = `/group/${data}`;
            } else {
                setError({
                    isError: true,
                    text: "There was a problem adding your group to Social Network. Please try again soon.",
                });
            }
        } catch (error) {
            setError({
                isError: true,
                text: "There was a server problem adding your group to Social Network. Please try again soon.",
            });
        }
    }

    return (
        <form className="create-group-form" onSubmit={e => submitCreateGroup(e)}>
            <div className="create-form-containers">
                <label className="header-20" htmlFor="title">Title</label>
                <input name="title" className="input-white input text-12" type="text" placeholder="Write the title..."
                    minLength={2} maxLength={50} required></input>
            </div>
            <div className="create-form-containers">
                <label className="header-20" htmlFor="description">Description</label>
                <textarea name="description" className="input-white input text-12" placeholder="Write your post..."
                    minLength={2} maxLength={500} rows={window.innerHeight >= 900 ? 20 : 15} required></textarea>
            </div>
            <div className="create-form-containers">
                <ImageBox image={image} setImageSrc={setImageSrc} />
            </div>
            <div className="create-form-containers error text-12">
                {error.text}
            </div>
            <div className="create-form-containers">
                <button className="btn-1" type="submit" style={{ height: window.innerWidth >= 770 ? "50px" : "40px" }}>
                    <span>Create</span>
                </button>
            </div>
        </form>
    )
}

export default CreateGroupComponent