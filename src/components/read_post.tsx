import React, { useState, useEffect } from "react";
import Spinner from "../utils/Spinner"; // Adjust the import path as needed

function ReadPost({ sequenceNumber }: { sequenceNumber: string }) {
  const [message, setMessage] = useState("");
  const [sender, setSender] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      let apiUrl = `https://mainnet.mirrornode.hedera.com/api/v1/topics/0.0.4320596/messages?sequencenumber=${sequenceNumber}`;
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Network response was not ok.");
        const data = await response.json();
        setSender(data.messages[0].payer_account_id);

        const decodedMessage = new TextDecoder("utf-8").decode(
          Uint8Array.from(atob(data.messages[0].message), (c) =>
            c.charCodeAt(0)
          )
        );

        const { Message } = JSON.parse(decodedMessage);
        setMessage(Message);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sequenceNumber]); // Dependency array

  if (loading) return <Spinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 border border-secondary rounded bg-background">
      <p className="text-sm mb-1 text-text">{sender}</p>
      <p className="mb-3 text-text whitespace-pre-line">{message}</p>
    </div>
  );
}

export default ReadPost;
