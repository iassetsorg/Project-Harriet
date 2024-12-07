/**
 * UserProfile is a React component that displays user profile information and handles profile modal interactions.
 * - Displays a compact user preview with profile picture and name
 * - Opens a detailed modal with complete profile information
 * - Shows loading states and error handling
 * - Integrates with external services (HashScan)
 */

// UserProfile.tsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import useProfileData from "../../hooks/use_profile_data";
import { CiLocationOn } from "react-icons/ci";
import { IoIosInformationCircleOutline } from "react-icons/io";
import UserExplorer from "../explorer/user_explore";
import ReadMediaFile from "../media/read_media_file";

interface UserProfileProps {
  userAccountId: string; // The unique identifier for the user account
}

/**
 * UserProfile component displays user information and handles profile modal interactions
 * @param {string} userAccountId - The unique identifier for the user account
 * @returns {JSX.Element} Profile preview and modal with detailed user information
 */
const UserProfile = ({ userAccountId }: UserProfileProps) => {
  const { profileData, isLoading, error } = useProfileData(userAccountId);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  /**
   * Updates the profile checking state when loading is complete
   * Prevents premature "Profile NOT FOUND" messages
   */
  useEffect(() => {
    if (!isLoading) {
      setIsCheckingProfile(false);
    }
  }, [isLoading, profileData]);

  /**
   * Modal control functions for opening and closing the detailed profile view
   */
  const openUserProfileModal = () => {
    setIsUserProfileModalOpen(true);
  };

  const closeUserProfileModal = () => {
    setIsUserProfileModalOpen(false);
  };

  // Create portal content
  const modalContent = isUserProfileModalOpen && (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="relative w-full max-w-4xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-background rounded-lg shadow-xl overflow-y-auto max-h-[90vh] m-4">
          <div className="absolute top-4 right-4 z-50">
            <button
              type="button"
              className="group relative rounded-full mr-6 mt-4 w-7 h-7 bg-secondary/50 hover:bg-red-500 text-text/50 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 backdrop-blur-sm hover:scale-110 flex items-center justify-center"
              onClick={closeUserProfileModal}
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-4 w-4 transform group-hover:rotate-90 text-text transition-transform duration-300"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
              <div className="absolute inset-0 rounded-full group-hover:bg-gradient-to-tr from-red-600 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </button>
          </div>
          <div className="flex flex-col items-center w-full text-text p-0 sm:p-6 ">
            {isLoading && (
              <p className="text-xl font-semibold text-center text-primary/60 animate-pulse">
                Loading...
              </p>
            )}
            {error && (
              <p className="text-lg text-center text-red-500">{error}</p>
            )}

            {!isLoading && !profileData && !isCheckingProfile && (
              <div className="text-center p-10">
                <p className="text-lg mb-4 text-primary/60">
                  Profile NOT FOUND!
                </p>
              </div>
            )}

            {profileData && !isCheckingProfile && (
              <div className="theme-card">
                <div
                  className={`flex ${
                    profileData.Picture ? "flex-col md:flex-row" : ""
                  } items-center md:items-start md:space-x-6 mt-4`}
                >
                  {profileData.Picture && (
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto md:mx-0 mb-4 md:mb-0">
                      <ReadMediaFile cid={profileData.Picture} />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-3xl font-bold text-text">
                      {profileData.Name}
                    </p>
                    <p className="text-sm text-gray-500 hover:underline my-1">
                      <a
                        href={`https://hashscan.io/mainnet/account/${userAccountId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {userAccountId}
                      </a>
                    </p>

                    {profileData.Bio && (
                      <div className="flex items-center my-1">
                        <IoIosInformationCircleOutline className="text-lg text-text" />
                        <p className="text-md ml-1 text-text">
                          {profileData.Bio}
                        </p>
                      </div>
                    )}
                    {profileData.Location && (
                      <div className="flex items-center my-1">
                        <CiLocationOn className="text-lg text-text" />
                        <p className="text-sm ml-1 text-gray-500">
                          {profileData.Location}
                        </p>
                      </div>
                    )}
                    {profileData.Website && (
                      <p className="text-sm text-gray-500 hover:underline my-1">
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
            )}

            {!isLoading && profileData && !isCheckingProfile && (
              <div className="theme-card mt-6">
                <UserExplorer userAddress={userAccountId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div
        className="items-center cursor-pointer flex"
        onClick={openUserProfileModal}
      >
        {profileData && profileData.Picture && (
          <div className="w-10 h-10 rounded-full mr-2">
            <ReadMediaFile cid={profileData.Picture} />
          </div>
        )}
        <p className="text-lg font-semibold text-text">{profileData?.Name}</p>
      </div>

      {/* Render modal using portal */}
      {modalContent && ReactDOM.createPortal(modalContent, document.body)}
    </div>
  );
};

export default UserProfile;
