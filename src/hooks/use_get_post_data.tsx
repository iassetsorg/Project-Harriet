import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface PostData {
  sender: string;
  Message: string;
  Media?: string;
  Identifier?: string;
  Author?: string;
  Like_to?: string;
  DisLike_to?: string;
  Reply_to?: string;
  Thread?: string;
  Status?: string;
  Type?: string;
  Name?: string;
  Bio?: string;
  Website?: string;
  Location?: string;
  UserMessages?: string;
  Followings?: string;
  Picture?: string;
  Banner?: string;
  Post?: string;
  Poll?: string;
  Choice?: string;
  Choice1?: string;
  Choice2?: string;
  Choice3?: string;
  Choice4?: string;
  Choice5?: string;
  message_id?: string;
  sequence_number?: string;
  consensus_timestamp?: string;
}

const useGetPostData = (sequenceNumber: string | undefined) => {
  const [postData, setPostData] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!sequenceNumber) {
        setError("Sequence number is undefined");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://mainnet.mirrornode.hedera.com/api/v1/topics/${process.env.REACT_APP_EXPLORER_TOPIC}/messages/${sequenceNumber}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        const decodedMessage = new TextDecoder("utf-8").decode(
          Uint8Array.from(atob(data.message), (c) => c.charCodeAt(0))
        );
        const { Message, Media } = JSON.parse(decodedMessage);

        const cleanedData = {
          sender: data.payer_account_id,
          Message,
          Media,
          message_id: data.consensus_timestamp,
          sequence_number: data.sequence_number,
          consensus_timestamp: data.consensus_timestamp,
        };
        setPostData(cleanedData);
      } catch (error: any) {
        setError("Failed to fetch post data");
        toast.error(`Failed to fetch the post data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sequenceNumber]);

  return { postData, loading, error };
};

export default useGetPostData;
