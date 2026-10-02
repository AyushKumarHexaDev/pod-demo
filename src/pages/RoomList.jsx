import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient.js';

export default function RoomList({ user }) {
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => (error ? setError(error.message) : setRooms(data)));

    const channel = supabase
      .channel('rooms-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rooms' }, (payload) =>
        setRooms((prev) => (prev.some((r) => r.id === payload.new.id) ? prev : [payload.new, ...prev]))
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const createRoom = async () => {
    if (!name.trim()) return;
    const { data, error } = await supabase
      .from('rooms')
      .insert({ name: name.trim(), topic: topic.trim() })
      .select()
      .single();
    if (error) return setError(error.message);
    window.location.hash = `#/room/${data.id}`;
  };

  return (
    <main className="page">
      <header className="top">
        <h1>Study pods</h1>
        <span className="muted">Signed in as {user.name}</span>
      </header>

      <section className="card">
        <h2>Create a pod</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Pod name, e.g. DSA Sprint" />
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (optional)" />
        <button className="primary" onClick={createRoom}>Create pod</button>
      </section>

      {error && <p className="error">{error}</p>}
      {rooms.length === 0 && !error && <p className="muted">No pods yet. Create the first one.</p>}

      <section className="grid">
        {rooms.map((r) => (
          <a key={r.id} className="card room" href={`#/room/${r.id}`}>
            <h3>{r.name}</h3>
            <p className="muted">{r.topic || 'No topic set'}</p>
            <span className="primary-text">Join pod</span>
          </a>
        ))}
      </section>
    </main>
  );
}
