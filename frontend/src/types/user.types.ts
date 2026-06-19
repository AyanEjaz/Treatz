export interface User {
  id: string;
  email?: string | null;
  username?: string | null;
  name: string;
  avatar?: string | null;
  createdAt: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}
