export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  createdAt: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}
