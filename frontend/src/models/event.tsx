import { User } from "./user"
import { NullStr, NullBool } from "./nullable"
import { Group } from "./group"

export type Event = {
    id: number,
    group: Group,
    title: string,
    description: string,
    image: NullStr,
    happeningAT: string,
    author: User,
    participants: User[],
    isCurrentUserGoing: NullBool,
}