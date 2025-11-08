import React, { useState } from "react";

export default function ShareButton({ link }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Clipboard copy failed:", e);
    }
  };

  return (
    <>
      {/* Share Button Component */}
      <button
        onClick={handleShare}
        className="group flex items-center gap-2"
        type="button"
      >
        <div className="text-primary-cta">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
            />
          </svg>
        </div>
        <span>Share Game</span>
      </button>

      {/* Toast — fixed bottom-center */}
      {/* re designing this to be at the top of the page and then disapear after 5 seconds */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 bottom-6 z-50 transition-all duration-300 ${
          copied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-black/80 text-white text-xs font-medium px-4 py-2 rounded-full backdrop-blur shadow-lg">
          ✅ Link copied to clipboard!
        </div>
      </div>
    </>
  );
}
