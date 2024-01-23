import { useState } from "react"
import ImageBox from "../../Reusable/ImageBox/ImageBox";
import './groupForms.scss'
import ErrorPage from "../../ErrorPage/ErrorPage";

type Props = {
    groupID: number
    hideForm : () => void
    onSubmit : () => void
}

const CreateGroupPostForm = ({groupID, hideForm, onSubmit}:Props) => {

    const [postImage, setPostImageSrc] = useState<string | null >(null);
    const [error, setError] = useState<string | undefined>();
    const [statusCode, setStatusCode] = useState<number>(200)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        let title: string  = formData.get("group-post-title") as string
        let content: string  = formData.get("group-post-content") as string
    
        try {
          const response = await fetch(`http://localhost:8080/create-post`, {
            method: "POST",
            credentials: 'include',
            headers: { "Content-Type": "appliction/json" },
            body: JSON.stringify({
              image: {string: postImage, valid: postImage? true: false },
              title: title,
              content: content,
              groupID: {Int64 : groupID, valid: true }
            }),
          });

          if (!response.ok) {
            setStatusCode(response.status)
            setError("Something wrong with data or a problem during posting. Please try again soon.");
          }else {
            onSubmit()
            hideForm()
          }
    
        } catch (error) {
          setError("Something wrong with data or a problem during posting. Please try again soon.");
        }
    }

    if (statusCode !== 200) return <ErrorPage statusCode = {statusCode}/>

return (
    <form onSubmit={handleSubmit} id ="add-group-post-form" className="group-form-content">
    <div className="group-form-field">
        <ImageBox image={postImage} setImageSrc={setPostImageSrc}></ImageBox>
    </div>
    <div className="group-form-field">
        <label htmlFor="group-post-title" className="header-20">
        Title:
        </label>
        <input 
            type="text" 
            name="group-post-title"
            className="input-white text-clip-elipsis text-12"
            placeholder="Write title"
            minLength={2}
            maxLength={50}
            required
            />
    </div>
    <div className="group-form-field">
        <label htmlFor="group-post-content" className="header-20">
        Post:
        </label>
        <textarea id= "group-post-content" name="group-post-content"
            className="input-white text-clip-elipsis text-12"
            placeholder="Write your post"
            minLength={2}
            maxLength={10000}
            required
            />
    </div>
    {error &&(
    <div className="error text-12">
        <span>{error}</span>
    </div>
    )}
    <button className="btn-1" type="submit">Add post</button>
    </form>
)
}

export default CreateGroupPostForm