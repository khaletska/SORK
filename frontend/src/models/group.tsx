import { NullStr } from "./nullable"
import { User } from "./user"

export type Group = {
    id: number,
    name: string,
    description: string,
    creator: User,
    image: NullStr
    isMember: number,
}