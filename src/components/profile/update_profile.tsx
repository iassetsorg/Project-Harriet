import { useState, useEffect, useRef } from "react";
import { useHashConnectContext } from "../../hashconnect/hashconnect";
import useProfileData from "../../hooks/use_profile_data";
import { toast } from "react-toastify";
import useSendMessage from "../../hooks/use_send_message";
import useUploadToArweave from "../media/use_upload_to_arweave";
import ReadMediaFile from "../media/read_media_file";

const UpdateProfile = ({ onClose }: { onClose: () => void }) => {
  const { pairingData } = useHashConnectContext();
  const signingAccount = pairingData?.accountIds[0] || "";
  const { send } = useSendMessage();
  const { profileData } = useProfileData(signingAccount);
  const userProfileTopicId = profileData ? profileData.ProfileTopic : "";
  const userMessagesTopicId = profileData ? profileData.UserMessages : "";
  const { uploading, uploadToArweave, error } = useUploadToArweave();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  // Add state for image preview
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (signingAccount && profileData && profileData) {
      setName(profileData.Name || "");
      setBio(profileData.Bio || "");
      setWebsite(profileData.Website || "");
      setLocation(profileData.Location || "");
    }
  }, [signingAccount, profileData]);

  useEffect(() => {
    if (profileData && profileData.Picture) {
      setPicturePreview(profileData.Picture);
    }
  }, [profileData]);

  const updateProfile = async () => {
    let pictureHash = null;
    let bannerHash = null;

    if (picture) {
      try {
        pictureHash = await uploadToArweave(picture);
      } catch (e) {
        toast.error("Picture upload failed. Try again.");
        return;
      }
    }

    if (banner) {
      try {
        bannerHash = await uploadToArweave(banner);
      } catch (e) {
        toast.error("Banner upload failed. Try again.");
        return;
      }
    }

    const updateMessage = {
      Identifier: "iAssets",
      Type: "Profile",
      Author: signingAccount,
      Name: name,
      Bio: bio,
      Website: website,
      Location: location,
      UserMessages: userMessagesTopicId,
      Picture: pictureHash,
      Banner: bannerHash,
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

  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setPicture(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPicturePreview(profileData ? profileData.Picture : null);
    }
  };

  const clearImage = () => {
    setPicture(null);
    setPicturePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
          className="w-full px-4 py-2 rounded-lg bg-secondary text-text"
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
      <div className="mb-3">
        <label className="text-text ml-1">Profile Picture:</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePictureChange}
          className="w-full px-4 py-2 rounded-lg bg-secondary text-text"
        />
        {picturePreview && (
          <div className="mt-2 flex flex-col items-center">
            {picture && (
              <img
                src={picturePreview}
                alt="Profile Preview"
                className="mt-4"
              />
            )}
            {!picture && profileData?.Picture && (
              <ReadMediaFile cid={profileData.Picture} />
            )}
            <button
              onClick={clearImage}
              className="mt-2 text-error font-semibold"
            >
              Clear Image
            </button>
          </div>
        )}
      </div>
      {/* <div className="mb-3">
        <label className="text-text ml-1">Banner Image:</label>
        <input
          type="file"
          onChange={(e) =>
            e.target.files && e.target.files[0] && setBanner(e.target.files[0])
          }
          className="w-full px-4 py-2 rounded-lg bg-secondary text-text"
        />
      </div> */}
      {uploading && <p>Uploading Media...</p>}
      {error && <p className="text-error">{error}</p>}

      <button
        onClick={updateProfile}
        className="w-full py-3 px-6 font-semibold text-background bg-primary rounded-full hover:bg-accent transition duration-300"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Update"}
      </button>
    </div>
  );
};

export default UpdateProfile;
