import { type ComponentType, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Calculator,
  ChevronDown,
  FileText,
  Landmark,
  Menu,
  Newspaper,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

type ResourceItem = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  toneClass: string;
  action?: () => void;
};

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const resources = useMemo<ResourceItem[]>(
    () => [
      {
        title: "Blog",
        icon: BookOpen,
        toneClass: "bg-[#dbe9f8] text-[#1e66d4]",
        action: () => navigate("/blog"),
      },
      {
        title: "Calculator",
        icon: Calculator,
        toneClass: "bg-[#ddf4e7] text-[#129b49]",
        action: () => {
          const section = document.getElementById("yield-estimate");
          section?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
      },
      {
        title: "Community",
        icon: Users,
        toneClass: "bg-[#d8f3ef] text-[#0b8f86]",
        action: () => {
          const section = document.getElementById("community");
          section?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
      },

      {
        title: "Newsletter",
        icon: Newspaper,
        toneClass: "bg-[#eaebee] text-[#404654]",
        action: () => {
          const footer = document.getElementById("newsletter");
          footer?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
      },
      {
        title: "Terms",
        icon: FileText,
        toneClass: "bg-[#e9eef7] text-[#2f5ea8]",
        action: () => navigate("/terms-of-use"),
      },
      {
        title: "Privacy",
        icon: ShieldCheck,
        toneClass: "bg-[#e8f2ec] text-[#2f6a43]",
        action: () => navigate("/privacy-policy"),
      },

    ],
    [navigate],
  );

  const transition = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 md:px-5">
        <div
          className={`w-full transition-all duration-300 ${isScrolled ? "bg-white border-b border-[#e5ebe8]" : "bg-white"
            } mx-auto max-w-7xl md:mt-4 md:rounded-3xl md:border-0 ${isScrolled
              ? "md:border md:border-[#dce4d7] md:bg-white/95 md:shadow-[0_10px_30px_rgba(6,14,10,0.08)] md:backdrop-blur"
              : "md:bg-white"
            } px-4 md:px-6`}
        >
          <div
            className="relative px-2 md:px-3"
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <nav className="flex h-18 items-center justify-between gap-6">
              <div className="flex items-center gap-8 xl:gap-10">
                <button
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => navigate("/")}
                  aria-label="Go to homepage"
                >
                  <img
                    src="/Logo.svg"
                    alt="Lisar Logo"
                    className="h-4 w-auto"
                  />
                </button>

                <div className="hidden lg:flex items-center gap-7 text-[17px] font-medium text-[#3f4f63]">
                  <button
                    type="button"
                    className="cursor-pointer transition-colors hover:text-[#10251c]"
                    onClick={() => {
                      const section = document.getElementById("growth-options");
                      section?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer transition-colors hover:text-[#10251c]"
                    onClick={() => {
                      const section = document.getElementById("growth-options");
                      section?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    Invest
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer transition-colors hover:text-[#10251c]"
                    onClick={() => {
                      if (window.location.pathname === "/") {
                        const section = document.getElementById("faq");
                        section?.scrollIntoView({ behavior: "smooth", block: "start" });
                        return;
                      }
                      navigate("/");
                    }}
                  >
                    FAQ
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setResourcesOpen(true)}
                      onFocus={() => setResourcesOpen(true)}
                      className={`inline-flex cursor-pointer items-center gap-1 transition-colors ${resourcesOpen
                          ? "text-[#10251c]"
                          : "text-[#3f4f63] hover:text-[#10251c]"
                        }`}
                    >
                      <span>Resources</span>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${resourcesOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="inline-flex cursor-pointer items-center rounded-full border-2 border-black bg-[#C7EF6B] px-7 py-2.5 text-base font-medium text-black transition-colors hover:bg-[#C7EF6B]"
                >
                  Create a free account
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex cursor-pointer items-center rounded-full border border-[#b9c3bf] bg-white px-7 py-2.5 text-base font-medium text-[#1a2433] transition-colors hover:bg-[#f3f5f4]"
                >
                  Sign in
                </button>
              </div>

              <div className="lg:hidden flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className="cursor-pointer rounded-lg p-2 text-[#1f3f2f]"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </nav>

            <AnimatePresence>
              {resourcesOpen ? (
                <motion.div
                  className="hidden lg:block absolute left-24 top-full pt-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={transition}
                >
                  <div className="w-[400px] rounded-3xl border border-[#e6ece8] bg-white p-6 shadow-[0_20px_40px_rgba(6,14,10,0.12)]">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                      {resources.map((item) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.title}
                            type="button"
                            onClick={() => {
                              setResourcesOpen(false);
                              item.action?.();
                            }}
                            className="group flex cursor-pointer items-center gap-3 rounded-2xl p-2 text-left"
                          >
                            <div
                              className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[26px] ${item.toneClass}`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <p className="text-[16px] leading-none font-medium text-[#3f4f63] transition-colors group-hover:text-[#10251c]">
                              {item.title}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {mobileOpen ? (
                <motion.div
                  className="lg:hidden fixed inset-0 z-[70]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transition}
                >
                  <div className="fixed inset-0 bg-white px-7 pt-7 pb-8 flex flex-col overflow-y-auto">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="cursor-pointer text-[#1f3f2f]"
                        aria-label="Close menu"
                      >
                        <X size={30} strokeWidth={1.7} />
                      </button>
                    </div>

                    <div className="mt-8 space-y-5 text-base font-medium text-[#111111]">
                      <button
                        type="button"
                        className="block cursor-pointer text-left"
                        onClick={() => {
                          setMobileOpen(false);
                          const section = document.getElementById("growth-options");
                          section?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="block cursor-pointer text-left"
                        onClick={() => {
                          setMobileOpen(false);
                          const section = document.getElementById("growth-options");
                          section?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                      >
                        Invest
                      </button>
                      <button
                        type="button"
                        className="block cursor-pointer text-left"
                        onClick={() => {
                          setMobileOpen(false);
                          if (window.location.pathname === "/") {
                            const section = document.getElementById("faq");
                            section?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                            return;
                          }
                          navigate("/");
                        }}
                      >
                        FAQ
                      </button>

                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setMobileResourcesOpen((prev) => !prev)
                          }
                          className="w-full cursor-pointer flex items-center justify-between text-left"
                        >
                          <span>Resources</span>
                          <ChevronDown
                            size={16}
                            className={`text-[#111111] transition-transform ${mobileResourcesOpen ? "rotate-180" : ""
                              }`}
                          />
                        </button>

                        <AnimatePresence>
                          {mobileResourcesOpen ? (
                            <motion.div
                              className="mt-4 grid grid-cols-2 gap-3"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={transition}
                            >
                              {resources.map((item) => {
                                const Icon = item.icon;

                                return (
                                  <button
                                    key={item.title}
                                    type="button"
                                    onClick={() => {
                                      setMobileOpen(false);
                                      item.action?.();
                                    }}
                                    className="cursor-pointer rounded-xl bg-[#f3f5f4] p-3 text-left"
                                  >
                                    <div
                                      className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${item.toneClass}`}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <p className="text-sm text-[#111111]">
                                      {item.title}
                                    </p>
                                  </button>
                                );
                              })}
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
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
