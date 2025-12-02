export type UserInfo = {
  "id": number;
  "email": string;
  "username": string;
  "full_name": string;
  "is_active": boolean;
  "created_at": string;
}

export type Login = {
  "access_token": string;
  "token_type": string;
}