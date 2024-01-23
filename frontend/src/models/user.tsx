import { NullStr } from './nullable';

export type Cookie = {
  name: string;
  value: string;
  expires: Date;
  path: string;
};

export type BasicUser = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
};

export type Follower = {
  id: number;
  firstName: string;
  lastName: string;
  avatar: NullStr;
};

export type User = BasicUser & {
  id: number;
  avatar: NullStr;
  nickname: NullStr;
  about: NullStr;
  isPublic: boolean;
  followers: Follower[];
  following:Follower[];
  friends: Follower[];
};
