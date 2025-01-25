/**
 * UserExplorer is a component that displays messages from a specific user with infinite scroll.
 * Features:
 * - User-specific message loading
 * - Infinite scroll pagination
 * - Multiple message type support (Post, Thread, Poll)
 * - Loading states and transitions
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import useGetData from "../../hooks/use_get_data";
import Spinner from "../../common/Spinner";
import ReadThread from "../read message/read_thread";
import ReadPost from "../read message/read_post";
import ReadPoll from "../read message/read_poll";
import useProfileData from "../../hooks/use_profile_data";
import { TransitionGroup, CSSTransition } from "react-transition-group";

/**
 * Props interface for UserExplorer
 * @property {string} userAddress - The address/ID of the user whose messages to display
 */
interface UserExplorerProps {
  userAddress: string;
}

/**
 * UserExplorer component fetches and displays messages from a specific user.
 * Uses Intersection Observer API for infinite scrolling functionality.
 */
function UserExplorer({ userAddress }: UserExplorerProps) {
  // Fetch user profile data including their messages topic ID
  const { profileData, isLoading, error } = useProfileData(userAddress);
  const explorerTopicID = profileData?.UserMessages;

  // Custom hook for fetching message data
  const { messages, loading, fetchMessages, nextLink } = useGetData(
    explorerTopicID,
    null,
    true
  );

  // State management
  const [allMessages, setAllMessages] = useState<typeof messages>([]); // Accumulated messages
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Loading state for pagination

  // Reference for intersection observer
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Add new state for tracking scroll position
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Add new loading state for pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Initial data fetch when topic ID is available
   * Triggered when profile data is loaded
   */
  useEffect(() => {
    if (explorerTopicID) {
      fetchMessages(explorerTopicID);
    }
  }, [explorerTopicID]);

  /**
   * Intersection Observer callback
   * Handles infinite scroll loading when user reaches bottom of content
   */
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && nextLink && !isLoadingMore) {
        setIsLoadingMore(true);
        fetchMessages(nextLink);
      }
    },
    [nextLink, fetchMessages, isLoadingMore]
  );

  /**
   * Sets up the Intersection Observer
   * Monitors scroll position to trigger loading more content
   */
  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "100px", // Increased margin to trigger earlier
      threshold: 0.5, // Reduced threshold to trigger sooner
    };

    const observer = new IntersectionObserver(handleObserver, option);
    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [handleObserver]);

  /**
   * Updates allMessages state when new messages are fetched
   * Filters out duplicates and appends new messages
   */
  useEffect(() => {
    if (messages.length > 0) {
      setAllMessages((prevMessages) => {
        const newMessages = messages.filter(
          (message) =>
            !prevMessages.some(
              (prevMessage) => prevMessage.message_id === message.message_id
            )
        );
        return [...prevMessages, ...newMessages];
      });
      setIsLoadingMore(false);
    }
  }, [messages]);

  // Modify the scroll handler
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const element = e.currentTarget;
      setScrollTop(element.scrollTop);

      // Trigger refresh when scrolling up at the top
      if (element.scrollTop === 0 && scrollTop > 0 && explorerTopicID) {
        setIsRefreshing(true);
        fetchMessages(explorerTopicID).finally(() => {
          setIsRefreshing(false);
        });
      }
    },
    [explorerTopicID, fetchMessages, scrollTop]
  );

  return (
    <div className="bg-background rounded-xl py-1">
      <h1 className="text-2xl mt-1 ml-8 font-semibold text-text mb-4">
        Messages
      </h1>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative w-full h-screen text-text shadow-xl
        overflow-y-scroll"
      >
        {/* Pull to refresh indicator */}
        {isRefreshing && (
          <div className="sticky top-0 z-10 -mt-6 pt-2 pb-2 bg-background">
            <Spinner />
          </div>
        )}

        {/* Initial loading state */}
        {loading && allMessages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        )}

        {/* Message list with transition animations */}
        <TransitionGroup className="space-y-6">
          {allMessages.map((message) => {
            // Common props shared between all message types
            const commonProps = {
              key: message.message_id,
              message_id: message.message_id,
              sender: message.sender,
              sequence_number: message.sequence_number.toString(),
              consensus_timestamp:
                message.consensus_timestamp?.toString() || "0",
            };

            // Render different components based on message type
            return (
              <CSSTransition
                key={message.message_id}
                timeout={300}
                classNames="fade"
              >
                <div>
                  {message.Type === "Post" && (
                    <ReadPost
                      sequence_number={message.sequence_number.toString()}
                    />
                  )}
                  {message.Type === "Thread" && (
                    <ReadThread {...commonProps} topicId={message.Thread} />
                  )}
                  {message.Type === "Poll" && (
                    <ReadPoll {...commonProps} topicId={message.Poll} />
                  )}
                </div>
              </CSSTransition>
            );
          })}
        </TransitionGroup>

        {/* Move the observer ref higher in the DOM */}
        <div ref={observerRef} className="h-10" />

        {/* Loading indicator for next page */}
        {isLoadingMore && nextLink && (
          <div className="flex items-center justify-center py-4">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
}

export default UserExplorer;
