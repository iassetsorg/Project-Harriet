import React, { FC, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  hideCloseButton?: boolean;
}

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  hideCloseButton = false,
}) => {
  const [modalOpen, setModalOpen] = useState(isOpen);

  const closeModal = () => {
    setModalOpen(false);
    onClose();
  };

  return (
    <div>
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0">
            <div className="absolute inset-0 bg-gray-700 opacity-75"></div>
          </div>

          <div className="z-50 relative max-w-3xl mx-auto">
            <div className="relative bg-background rounded-lg shadow-xl text-text">
              {!hideCloseButton && ( // Conditional rendering based on hideCloseButton
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    className="rounded-md text-text hover:text-primary focus:outline-none mr-3"
                    onClick={closeModal}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
              <div className="overflow-y-auto max-h-[calc(100vh-2rem)]">
                <div>{children}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
