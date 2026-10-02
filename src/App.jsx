import { useEffect, useState } from 'react';
import RoomList from './pages/RoomList.jsx';
import RoomPage from './pages/RoomPage.jsx';

function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

// Each browser tab gets its own id, so you can test with several tabs or devices.
function getTabId() {
  let id = sessionStorage.getItem('pod-uid');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('pod-uid', id);
  }
  return id;
}

export default function App() {
  const hash = useHash();
  const [name, setName] = useState(() => sessionStorage.getItem('pod-name') || '');
  const [draft, setDraft] = useState('');

  if (!name) {
    const save = () => {
      const clean = draft.trim();
      if (!clean) return;
      sessionStorage.setItem('pod-name', clean);
      setName(clean);
    };
    return (
      <main className="center">
        <div className="card narrow">
          <h1>Join the study pods</h1>
          <p className="muted">Pick a display name. Use a different name in each tab or device to test.</p>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder="Your name"
            autoFocus
          />
          <button className="primary" onClick={save}>Continue</button>
        </div>
      </main>
    );
  }

  const user = { id: getTabId(), name };
  const match = hash.match(/^#\/room\/(.+)$/);
  return match ? <RoomPage roomId={match[1]} user={user} /> : <RoomList user={user} />;
}
