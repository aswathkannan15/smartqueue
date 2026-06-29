import { useState } from 'react';
import IssueTokenForm from '../components/IssueTokenForm';
import QueueBoard from '../components/QueueBoard';

export default function CustomerPage() {
  // When a token is issued, show that counter's live board
  const [activeCounterId, setActiveCounterId] = useState(1);

  const handleTokenIssued = (token) => {
    setActiveCounterId(token.counterId);
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Welcome — Get Your Token</h2>

      <div style={styles.grid}>
        {/* Left: issue form */}
        <IssueTokenForm onTokenIssued={handleTokenIssued} />

        {/* Right: live queue board for selected counter */}
        <QueueBoard counterId={activeCounterId} />
      </div>
    </div>
  );
}

const styles = {
  page:    { maxWidth: '900px', margin: '0 auto' },
  heading: { marginBottom: '1.5rem', color: '#1e293b' },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem',
  },
};