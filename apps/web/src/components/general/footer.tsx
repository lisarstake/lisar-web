export const Footer = () => {
  return (
    <footer className="w-full max-w-7xl mx-auto py-4 px-4 md:py-8 md:px-8 gap-4 flex flex-col md:flex-row justify-between items-center border-t border-gray-500 mt-8">
      <div className=" md:flex-row items-center gap-2 hidden sm:flex">
        {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="/Logo.svg" alt="Lisar Logo" className="h-4 w-auto" />
      </div>
      </div>
      <div className="text-gray-800 text-sm text-center mt-2 md:mt-0 ">
        &copy; {new Date().getFullYear()} Lisar Labs. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
