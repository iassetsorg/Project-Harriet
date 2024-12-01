import React, { FC, useState } from "react";

/**
 * Modal is a reusable React component that displays content in an overlay dialog.
 * Features:
 * - Backdrop with opacity
 * - Centered content
 * - Optional close button
 * - Scrollable content area
 * - Responsive design
 */

/**
 * Props interface for the Modal component
 * @property {boolean} isOpen - Controls the visibility of the modal
 * @property {() => void} onClose - Callback function when modal is closed
 * @property {React.ReactNode} children - Content to be displayed inside the modal
 * @property {boolean} hideCloseButton - Optional flag to hide the close button
 * @property {() => void} onCloseClick - Optional additional callback for close button click
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  hideCloseButton?: boolean;
  onCloseClick?: () => void;
}

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  hideCloseButton = false,
  onCloseClick,
}) => {
  // Track modal state internally
  const [modalOpen, setModalOpen] = useState(isOpen);

  /**
   * Handles the modal closing action
   * Executes both the required onClose and optional onCloseClick callbacks
   */
  const closeModal = () => {
    setModalOpen(false);
    onClose();
    if (onCloseClick) {
      onCloseClick();
    }
  };

  return (
    <div>
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Semi-transparent backdrop */}
          <div className="fixed inset-0">
            <div className="absolute inset-0 bg-gray-700 opacity-75"></div>
          </div>

          {/* Modal container with positioning */}
          <div className="z-50 relative max-w-3xl mx-auto">
            <div className="relative bg-background rounded-lg shadow-xl text-text overflow-hidden">
              {/* Animated close button with hover effects */}
              {!hideCloseButton && (
                <div className="absolute top-4 right-4 z-50">
                  <button
                    type="button"
                    className="group relative rounded-full w-7 h-7 bg-secondary/50 hover:bg-red-500 text-text/50 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 backdrop-blur-sm hover:scale-110 flex items-center justify-center"
                    onClick={closeModal}
                  >
                    <span className="sr-only">Close</span>
                    {/* Animated X icon */}
                    <svg
                      className="h-4 w-4 transform group-hover:rotate-90 transition-transform duration-300"
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
                    {/* Gradient background for hover effect */}
                    <div className="absolute inset-0 rounded-full group-hover:bg-gradient-to-tr from-red-600 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  </button>
                </div>
              )}
              {/* Scrollable content area with max height */}
              <div className="overflow-y-auto max-h-[calc(100vh-2rem)]">
                <div className="relative">{children}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
