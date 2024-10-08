export interface AuthPayload {
  id: number | string;
  name?: null | string;
  email: string;
  password: string;
  username?: string;
}
