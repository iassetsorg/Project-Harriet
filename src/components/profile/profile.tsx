import React, { useState, useEffect } from "react";
import useProfileData from "../../hooks/use_profile_data";
import { useHashConnectContext } from "../../hashconnect/hashconnect";
import { CiLocationOn } from "react-icons/ci";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { AiFillEdit } from "react-icons/ai";
import { MdOutlinePermMedia } from "react-icons/md";
import CreateProfile from "./create_new_profile";
import UpdateProfile from "./update_profile";
import Modal from "../../common/modal";
import UserExplorer from "../explorer/user_explore";
import ReadMediaFile from "../media/read_media_file";
const Profile: React.FC = () => {
  const { state, pairingData, disconnect } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
  const { profileData, isLoading, error } = useProfileData(signingAccount);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] =
    useState(false);
  const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] =
    useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const closeCreateProfileModal = () => {
    setIsCreateProfileModalOpen(false);
  };

  const closeUpdateProfileModal = () => {
    setIsUpdateProfileModalOpen(false);
  };

  const closeMediaModal = () => {
    setIsMediaModalOpen(false);
  };

  useEffect(() => {
    if (!isLoading) {
      setIsCheckingProfile(false);
    }
  }, [isLoading, profileData]);

  return (
    <div className="flex flex-col items-center w-full bg-background text-text">
      <div className="w-full max-w-4xl p-6">
        {isLoading && (
          <p className="text-xl font-semibold text-center">Loading...</p>
        )}

        {error && <p className="text-lg text-center text-red-500">{error}</p>}

        {!isLoading && !profileData && !isCheckingProfile && (
          <div className="text-center p-10">
            <p className="text-lg mb-4">You don't have a profile.</p>
            <button
              className="p-3 font-semibold text-background bg-primary rounded-full hover:bg-accent transition duration-300"
              onClick={() => setIsCreateProfileModalOpen(true)}
            >
              Create Profile
            </button>
          </div>
        )}

        {profileData && !isCheckingProfile && state === "Paired" && (
          <div className="bg-background shadow-xl rounded-xl p-6 mb-6 relative">
            {/* {profileData.Banner && (
              <div className="w-full h-auto rounded-t-xl">
                <ReadIPFSData cid={profileData.Banner} />
              </div>
            )} */}
            {/* 
            {profileData.Picture && (
              <button
                className="absolute top-4 right-4 text-secondary hover:text-background"
                onClick={() => setIsMediaModalOpen(true)}
              >
                <MdOutlinePermMedia className="text-xl text-text" />
              </button>
            )} */}
            <button
              className="absolute top-4 right-12 text-secondary hover:text-background"
              onClick={() => setIsUpdateProfileModalOpen(true)}
            >
              <AiFillEdit className="text-xl text-text" />
            </button>

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
                <p className="text-sm text-blue-300 hover:underline my-1">
                  <a
                    href={`https://hashscan.io/mainnet/account/${signingAccount}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {signingAccount}
                  </a>
                </p>
                {profileData.Bio && (
                  <div className="flex items-center my-1">
                    <IoIosInformationCircleOutline className="text-lg text-text" />
                    <p className="text-md ml-1 text-text">{profileData.Bio}</p>
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
            <UserExplorer userAddress={signingAccount} />
          </div>
        )}

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
        {/* {isMediaModalOpen && (
          <Modal isOpen={isMediaModalOpen} onClose={closeMediaModal}>
            <IpfsSettings onClose={closeMediaModal} />
          </Modal>
        )} */}
      </div>
    </div>
  );
};

export default Profile;
