import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export function useQueueSocket(counterId) {
  const [queueData, setQueueData]   = useState(null);
  const [connected, setConnected]   = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    // 1. Create the STOMP client
    const client = new Client({
      // SockJS creates the connection to our Spring Boot server
      webSocketFactory: () => new SockJS(
  (process.env.REACT_APP_API_URL || 'http://localhost:8080') + '/ws'
),
      onConnect: () => {
        setConnected(true);
        console.log("Connected to SmartQueue WebSocket");

        // 2. Subscribe to this counter's channel
        client.subscribe(`/topic/queue/${counterId}`, (message) => {
          // 3. Every time server broadcasts, update state
          const event = JSON.parse(message.body);
          setQueueData(event);
        });
      },

      onDisconnect: () => {
        setConnected(false);
        console.log("Disconnected");
      },

      // Retry connection every 5 seconds if dropped
      reconnectDelay: 5000,
    });

    // 4. Open the connection
    client.activate();
    clientRef.current = client;

    // 5. Cleanup when component unmounts
    return () => client.deactivate();
  }, [counterId]);

  return { queueData, connected };
}