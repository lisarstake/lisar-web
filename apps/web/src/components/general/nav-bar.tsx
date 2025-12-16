import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="w-full flex items-center justify-between py-6 px-8 max-w-7xl mx-auto">
      {/* Logo */}
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img src="/Logo.svg" alt="Lisar Logo" className="h-4 md:h-5 w-auto" />
      </div>
      {/* Centered Menu - Hidden on mobile */}
      <div className="hidden lg:flex gap-8 text-sm font-medium text-gray-700">
        {/* <a href="#" className="hover:text-black transition">
          Products
        </a> */}
        <a href="#" className="hover:text-black transition">
          How It Works
        </a>
        <a
          onClick={() => navigate("/blog")}
          className="hover:text-black transition cursor-pointer"
        >
          Blog
        </a>
        <a href="#" className="hover:text-black transition">
          FAQ
        </a>
      </div>
      {/* Get Started Button */}
      <div>
        <button
          onClick={() => navigate("/login")}
          className="py-2 px-3 sm:px-4 flex bg-[#C7EF6B] rounded-lg text-[#060E0A] cursor-pointer font-medium text-xs sm:text-sm whitespace-nowrap"
        >
          Create Account
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
