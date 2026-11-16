const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64Decode(input: string): string {
  const str = input.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  let out = '';
  let bits = 0;
  let acc = 0;
  for (const ch of str) {
    const v = CHARS.indexOf(ch);
    if (v < 0) continue;
    acc = (acc << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out += String.fromCharCode((acc >> bits) & 0xff);
    }
  }
  return out;
}

export function decodeJwt(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(base64Decode(payload));
  } catch {
    return null;
  }
}
