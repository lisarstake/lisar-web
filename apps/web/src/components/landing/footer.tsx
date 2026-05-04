import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const socialLinks = [
    { name: "X", href: "https://x.com/lisarstake", iconSrc: "/x-logo.png" },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/lisarstake", iconSrc: "/linkedin.webp" },
    { name: "Linktree", href: "https://linktr.ee/lisarstake", iconSrc: "/linktree.webp" },
    { name: "Instagram", href: "https://www.instagram.com/lisarstake", iconSrc: "/instagram.png" },
    { name: "YouTube", href: "https://www.youtube.com/lisarstakee", iconSrc: "/youtube.png" },
    { name: "Telegram", href: "https://t.me/+F0YXOMaiJMxkODVk", iconSrc: "/telegram.png" },
  ];

  return (
    <footer className="w-full bg-white pb-8">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
        <div className="md:px-6 py-4">
          <div className="grid gap-8 pt-8 md:grid-cols-[1.2fr_1fr]">
            <div>
              <div>
                <img src="/Logo.svg" alt="Lisar Logo" className="h-3 w-auto" />
                <p className="mt-2 max-w-md text-base leading-relaxed text-[#5e6660]">
                  Lisar helps millions of customers achieve their financial goals by helping them save and invest with ease. Deposit with fiat, earn dollar-backed yield daily on your savings.
                </p>
              </div>

              <div className="flex flex-col">
                <p className="mt-3 text-sm font-medium">Connect With Us:</p>
                <p className="flex flex-wrap gap-2.5">
                  {socialLinks.map((link) => {
                    const isLarger = link.name === "LinkedIn" || link.name === "Linktree" || link.name === "Instagram";
                    return (
                      <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center text-[#5e6660] transition hover:border-[#235538] hover:text-[#235538]"
                        aria-label={link.name}
                        title={link.name}
                      >
                        {link.iconSrc ? (
                          <img
                            src={link.iconSrc}
                            alt={link.name}
                            className={isLarger ? "h-7 w-7 object-contain" : "h-5 w-5 object-contain"}
                          />
                        ) : null}
                      </a>
                    );
                  })}
                </p>

              </div>
            </div>

            <div className="flex flex-col justify-end">
              <div id="newsletter" className="max-w-3xl">
                <p className="text-[11px] font-medium uppercase text-[#235538]">
                  Stay informed
                </p>
                <p className="mt-2 text-lg font-sans font-medium">
                  Get the LISAR Brief
                </p>
                <p className="mt-1 text-base text-[#5e6660]">
                  One weekly email. One insight, one product update, one proof point. No spam ever. Unsubscribe anytime.
                </p>
                {subscribed ? (
                  <p className="mt-3 text-sm text-[#129b49] font-medium">
                    Thanks for subscribing!
                  </p>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 rounded-full border border-[#d2d8d3] px-4 py-2.5 text-sm text-[#202722] outline-none placeholder:text-[#93988f] focus:border-[#235538]"
                      required
                    />
                    <button
                      type="submit"
                      className="rounded-full border-2 border-black bg-[#C7EF6B] px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#b7e354]"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="md:px-6 pb-4 pt-6 mt-6 border-t ">
          <div className="mb-3 flex flex-wrap gap-3 md:gap-4 text-xs font-medium text-[#5d685f]">
            <a href="/lisar-savings" className="underline text-blue-500 hover:text-blue-600">
              Lisar Savings
            </a>
            <a href="/lisar-growth" className="underline text-blue-500 hover:text-blue-600">
              Lisar Growth
            </a>
            <a href="/terms-of-use" className="underline text-blue-500 hover:text-blue-600">
              Terms of Use
            </a>
            <a href="/privacy-policy" className="underline text-blue-500 hover:text-blue-600">
              Privacy Policy
            </a>
          </div>
          <p className="text-sm leading-relaxed text-[#8a938d]">
            LISAR growth returns are variable and not guaranteed, returns may fluctuate with market
            and network conditions. Any historical returns or expected returns are hypothetical in nature and may not reflect actual future performance. LISAR
            is not a bank and deposits are not insured by any government scheme. By creating a LISAR account, you accept LISAR&apos;s Terms of Use and Privacy Policy.  © {new Date().getFullYear()} Lisar Labs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
