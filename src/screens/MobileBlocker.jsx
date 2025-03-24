import { useEffect, useState } from "react";

function MobileBlocker() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) { // Tailwind's md breakpoint (~tablet)
      setIsMobile(true);
    }
  }, []);

  if (isMobile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
        <div className="text-center text-white p-6">
          <h1 className="text-xl font-bold mb-4">Not Supported</h1>
          <p>This app is only available on tablet or larger devices for now.</p>
        </div>
      </div>
    );
  }

  return null;
}

export default MobileBlocker;
