// Vercel serverless function: creates a LiveKit join token for one room.
import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  // CORS so the GitHub Pages site can call this function. Demo only: restrict the origin for real use.
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  const { room, identity, name } = req.query;
  if (!room || !identity) {
    return res.status(400).json({ error: 'room and identity are required' });
  }
  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = process.env;
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return res.status(500).json({ error: 'LiveKit keys are not set on the server' });
  }
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: String(identity),
    name: String(name || identity),
    ttl: '2h',
  });
  // The token only works for this one room, so each pod stays separate.
  at.addGrant({ roomJoin: true, room: String(room), canPublish: true, canSubscribe: true });
  res.status(200).json({ token: await at.toJwt() });
}
