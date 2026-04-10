import { type ComponentType, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  BarChart3,
  BookOpen,
  Box,
  Building2,
  ChevronDown,
  FileText,
  HelpCircle,
  Library,
  Link2,
  Menu,
  PiggyBank,
  X,
} from "lucide-react";

type MenuKey = "personal" | "business" | "developer" | "learn";

type MenuItem = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  action?: () => void;
};

type MenuConfig = {
  title: string;
  primary: MenuItem[];
  secondaryTitle?: string;
  secondary?: { title: string; action?: () => void }[];
};

const Navbar = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<MenuKey | null>(
    null,
  );

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      setMobileActiveMenu(null);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const menuConfig = useMemo<Record<MenuKey, MenuConfig>>(
    () => ({
      personal: {
        title: "Personal",
        primary: [
          {
            title: "Savings",
            description: "Save and earn amazing returns",
            icon: PiggyBank,
          },
          {
            title: "Growth",
            description: "Grow your wealth with easy",
            icon: Banknote,
          },
          {
            title: "Stocks",
            description: "Own a slice of top companies",
            icon: BarChart3,
            badge: "Soon",
          },
        ],
        secondaryTitle: "Tools",
        secondary: [{ title: "Estimate your earnings" }],
      },
      business: {
        title: "Business",
        primary: [
          {
            title: "Camadrie",
            description: "Put your business cash to work",
            icon: Building2,
          },
        ],
      },
      developer: {
        title: "Developer",
        primary: [
          {
            title: "API",
            description: "Offer yields in your app",
            icon: Box,
            badge: "Soon",
          },
          {
            title: "Docs",
            description: "Read how to integrate the API",
            icon: FileText,
            badge: "Soon",
          },
        ],
      },
      learn: {
        title: "Learn",
        primary: [
          {
            title: "Videos",
            description: "Learn from our library of video guides",
            icon: Library,
          },
          {
            title: "Blog",
            description: "Announcements, articles and stories",
            icon: BookOpen,
            action: () => navigate("/blog"),
          },
          {
            title: "Community",
            description: "Connect with other Lisar users",
            icon: HelpCircle,
          },
        ],
      },
    }),
    [navigate],
  );

  const navItems: { key: MenuKey; label: string }[] = [
    { key: "personal", label: "Personal" },
    { key: "business", label: "Business" },
    { key: "developer", label: "Developer" },
    { key: "learn", label: "Learn" },
  ];

  const currentMenu = activeMenu ? menuConfig[activeMenu] : null;
  const mobileHeaderDark = isScrolled || mobileOpen;
  const modalTransition = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 md:px-5">
        <div
          className={`w-full transition-all duration-300 ${
            mobileHeaderDark ? "bg-white border-b border-[#e8eee4]" : "bg-white"
          } mx-auto max-w-7xl md:mt-4 md:rounded-3xl md:border-0 ${
            isScrolled
              ? "md:border md:border-[#dce4d7] md:bg-white/95 md:shadow-[0_10px_30px_rgba(6,14,10,0.08)] md:backdrop-blur"
              : "md:bg-white"
          } px-4 md:px-6`}
        >
          <div
            className="relative px-4 md:px-6"
            onMouseLeave={() => setActiveMenu(null)}
          >
            <nav className="flex h-18 items-center justify-between">
              <div className="flex items-center gap-5 xl:gap-8">
                <button
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => navigate("/")}
                  aria-label="Go to homepage"
                >
                  <img
                    src="/Logo.svg"
                    alt="Lisar Logo"
                    className="hidden md:block h-4 w-auto"
                  />
                  <img
                    src={"/Logo.svg"}
                    alt="Lisar Logo"
                    className="md:hidden h-4 w-auto"
                  />
                </button>

                <div className="relative hidden lg:block">
                  <div className="flex items-center gap-0.5 xl:gap-1">
                    {navItems.map((item) => {
                      const isActive = activeMenu === item.key;
                      return (
                        <motion.button
                          key={item.key}
                          type="button"
                          onMouseEnter={() => setActiveMenu(item.key)}
                          onFocus={() => setActiveMenu(item.key)}
                          whileHover={{ y: -1 }}
                          transition={{ duration: 0.2 }}
                          className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-base font-medium transition-colors ${
                            isActive
                              ? "text-[#060E0A]"
                              : "text-[#4a5f55] hover:text-[#060E0A]"
                          }`}
                        >
                          {item.label}
                          <ChevronDown
                            size={14}
                            className={
                              isActive ? "text-[#060E0A]" : "text-[#6d8178]"
                            }
                          />
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {currentMenu ? (
                      <motion.div
                        className="absolute left-0 top-full pt-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={modalTransition}
                      >
                        <motion.div
                          className={`rounded-2xl border border-[#e8efe4] bg-white p-4 shadow-[0_16px_32px_rgba(6,14,10,0.12)] ${
                            currentMenu.secondary?.length
                              ? "min-w-[560px] max-w-[680px]"
                              : "min-w-[360px] max-w-[440px]"
                          }`}
                        >
                          <div
                            className={`grid gap-5 ${
                              currentMenu.secondary?.length
                                ? "grid-cols-[1.45fr_1fr]"
                                : "grid-cols-1"
                            }`}
                          >
                            <div
                              className={
                                currentMenu.secondary?.length
                                  ? "pr-5 border-r border-[#edf2ea]"
                                  : ""
                              }
                            >
                              <div className="space-y-3">
                                {currentMenu.primary.map((entry) => {
                                  const Icon = entry.icon;
                                  return (
                                    <button
                                      key={entry.title}
                                      type="button"
                                      onClick={() => {
                                        setActiveMenu(null);
                                        entry.action?.();
                                      }}
                                      className="w-full cursor-pointer text-left group"
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ecf6df] text-[#254333]">
                                          <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <p className="text-[16px] leading-tight font-medium text-[#0e2a1f] group-hover:text-[#060E0A]">
                                            {entry.title}
                                            {entry.badge ? (
                                              <span className="ml-2 rounded-md bg-[#C7EF6B] px-1.5 py-0.5 text-[10px] font-bold text-[#060E0A]">
                                                {entry.badge}
                                              </span>
                                            ) : null}
                                          </p>
                                          <p className="mt-0.5 text-[15px] text-[#61786c]">
                                            {entry.description}
                                          </p>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {currentMenu.secondary?.length ? (
                              <div>
                                <p className="mb-2 text-[18px] font-medium text-[#0e2a1f]">
                                  {currentMenu.secondaryTitle}
                                </p>
                                <div className="space-y-2.5">
                                  {currentMenu.secondary.map((link) => (
                                    <button
                                      key={link.title}
                                      type="button"
                                      onClick={() => {
                                        setActiveMenu(null);
                                        link.action?.();
                                      }}
                                      className="group flex cursor-pointer items-center gap-1.5 text-left text-[15px] text-[#61786c] hover:text-[#060E0A]"
                                    >
                                      <span>{link.title}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </motion.div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="cursor-pointer px-2 py-1.5 text-base text-[#1f3f2f] font-medium hover:text-[#060E0A] transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#C7EF6B] px-3.5 py-2 text-base text-[#060E0A] font-medium hover:bg-[#b8e55a] transition-colors"
                >
                  Create an account
                </button>
              </div>

              <div className="lg:hidden flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className={`cursor-pointer rounded-lg p-2 text-[#1f3f2f]`}
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </nav>

            <AnimatePresence>
              {mobileOpen ? (
                <motion.div
                  className="lg:hidden fixed inset-0 z-[70]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={modalTransition}
                >
                  <div className="fixed inset-0 bg-[#050505] px-7 pt-7 pb-8 flex flex-col overflow-y-auto">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="cursor-pointer text-white/90"
                        aria-label="Close menu"
                      >
                        <X size={30} strokeWidth={1.7} />
                      </button>
                    </div>

                    <div className="mt-6 space-y-5">
                      {navItems.map((item) => {
                        const isOpen = mobileActiveMenu === item.key;
                        const section = menuConfig[item.key];

                        return (
                          <div key={item.key}>
                            <motion.button
                              type="button"
                              onClick={() =>
                                setMobileActiveMenu((prev) =>
                                  prev === item.key ? null : item.key,
                                )
                              }
                              whileTap={{ scale: 0.99 }}
                              className="w-full cursor-pointer flex items-center justify-between text-left text-base font-medium text-white"
                            >
                              <span>{item.label}</span>
                              <ChevronDown
                                size={14}
                                className={`text-[#C7EF6B] transition-transform ${isOpen ? "rotate-180" : ""}`}
                              />
                            </motion.button>

                            <AnimatePresence>
                              {isOpen ? (
                                <motion.div
                                  className="mt-5 space-y-5"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={modalTransition}
                                >
                                  <div className="space-y-4">
                                    {section.primary.map((entry) => {
                                      const Icon = entry.icon;
                                      return (
                                        <button
                                          key={entry.title}
                                          type="button"
                                          onClick={() => {
                                            setMobileOpen(false);
                                            entry.action?.();
                                          }}
                                          className="w-full cursor-pointer text-left"
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                                              <Icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                              <p className="text-[16px] leading-tight font-medium text-white">
                                                {entry.title}
                                                {entry.badge ? (
                                                  <span className="ml-2 rounded-md bg-[#C7EF6B] px-1.5 py-0.5 text-[10px] font-bold text-[#060E0A]">
                                                    {entry.badge}
                                                  </span>
                                                ) : null}
                                              </p>
                                              <p className="mt-0.5 text-[15px] text-white/65">
                                                {entry.description}
                                              </p>
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {section.secondary?.length ? (
                                    <div className="border-t border-white/20 pt-4">
                                      <p className="text-[15px] font-medium text-white mb-2">
                                        {section.secondaryTitle}
                                      </p>
                                      <div className="space-y-2">
                                        {section.secondary.map((link) => (
                                          <button
                                            key={link.title}
                                            type="button"
                                            onClick={() => {
                                              setMobileOpen(false);
                                              link.action?.();
                                            }}
                                            className="cursor-pointer text-left text-[15px] text-white/65"
                                          >
                                            {link.title}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  ) : null}
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false);
                          navigate("/login");
                        }}
                        className="block cursor-pointer text-left text-base text-white/75 font-medium"
                      >
                        Log In
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="block cursor-pointer text-left text-base text-white/75 font-medium"
                      >
                        FAQ's
                      </button>
                     
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </header>
      <div className="h-18 md:h-[80px]" aria-hidden />
    </>
  );
};

export default Navbar;
