/**
 * Custom hook to fetch profile data for a Hedera account from MirrorNode.
 * Retrieves the account's NFTs to get the profile topics, then fetches the
 * latest message from each topic to build the profile data object. Handles
 * loading and error state.
 *
 * @param signingAccount - The Hedera account ID to load profile data for
 * @returns Object with profileData, isLoading, and error values
 */
import { useState, useEffect } from "react";

interface ProfileData {
  ProfileTopic: string;
  Name: string;
  Bio: string;
  Location: string;
  Website: string;
  Picture: string;
  Banner: string;
  Threads: string;
}

/**
 * Custom hook to fetch profile data for a Hedera account from MirrorNode.
 * Retrieves the account's NFTs to get the profile topics, then fetches the
 * latest message from each topic to build the profile data object. Handles
 * loading and error state.
 */
const useProfileData = (signingAccount: string) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const decodeBase64 = (base64String: string): string => {
    try {
      return atob(base64String);
    } catch (error) {
      console.error("Error decoding Base64:", error);
      return "";
    }
  };

  const isValidAccountIdFormat = (accountId: string): boolean => {
    const parts = accountId.split(".");
    return parts.length === 3 && parts.every((part) => !isNaN(Number(part)));
  };

  const getProfileTopics = async (): Promise<string[]> => {
    let profileTopics: string[] = [];
    try {
      const response = await fetch(
        `https://mainnet.mirrornode.hedera.com/api/v1/accounts/${signingAccount}/nfts?limit=100`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch NFT data");
      }

      const data = await response.json();
      const nfts = data.nfts;
      nfts.forEach((nft: any) => {
        const metadata = nft.metadata;
        const decodedMetadata = decodeBase64(metadata);
        if (isValidAccountIdFormat(decodedMetadata)) {
          profileTopics.push(decodedMetadata);
        }
      });
    } catch (error) {
      console.error("Error fetching NFT data:", error);
      throw error;
    }
    return profileTopics;
  };

  const fetchProfileData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const profileTopics = await getProfileTopics();
      let data: any[] = []; // Define the type according to your data structure
      for (const topic of profileTopics) {
        const response = await fetch(
          `https://mainnet.mirrornode.hedera.com/api/v1/topics/${topic}/messages?order=desc`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const messagesData = await response.json();
        const messages = messagesData.messages;
        messages.forEach((message: any) => {
          const decodedMessage = decodeBase64(message.message);
          const parsedMessage = JSON.parse(decodedMessage);
          parsedMessage.ProfileTopic = topic;
          data.push(parsedMessage);
        });
      }

      const processedData = data.map((d) => ({
        ProfileTopic: d.ProfileTopic,
        Name: d.Name,
        Bio: d.Bio,
        Location: d.Location,
        Website: d.Website,
        Picture: d.Picture,
        Banner: d.Banner,
        Threads: d.Threads,
      }));

      if (processedData.length > 0) {
        setProfileData(processedData[0]);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setError("Failed to load profile data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (signingAccount) {
      fetchProfileData();
    }
  }, [signingAccount]);

  return { profileData, isLoading, error };
};

export default useProfileData;
