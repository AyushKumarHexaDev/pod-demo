import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient.js';
import ChatBox from '../components/ChatBox.jsx';
import VideoRoom from '../components/VideoRoom.jsx';
import MemberList from '../components/MemberList.jsx';

export default function RoomPage({ roomId, user }) {
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    supabase.from('rooms').select('*').eq('id', roomId).single().then(({ data }) => setRoom(data));
  }, [roomId]);

  // Presence: shows who is currently inside this pod.
  useEffect(() => {
    const channel = supabase.channel(`presence:${roomId}`, { config: { presence: { key: user.id } } });
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setMembers(Object.entries(state).map(([id, list]) => ({ id, name: list[0].name })));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') await channel.track({ name: user.name });
      });
    return () => supabase.removeChannel(channel);
  }, [roomId, user.id, user.name]);

  return (
    <main className="page">
      <header className="top">
        <a href="#/" className="muted">Back to all pods</a>
        <h1>{room ? room.name : 'Loading pod...'}</h1>
        {room?.topic && <p className="muted">{room.topic}</p>}
      </header>

      <VideoRoom roomId={roomId} user={user} />
      <MemberList members={members} selfId={user.id} />
      <ChatBox roomId={roomId} user={user} />
    </main>
  );
}
