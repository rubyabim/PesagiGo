import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
  exp?: number;
};

export function isTokenExpired(token: string) {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
