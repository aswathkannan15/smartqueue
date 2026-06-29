import { useQueueSocket } from "../hooks/useQueueSocket";
import { useEffect, useState } from "react";
import axios from "axios";

export default function QueueBoard({ counterId }) {
  const { queueData, connected } = useQueueSocket(counterId);
  const [status, setStatus] = useState(null);

  // Load initial state via REST on first render
  useEffect(() => {
    axios.get(`/api/queue/status/${counterId}`)
      .then(res => setStatus(res.data));
  }, [counterId]);

  // Whenever WebSocket sends an update, override the REST data
  useEffect(() => {
    if (queueData) {
      setStatus(prev => ({
        ...prev,
        nowServing:    queueData.nowServing,
        totalWaiting:  queueData.totalWaiting,
      }));
    }
  }, [queueData]);

  if (!status) return <div>Loading...</div>;

  return (
    <div className="queue-board">

      {/* Connection indicator */}
      <div className={`dot ${connected ? "green" : "red"}`}>
        {connected ? "● LIVE" : "○ Reconnecting..."}
      </div>

      {/* The big "Now Serving" display */}
      <div className="now-serving">
        <p>NOW SERVING</p>
        <h1>{status.nowServing}</h1>
      </div>

      {/* Counter info */}
      <div className="counter-info">
        <h3>{status.counterName}</h3>
        <p>{status.totalWaiting} waiting</p>
      </div>

      {/* Waiting list */}
      <div className="waiting-list">
        {status.waitingTokens?.map((t, i) => (
          <div key={t.id} className={`token-row priority-${t.priority.toLowerCase()}`}>
            <span>#{i + 1}</span>
            <span>{t.tokenNumber}</span>
            <span className="badge">{t.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
}