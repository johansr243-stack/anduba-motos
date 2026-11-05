export interface UserItem {
  _id: string;
  username: string;
  email: string;
  phoneNumber: string;
}

export interface ResponseUsers {
  msg: string;
  data: UserItem[];
}
