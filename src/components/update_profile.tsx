import { useState, useEffect } from "react";
import { useHashConnectContext } from "../hashconnect/hashconnect";
import useProfileData from "../hooks/use_profile_data";
import { toast } from "react-toastify";
import useSendMessage from "../hooks/use_send_message";

const UpdateProfile = ({ onClose }: { onClose: () => void }) => {
  const { pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
  const { send } = useSendMessage();
  const { profileData } = useProfileData(signingAccount);
  const userProfileTopicId = profileData ? profileData.ProfileTopic : "";
  const userThreadsTopicId = profileData ? profileData.Threads : "";

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [picture, setPicture] = useState("");
  const [banner, setBanner] = useState("");

  useEffect(() => {
    if (signingAccount && profileData && profileData) {
      setName(profileData.Name || "");
      setBio(profileData.Bio || "");
      setWebsite(profileData.Website || "");
      setLocation(profileData.Location || "");
      setPicture(profileData.Picture || "");
      setBanner(profileData.Banner || "");
    }
  }, [signingAccount, profileData]);

  const updateProfile = async () => {
    const updateMessage = {
      Identifier: "iAssets",
      Type: "Profile",
      Author: signingAccount,
      Name: name,
      Bio: bio,
      Website: website,
      Location: location,
      Threads: userThreadsTopicId,
      Picture: picture,
      Banner: banner,
    };

    toast("Updating Profile");
    const updateProfile = await send(userProfileTopicId, updateMessage, "");
    if (updateProfile?.receipt?.status.toString() === "SUCCESS") {
      onClose();
      window.location.reload();
      toast.success("Profile Updated Successfully");
    } else {
      toast.error("Failed to Update Profile");
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-background rounded-lg shadow-xl p-4 text-text">
      <h3 className="text-xl py-4 font-semibold text-primary">
        Update Profile
      </h3>

      <div className="mb-3">
        <label className="text-text ml-1">Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2  rounded-lg bg-secondary text-text"
        />
      </div>
      <div className="mb-3">
        <label className="text-text ml-1">Bio:</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full px-4 py-4 rounded-lg bg-secondary text-text"
        />
      </div>
      <div className="mb-3">
        <label className="text-text ml-1">Website:</label>
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-secondary text-text"
        />
      </div>
      <div className="mb-3">
        <label className="text-text ml-1">Location:</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-secondary text-text"
        />
      </div>

      <button
        onClick={updateProfile}
        className="w-full py-3 px-6 font-semibold text-background bg-primary rounded-full hover:bg-accent transition duration-300 "
      >
        Update
      </button>
    </div>
  );
};

export default UpdateProfile;
