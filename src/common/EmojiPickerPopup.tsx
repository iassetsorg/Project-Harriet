import React from "react";
import EmojiPicker from "emoji-picker-react";
import { RiCloseLine } from "react-icons/ri";
import { createPortal } from "react-dom";

interface EmojiPickerPopupProps {
  onEmojiClick: (emojiData: { emoji: string }) => void;
  onClose: () => void;
  position?: "top" | "bottom";
}

const EmojiPickerPopup: React.FC<EmojiPickerPopupProps> = ({
  onEmojiClick,
  onClose,
  position = "bottom",
}) => {
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100002] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Emoji Picker Container */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100003]">
        <div className="bg-background/95 border border-primary rounded-xl shadow-xl overflow-hidden backdrop-blur-md">
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-5 flex items-center justify-center z-10  group  rounded-full w-7 h-7 bg-secondary/50 hover:bg-red-500 text-text/50 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 backdrop-blur-sm hover:scale-110 "
            >
              <RiCloseLine
                className="text-xl transform transition-transform 
                group-hover:rotate-90 duration-200"
              />
            </button>
            <div className="">
              <EmojiPicker
                searchPlaceholder="Search emojis..."
                width={320}
                height={400}
                onEmojiClick={onEmojiClick}
                lazyLoadEmojis
                skinTonesDisabled
              />
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default EmojiPickerPopup;
