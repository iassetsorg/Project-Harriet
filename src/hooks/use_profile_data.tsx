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
import eventService from "../services/event_service";
import { useRefreshTrigger } from "./use_refresh_trigger";

/**
 * Represents the structure of a user's profile data
 * @interface ProfileData
 * @property {string} ProfileTopic - Unique identifier for the profile's topic
 * @property {string} Name - User's display name
 * @property {string} Bio - User's biography or description
 * @property {string} Location - User's geographical location
 * @property {string} Website - User's website URL
 * @property {string} Picture - URL or hash of user's profile picture
 * @property {string} Banner - URL or hash of user's banner image
 * @property {string} UserMessages - Topic ID for user's messages
 */
interface ProfileData {
  ProfileTopic: string;
  Name: string;
  Bio: string;
  Location: string;
  Website: string;
  Picture: string;
  Banner: string;
  UserMessages: string;
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
  const { refreshTrigger, triggerRefresh } = useRefreshTrigger();
  /**
   * Decodes a Base64 encoded string using TextDecoder
   * @param {string} base64String - The Base64 encoded string to decode
   * @returns {string} The decoded string
   */
  const decodeBase64 = (base64String: string): string => {
    try {
      return new TextDecoder("utf-8").decode(
        Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0))
      );
    } catch (error) {
      console.error("Error decoding Base64:", error);
      return "";
    }
  };

  /**
   * Validates if a string matches the Hedera account ID format (shard.realm.number)
   * @param {string} accountId - The string to validate
   * @returns {boolean} True if the string matches the account ID format
   */
  const isValidAccountIdFormat = (accountId: string): boolean => {
    const parts = accountId.split(".");
    return parts.length === 3 && parts.every((part) => !isNaN(Number(part)));
  };

  /**
   * Fetches and filters NFT data to extract profile topic IDs
   * @returns {Promise<string[]>} Array of valid profile topic IDs
   * @throws {Error} If NFT data fetch fails
   */
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

  /**
   * Main function to fetch and process profile data from Hedera Mirror Node
   */
  const fetchProfileData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const profileTopics = await getProfileTopics();
      let data: any[] = [];

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
          try {
            const decodedMessage = decodeBase64(message.message);
            const parsedMessage = JSON.parse(decodedMessage);
            parsedMessage.ProfileTopic = topic;
            data.push(parsedMessage);
          } catch (error) {
            console.warn("Invalid message format:", message);
          }
        });
      }

      const processedData = data
        .map((d) => {
          try {
            return {
              ProfileTopic: d.ProfileTopic,
              Name: d.Name || "",
              Bio: d.Bio || "",
              Location: d.Location || "",
              Website: d.Website || "",
              Picture: d.Picture || "",
              Banner: d.Banner || "",
              UserMessages: d.UserMessages || "",
            };
          } catch (error) {
            console.warn("Error processing profile data:", error);
            return null;
          }
        })
        .filter((d): d is ProfileData => d !== null);

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

  /**
   * Effect hook to trigger profile data fetch when signing account changes
   * Runs only when signingAccount is available and changes
   */
  // Subscribe to refresh events
  useEffect(() => {
    const unsubscribe = eventService.subscribe("refreshExplorer", () => {
      triggerRefresh(); // This will trigger a global refresh
    });

    return () => unsubscribe(); // Add cleanup function
  }, [triggerRefresh]);

  useEffect(() => {
    if (signingAccount) {
      fetchProfileData();
    }
  }, [signingAccount, refreshTrigger]);

  return { profileData, isLoading, error };
};

export default useProfileData;
