import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient.js';

export default function ChatBox({ roomId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages([]);
    supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data, error }) => (error ? setError(error.message) : setMessages(data)));

    // Only messages for this room arrive here, so pods never mix.
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]))
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    const { error } = await supabase.from('messages').insert({ room_id: roomId, user_name: user.name, body });
    if (error) setError(error.message);
  };

  return (
    <section className="card chat">
      <h2>Pod chat</h2>
      <div className="messages">
        {messages.length === 0 && <p className="muted">No messages yet. Say hi.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.user_name === user.name ? 'mine' : ''}`}>
            <strong>{m.user_name}</strong>
            <p>{m.body}</p>
            <small className="muted">
              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </small>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Message your pod..."
        />
        <button className="primary" onClick={send}>Send</button>
      </div>
    </section>
  );
}
