import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/context.types";

const secret = process.env.JWT_SECRET!;
const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
}
