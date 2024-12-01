/**
 * Main application component that handles routing and layout structure.
 * Provides wallet context to the entire application and manages navigation
 * between different views.
 */

import React from "react";
import { WalletProvider } from "./wallet/WalletContext";
import { useWalletContext } from "./wallet/WalletContext";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";
import useProfileData from "./hooks/use_profile_data";
import Wallet from "./wallet/wallet";

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
  const { profileData, isLoading } = useProfileData(accountId);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (
      !isLoading &&
      isConnected &&
      !profileData &&
      location.pathname !== "/Profile"
    ) {
      navigate("/Profile");
    }
  }, [isConnected, profileData, isLoading, navigate, location]);

  return <>{children}</>;
};

/**
 * Root component of the application.
 * Implements the main layout structure and routing configuration.
 * @returns {JSX.Element} The complete application structure
 */
const App = () => {
  return (
    <WalletProvider>
      <main className="bg-background">
        <Router>
          <ProfileCheck>
            <Navbar />
            <div className="flex ">
              <Sidebar />
              <Routes>
                <Route path="/" element={<Navigate to="/Explore" replace />} />
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
  );
};

export default App;
