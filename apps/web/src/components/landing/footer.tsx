import { Instagram, Linkedin, Link2 } from "lucide-react";

export const Footer = () => {
  const socialLinks = [
    { name: "X", href: "https://x.com/lisarstake", iconSrc: "/x-logo.png" },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/lisar", icon: Linkedin },
    { name: "Linktree", href: "https://linktr.ee/lisar", icon: Link2 },
    { name: "Instagram", href: "https://www.instagram.com/lisar", icon: Instagram },
    { name: "YouTube", href: "https://www.youtube.com/", iconSrc: "/youtube.png" },
    { name: "Telegram", href: "https://t.me/+F0YXOMaiJMxkODVk", iconSrc: "/telegram.png" },
  ];

  return (
    <footer className="w-full bg-[#f7faf5]">
      <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <img src="/Logo.svg" alt="Lisar Logo" className="h-4 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#58695f]">
              Lisar helps you move idle cash into smarter yield opportunities while keeping your
              money flexible and accessible.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-[#0a1f17]">
              Product
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-[#58695f]">
              <li>
                <a href="/login" className="hover:text-[#0a1f17]">
                  Get Started
                </a>
              </li>
              <li>
                <a href="/earn" className="hover:text-[#0a1f17]">
                  Earn
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-[#0a1f17]">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-[#0a1f17]">
              Company
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-[#58695f]">
              <li>
                <a href="#" className="hover:text-[#0a1f17]">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#0a1f17]">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#0a1f17]">
                  Privacy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-[#0a1f17]">
              Social
            </h4>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ccd7cf] text-[#30453a] transition hover:border-[#0a1f17] hover:text-[#0a1f17]"
                  aria-label={link.name}
                  title={link.name}
                >
                  {link.iconSrc ? (
                    <img
                      src={link.iconSrc}
                      alt={link.name}
                      className={`h-4 w-4 object-contain ${link.name === "X" ? "invert-[0.18]" : ""}`}
                    />
                  ) : link.icon ? (
                    <link.icon size={16} />
                  ) : null}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-2 text-sm leading-relaxed text-[#6d7d88] md:text-[15px] border-t border-[#dce4d7] pt-10" >
          <p>
            Lisar provides tools for savings and yield-focused strategies. Returns shown across
            this website are estimates and are not guaranteed. Digital asset and market products
            carry risk, including possible loss of principal.
          </p>
          <p>
            By using Lisar products, you agree to Lisar&apos;s{" "}
            <a href="#" className="text-[#10251c] underline">
              Terms of Use
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#10251c] underline">
              Privacy Policy
            </a>
            . Please review product-specific risk disclosures before you invest.
          </p>
          <p>
            &copy; {new Date().getFullYear()} Lisar Labs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
