import { useState } from "react";
import WaitlistModal from "./waitlist-modal";

const Navbar = () => {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  return (
    <nav className="w-full flex items-center justify-between py-6 px-8 max-w-7xl mx-auto">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="/Logo.svg" alt="Lisar Logo" className="h-5 w-auto" />
      </div>
      {/* Centered Menu */}
      <div className="hidden md:flex gap-8 text-sm font-medium text-gray-700">
        {/* <a href="#" className="hover:text-black transition">
          Products
        </a> */}
        <a href="#" className="hover:text-black transition">
          How It Works
        </a>
        <a href="#" className="hover:text-black transition">
          FAQ
        </a>
      </div>
      {/* Get Started Button */}
      <div>
        <button
          onClick={() => setShowWaitlistModal(true)}
          className=" py-2 px-4 flex bg-[#C7EF6B] rounded-lg text-[#060E0A] cursor-pointer font-medium text-sm"
        >
          Stake now
        </button>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={showWaitlistModal}
        onClose={() => setShowWaitlistModal(false)}
      />
    </nav>
  );
};

export default Navbar;
