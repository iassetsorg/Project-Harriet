/**
 * Profile is a React component that handles the display and management of user profiles.
 * It provides functionality to:
 * - View existing profile information
 * - Create a new profile if none exists
 * - Update existing profile information
 * - Display user's media and activity
 */

import React, { useState, useEffect } from "react";
import useProfileData from "../../hooks/use_profile_data";
import { CiLocationOn } from "react-icons/ci";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { AiFillEdit } from "react-icons/ai";
import { MdOutlinePermMedia } from "react-icons/md";
import CreateProfile from "./create_new_profile";
import UpdateProfile from "./update_profile";
import Modal from "../../common/modal";
import UserExplorer from "../explorer/user_explore";
import ReadMediaFile from "../media/read_media_file";
import { useWalletContext } from "../../wallet/WalletContext";
import { useAccountId } from "@buidlerlabs/hashgraph-react-wallets";
import LinkAndHashtagReader from "../../common/link_and_hashtag_reader";
import SEOHead from "../common/SEOHead";
import { generateSEOConfig, generateDynamicSEO } from "../../common/seo.config";

/**
 * Main Profile component that orchestrates the display and management of user profiles
 * @returns {JSX.Element} The rendered Profile component
 */
const Profile: React.FC = () => {
  const { isConnected } = useWalletContext();
  const { data: accountId } = useAccountId();
  const { profileData, isLoading, error } = useProfileData(accountId);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] =
    useState(false);
  const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] =
    useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  /**
   * Handlers for closing different modal windows
   * These functions ensure clean state management when modals are dismissed
   */
  const closeCreateProfileModal = () => {
    setIsCreateProfileModalOpen(false);
  };

  const closeUpdateProfileModal = () => {
    setIsUpdateProfileModalOpen(false);
  };

  const closeMediaModal = () => {
    setIsMediaModalOpen(false);
  };

  /**
   * Effect hook to update profile checking state
   * Transitions from loading to ready state once profile data is available
   */
  useEffect(() => {
    if (!isLoading) {
      setIsCheckingProfile(false);
    }
  }, [isLoading, profileData]);

  // Generate SEO configuration for profile page
  const profileSEO = profileData
    ? generateDynamicSEO(
        `${profileData.Name || "User"} Profile`,
        `View ${profileData.Name || "user"}'s profile on iBird. ${
          profileData.Bio ||
          "Decentralized social media profile on Hedera Hashgraph."
        }`,
        profileData.Picture,
        `/Profile`
      )
    : generateSEOConfig("profile");

  return (
    <>
      <SEOHead seoConfig={profileSEO} />
      <div className="relative flex flex-col w-full h-[calc(100vh-4rem)]">
        <div className="flex-1 overflow-y-auto w-full bg-background text-text">
          <div className="flex flex-col items-center w-full">
            <div className="w-full max-w-4xl p-6">
              {/* Loading State
               * Displays a pulsing loading indicator while profile data is being fetched
               */}
              {isLoading && (
                <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
                  <div className="text-primary/60 animate-pulse">
                    Loading...
                  </div>
                </div>
              )}

              {/* Error State
               * Displays error message if profile data fetch fails
               */}
              {error && (
                <div className="text-lg text-center text-red-500">{error}</div>
              )}

              {/* No Profile State
               * Displays create profile prompt when user has no existing profile
               */}
              {!isLoading && !profileData && !isCheckingProfile && (
                <div className="theme-card text-center p-10">
                  <p className="text-lg mb-6 text-text">
                    You don't have a profile!
                  </p>
                  <button
                    className="px-6 py-2 font-medium text-secondary bg-primary rounded-lg hover:bg-primary/90 transition-colors duration-200"
                    onClick={() => setIsCreateProfileModalOpen(true)}
                  >
                    Create Profile
                  </button>
                </div>
              )}

              {/* Existing Profile Display
               * Renders the user's profile information when available
               * Includes:
               * - Profile picture
               * - Basic information (name, account ID)
               * - Bio
               * - Location
               * - Website
               * - Edit functionality
               */}
              {profileData && !isCheckingProfile && isConnected && (
                <div className="theme-card">
                  <button
                    className="absolute top-6 right-6 p-2 rounded-lg hover:bg-secondary/30 transition-colors duration-200"
                    onClick={() => setIsUpdateProfileModalOpen(true)}
                  >
                    <AiFillEdit className="text-2xl text-text" />
                  </button>

                  <div className="flex flex-col lg:flex-row gap-6">
                    {profileData.Picture && (
                      <div className="w-48 h-48 rounded-xl overflow-hidden">
                        <ReadMediaFile cid={profileData.Picture} />
                      </div>
                    )}

                    <div className="flex-1 space-y-4">
                      <h1 className="text-4xl font-bold text-text">
                        {profileData.Name}
                      </h1>

                      <p className="text-sm text-gray-500 hover:underline">
                        <a
                          href={`https://hashscan.io/mainnet/account/${accountId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {accountId}
                        </a>
                      </p>

                      {profileData.Bio && (
                        <div className="flex items-start gap-2">
                          <p className="text-md text-text whitespace-pre-line">
                            <LinkAndHashtagReader message={profileData.Bio} />
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4">
                        {profileData.Location && (
                          <div className="flex items-center gap-2">
                            <CiLocationOn className="text-lg text-text" />
                            <p className="text-sm text-gray-500">
                              {profileData.Location}
                            </p>
                          </div>
                        )}

                        {profileData.Website && (
                          <p className="text-sm text-gray-500 hover:underline">
                            <a
                              href={profileData.Website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {profileData.Website}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* User Activity Section
               * Displays user's activity and media through UserExplorer component
               */}
              {!isLoading && profileData && !isCheckingProfile && (
                <div className="theme-card  mt-6">
                  <UserExplorer userAddress={accountId} />
                </div>
              )}

              {/* Modal Components
               * Conditional rendering of various modal windows for profile management
               */}
              {isCreateProfileModalOpen && (
                <Modal
                  isOpen={isCreateProfileModalOpen}
                  onClose={closeCreateProfileModal}
                >
                  <CreateProfile onClose={closeCreateProfileModal} />
                </Modal>
              )}
              {isUpdateProfileModalOpen && (
                <Modal
                  isOpen={isUpdateProfileModalOpen}
                  onClose={closeUpdateProfileModal}
                >
                  <UpdateProfile onClose={closeUpdateProfileModal} />
                </Modal>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
