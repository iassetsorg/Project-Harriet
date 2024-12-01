/**
 * Explorer is a component that implements infinite scrolling to display messages.
 * Features:
 * - Infinite scroll loading
 * - Message type handling (Post, Thread, Poll)
 * - Loading states with spinner
 * - Animated message transitions
 */

import React, { useEffect, useRef, useCallback, useState } from "react";
import useGetData from "../../hooks/use_get_data";
import Spinner from "../../common/Spinner";
import ReadThread from "../read message/read_thread";
import ReadPost from "../read message/read_post";
import ReadPoll from "../read message/read_poll";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import eventService from "../../services/event_service";
import { useRefreshTrigger } from "../../hooks/use_refresh_trigger";

/**
 * Explorer component fetches and displays messages with infinite scroll functionality.
 * Uses Intersection Observer API to detect when to load more content.
 */
function Explorer() {
  // Get topic ID from environment variables
  const explorerTopicID = process.env.REACT_APP_EXPLORER_TOPIC || "";
  const { refreshTrigger, triggerRefresh } = useRefreshTrigger();

  // Custom hook for fetching message data
  const { messages, loading, fetchMessages, nextLink } = useGetData(
    explorerTopicID,
    null,
    true
  );

  // State management
  const [allMessages, setAllMessages] = useState<typeof messages>([]); // Accumulated messages
  const [isLoading, setIsLoading] = useState(false); // Loading state for next page

  // Reference for intersection observer
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Add new state for tracking scroll position
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Add new loading state for pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modify the scroll handler
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const element = e.currentTarget;
      setScrollTop(element.scrollTop);

      // Trigger refresh when scrolling up at the top
      if (element.scrollTop === 0 && scrollTop > 0) {
        setIsRefreshing(true);
        setAllMessages([]); // Clear existing messages
        fetchMessages(explorerTopicID).finally(() => {
          setIsRefreshing(false);
        });
      }
    },
    [explorerTopicID, fetchMessages, scrollTop]
  );

  // Initial data fetch
  useEffect(() => {
    setAllMessages([]); // Clear existing messages on refresh
    fetchMessages(explorerTopicID);
  }, [refreshTrigger]); // Add refreshTrigger as a dependency

  /**
   * Intersection Observer callback
   * Triggers when the observer element becomes visible
   * Used to implement infinite scrolling
   */
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && nextLink) {
        setIsLoading(true);
        fetchMessages(nextLink);
      }
    },
    [nextLink, fetchMessages]
  );

  /**
   * Sets up the Intersection Observer
   * Monitors when user scrolls near the bottom of the content
   */
  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "0px",
      threshold: 0.8, // Trigger when 80% of the page is visible
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
      setIsLoading(false);
    }
  }, [messages]);

  // Subscribe to refresh events
  useEffect(() => {
    const unsubscribe = eventService.subscribe("refreshExplorer", () => {
      triggerRefresh(); // This will trigger a global refresh
    });

    return () => unsubscribe();
  }, [triggerRefresh]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="relative w-full h-screen overflow-y-scroll bg-background p-6 text-text"
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
            consensus_timestamp: message.consensus_timestamp?.toString() || "0",
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
                    {...commonProps}
                    message={message.Message}
                    media={message.Media}
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

      {/* Intersection observer target element */}
      <div ref={observerRef}></div>

      {/* Loading indicator for next page */}
      {isLoading && (
        <div className="flex items-center justify-center mt-4">
          <Spinner />
        </div>
      )}
    </div>
  );
}

export default Explorer;
