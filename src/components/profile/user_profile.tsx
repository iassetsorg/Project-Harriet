// UserProfile.tsx
import React, { useState, useEffect } from "react";
import useProfileData from "../../hooks/use_profile_data";
import { CiLocationOn } from "react-icons/ci";
import { IoIosInformationCircleOutline } from "react-icons/io";
import UserExplorer from "../explorer/user_explore";
import ReadIPFSData from "../ipfs/read_ipfs_data";
import Modal from "../../common/modal";

const UserProfile = ({ userAccountId }: { userAccountId: string }) => {
  const { profileData, isLoading, error } = useProfileData(userAccountId);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsCheckingProfile(false);
    }
  }, [isLoading, profileData]);

  const openUserProfileModal = () => {
    setIsUserProfileModalOpen(true);
  };

  const closeUserProfileModal = () => {
    setIsUserProfileModalOpen(false);
  };

  return (
    <div>
      <div
        className="flex items-center cursor-pointer mb-3"
        onClick={openUserProfileModal}
      >
        {profileData && profileData.Picture && (
          <div className="w-10 h-10 rounded-full mr-2">
            <ReadIPFSData cid={profileData.Picture} />
          </div>
        )}
        <p className="text-lg font-semibold text-text">{profileData?.Name}</p>
      </div>

      {isUserProfileModalOpen && (
        <Modal isOpen={isUserProfileModalOpen} onClose={closeUserProfileModal}>
          <div className="flex flex-col items-center w-full bg-background text-text mt-3">
            <div className="w-full max-w-4xl p-6">
              {isLoading && (
                <p className="text-xl font-semibold text-center">Loading...</p>
              )}
              {error && (
                <p className="text-lg text-center text-red-500">{error}</p>
              )}

              {!isLoading && !profileData && !isCheckingProfile && (
                <div className="text-center p-10">
                  <p className="text-lg mb-4">Profile NOT FOUND!</p>
                </div>
              )}

              {profileData && !isCheckingProfile && (
                <div className="bg-background shadow-xl rounded-xl p-6 mb-6 relative">
                  <div
                    className={`flex ${
                      profileData.Picture ? "flex-col md:flex-row" : ""
                    } items-center md:items-start md:space-x-6 mt-4`}
                  >
                    {profileData.Picture && (
                      <div className="w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto md:mx-0 mb-4 md:mb-0">
                        <ReadIPFSData cid={profileData.Picture} />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-3xl font-bold text-text">
                        {profileData.Name}
                      </p>
                      <p className="text-sm text-blue-300 hover:underline my-1">
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
                          <p className="text-sm ml-1 text-gray-400">
                            {profileData.Location}
                          </p>
                        </div>
                      )}
                      {profileData.Website && (
                        <p className="text-sm text-blue-300 hover:underline my-1">
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
                <div className="w-full max-w-4xl shadow-xl rounded-xl bg-background border border-secondary">
                  <UserExplorer />
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserProfile;
