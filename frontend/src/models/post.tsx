import { NullStr } from "./nullable"
import { User } from "./user"

export type Post = {
    id: number,
    groupID: number,
    privacy: string,
    author: User,
    createdAT: string,
    title: string,
    content: string,
    image: NullStr,
    likes: number,
    isLikedByCurrUser: boolean
}