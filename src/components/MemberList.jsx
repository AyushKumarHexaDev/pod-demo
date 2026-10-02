export default function MemberList({ members, selfId }) {
  return (
    <section className="card">
      <h2>In this pod ({members.length})</h2>
      <ul className="members">
        {members.map((m) => (
          <li key={m.id}>
            <span className="dot" />
            {m.name}
            {m.id === selfId && ' (you)'}
          </li>
        ))}
      </ul>
    </section>
  );
}
