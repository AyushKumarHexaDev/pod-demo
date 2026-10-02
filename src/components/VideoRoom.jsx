import { useState } from 'react';
import { Track } from 'livekit-client';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks,
} from '@livekit/components-react';

function Tiles() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  return (
    <GridLayout tracks={tracks} style={{ height: '100%' }}>
      <ParticipantTile />
    </GridLayout>
  );
}

export default function VideoRoom({ roomId, user }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const join = async () => {
    setLoading(true);
    setError('');
    try {
      // On GitHub Pages there is no /api, so VITE_TOKEN_URL points to the token function hosted on Vercel.
      const tokenUrl = import.meta.env.VITE_TOKEN_URL || '/api/get-token';
      const url = `${tokenUrl}?room=${encodeURIComponent(roomId)}&identity=${encodeURIComponent(
        user.id
      )}&name=${encodeURIComponent(user.name)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not get a call token');
      setToken(data.token);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <section className="card">
        <h2>Video room</h2>
        <p className="muted">Join the call, then turn on your camera, microphone or screen share.</p>
        {error && <p className="error">{error}</p>}
        <button className="primary" onClick={join} disabled={loading}>
          {loading ? 'Connecting...' : 'Join video room'}
        </button>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Video room</h2>
      <LiveKitRoom
        serverUrl={import.meta.env.VITE_LIVEKIT_URL}
        token={token}
        connect
        video={false}
        audio={false}
        data-lk-theme="default"
        onDisconnected={() => setToken('')}
        onError={(e) => setError(e.message)}
      >
        <div className="stage">
          <Tiles />
        </div>
        <RoomAudioRenderer />
        <ControlBar controls={{ chat: false, settings: false }} />
      </LiveKitRoom>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
