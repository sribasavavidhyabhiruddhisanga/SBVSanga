export const GOOGLE_CLIENT_ID = '1985573387-kvmrn1nm19t9hrm0iqelnc4bn67lblo1.apps.googleusercontent.com';

export interface GoogleIdTokenClaims {
  email: string;
  name?: string;
  picture?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

/** Decodes a Google Identity Services credential's payload — no signature check, display use only. */
export function decodeGoogleIdToken(token: string): GoogleIdTokenClaims | null {
  const base64Url = token?.split('.')[1];
  if (!base64Url) {
    return null;
  }

  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  const jsonPayload = decodeURIComponent(
    atob(padded)
      .split('')
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(''),
  );

  return JSON.parse(jsonPayload);
}
