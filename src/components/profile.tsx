import React, { useState, useEffect } from "react";
import useProfileData from "../hooks/use_profile_data";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import Threads from "./threads";
import { CiLocationOn } from "react-icons/ci";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { FaGear } from "react-icons/fa6";
import { AiFillEdit } from "react-icons/ai";
import { MdOutlinePermMedia } from "react-icons/md";
import CreateProfile from "./create_profile";
import UpdateProfile from "./update_profile";
import Modal from "../utils/modal";
import IpfsSettings from "./ipfs_settings";
import useUploadToIPFS from "../hooks/use_upload_to_ipfs";
import UploadToIPFS from "./upload_to_ipfs";
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
    <div className="flex flex-col items-center w-full bg-gray-800 text-white">
      <div className="w-full max-w-4xl p-6">
        {isLoading && (
          <p className="text-xl font-semibold text-center">Loading...</p>
        )}

        {error && <p className="text-lg text-center text-red-500">{error}</p>}

        {!isLoading && !profileData && !isCheckingProfile && (
          <div className="text-center p-10">
            <p className="text-lg mb-4">You don't have a profile.</p>
            <button
              className="p-3 font-semibold text-gray-800 bg-indigo-300 rounded-full hover:bg-indigo-400 transition duration-300"
              onClick={() => setIsCreateProfileModalOpen(true)}
            >
              Create Profile
            </button>
          </div>
        )}

        {profileData && !isCheckingProfile && state === "Paired" && (
          <div className="bg-gray-700 shadow-xl rounded-xl p-6 mb-6 relative">
            {profileData.Banner && (
              <img
                src={profileData.Banner}
                alt="Banner"
                className="w-full h-auto rounded-t-xl"
              />
            )}

            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              onClick={() => setIsMediaModalOpen(true)}
            >
              <MdOutlinePermMedia className="text-xl text-gray-300" />
            </button>
            <button
              className="absolute top-4 right-12 text-gray-600 hover:text-gray-800"
              onClick={() => setIsUpdateProfileModalOpen(true)}
            >
              <AiFillEdit className="text-xl text-gray-300" />
            </button>

            <div
              className={`flex ${
                profileData.Picture ? "flex-col md:flex-row" : ""
              } items-center md:items-start md:space-x-6 mt-4`}
            >
              {profileData.Picture && (
                <img
                  src={profileData.Picture}
                  alt="Profile"
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto md:mx-0 mb-4 md:mb-0"
                />
              )}
              <div className="text-left">
                <p className="text-3xl font-bold text-gray-300">
                  {profileData.Name}
                </p>
                <div className="flex items-center my-1">
                  <IoIosInformationCircleOutline className="text-lg text-gray-300" />
                  <p className="text-md ml-1 text-gray-300">
                    {profileData.Bio}
                  </p>
                </div>
                <div className="flex items-center my-1">
                  <CiLocationOn className="text-lg text-gray-300" />
                  <p className="text-sm ml-1 text-gray-400">
                    {profileData.Location}
                  </p>
                </div>
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
          <div className="w-full max-w-4xl shadow-xl rounded-xl bg-gray-700 border border-gray-600">
            <h1 className="text-2xl mt-5 ml-5 font-semibold text-gray-300 mb-4">
              My Threads
            </h1>
            <Threads />
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
        {isMediaModalOpen && (
          <Modal isOpen={isMediaModalOpen} onClose={closeMediaModal}>
            <IpfsSettings onClose={closeMediaModal} />
            {/* <UploadToIPFS /> */}
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Profile;
