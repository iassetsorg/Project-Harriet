/**
 * Main application component that handles routing and layout structure.
 * Provides wallet context to the entire application and manages navigation
 * between different views.
 */

import React, { useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { WalletProvider } from "./wallet/WalletContext";
import { useWalletContext } from "./wallet/WalletContext";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";
import useProfileData from "./hooks/use_profile_data";
import SEOHead from "./components/common/SEOHead";
import { defaultSEO } from "./common/seo.config";

import Navbar from "./layouts/navbar";

import Explorer from "./components/explorer/explorer";
import { Sidebar } from "./layouts/Sidebar";

import ReadSharedThread from "./components/read shared message/read_shared_thread";
import ReadSharedPost from "./components/read shared message/read_shared_post";
import ReadSharedPoll from "./components/read shared message/read_shared_poll";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import BottomBar from "./layouts/BottomBar";
import { NewMessage } from "./components/sending message/new_message";

import Profile from "./components/profile/profile";

import NotFoundPage from "./components/404";

/**
 * ProfileCheck component that handles redirection logic
 */
const ProfileCheck = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useWalletContext();
  const { data: accountId } = useAccountId();
  const { profileData, isLoading } = useProfileData(accountId || "");
  const navigate = useNavigate();
  const location = useLocation();
  const [hasDelayed, setHasDelayed] = useState(false);

  // Handle the initial delay after connection
  React.useEffect(() => {
    if (isConnected && accountId && !hasDelayed) {
      const timer = setTimeout(() => {
        setHasDelayed(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, accountId, hasDelayed]);

  // Handle profile check and navigation
  React.useEffect(() => {
    console.log("Profile check running:", {
      isConnected,
      accountId,
      hasDelayed,
      isLoading,
      hasProfile: !!profileData,
      currentPath: location.pathname,
      profileData,
    });

    // Only proceed if we have delayed, have an accountId and the wallet is connected
    if (isConnected && accountId && hasDelayed && !isLoading) {
      // If no profile data exists and not already on profile page, redirect
      if (!profileData && location.pathname !== "/Profile") {
        navigate("/Profile");
      }
    }
  }, [
    isConnected,
    accountId,
    profileData,
    isLoading,
    navigate,
    location,
    hasDelayed,
  ]);

  // Reset hasDelayed when wallet disconnects
  React.useEffect(() => {
    if (!isConnected) {
      setHasDelayed(false);
    }
  }, [isConnected]);

  return <>{children}</>;
};

/**
 * Root component of the application.
 * Implements the main layout structure and routing configuration.
 * @returns {JSX.Element} The complete application structure
 */
const App = () => {
  return (
    <HelmetProvider>
      <WalletProvider>
        <main className="bg-background">
          <SEOHead seoConfig={defaultSEO} />
          <Router>
            <ProfileCheck>
              <Navbar />
              <div className="flex ">
                <Sidebar />
                <Routes>
                  <Route
                    path="/"
                    element={<Navigate to="/Explore" replace />}
                  />
                  <Route
                    path="/Project-Harriet"
                    element={<Navigate to="/Explore" replace />}
                  />
                  <Route path="/Explore" element={<Explorer />} />
                  <Route path="/Profile" element={<Profile />} />
                  <Route
                    path="/Threads/:topicId"
                    element={<ReadSharedThread />}
                  />
                  <Route path="/Polls/:topicId" element={<ReadSharedPoll />} />
                  <Route
                    path="/Posts/:sequenceNumber"
                    element={<ReadSharedPost />}
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>

              <BottomBar />
              <NewMessage />
            </ProfileCheck>
          </Router>
        </main>
      </WalletProvider>
    </HelmetProvider>
  );
};

export default App;
