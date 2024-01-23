import { NullStr } from "./nullable"
import { User } from "./user"

export type Comment = {
    id: number,
    postID: number,
    author: User,
    content: string,
    createdAT: string,
    image: NullStr
}