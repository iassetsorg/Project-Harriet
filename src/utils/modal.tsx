import { useRef } from "react";

export interface modalProps {
  setModal: Function;
}

const Modal = (props: any) => {
  const cancelButtonRef = useRef(null);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <div className="z-50 relative max-w-3xl mx-auto">
        <div className="relative bg-white rounded-lg shadow-xl">
          <div className="absolute top-4 right-4">
            <button
              type="button"
              ref={cancelButtonRef}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none mr-3"
              onClick={() => props.setShow(false)}
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
          <div className="overflow-y-auto max-h-[calc(100vh-2rem)] p-4">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
