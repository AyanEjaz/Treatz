import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleUserPayload {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}

export async function verifyGoogleToken(
  idToken: string
): Promise<GoogleUserPayload> {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new Error("Invalid Google token");
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split("@")[0],
    avatar: payload.picture,
  };
}
