import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
  exp?: number;
};

export function isTokenExpired(token: string) {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) {
      return false;
    }
    const nowInSec = Math.floor(Date.now() / 1000);
    return decoded.exp <= nowInSec;
  } catch {
    return true;
  }
}
