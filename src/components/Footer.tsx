import { NavLink, Link } from "react-router-dom";
import SheroLight from "../assets/logo/shero-light.svg";

const Footer = () => {
  const companyLinks = ["Products", "Solutions", "About Us", "Contact Us"];
  const resourceLinks = ["Consultation", "Partners", "Support", "FAQ"];
  
  const socialLinks = [
    {
      name: "Twitter",
      url: "https://twitter.com",
      icon: (
        <path d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z" />
      ),
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com",
      icon: (
        <path d="M196.3 512L103.4 512L103.4 212.9L196.3 212.9L196.3 512zM149.8 172.1C120.1 172.1 96 147.5 96 117.8C96 103.5 101.7 89.9 111.8 79.8C121.9 69.7 135.6 64 149.8 64C164 64 177.7 69.7 187.8 79.8C197.9 89.9 203.6 103.6 203.6 117.8C203.6 147.5 179.5 172.1 149.8 172.1zM543.9 512L451.2 512L451.2 366.4C451.2 331.7 450.5 287.2 402.9 287.2C354.6 287.2 347.2 324.9 347.2 363.9L347.2 512L254.4 512L254.4 212.9L343.5 212.9L343.5 253.7L344.8 253.7C357.2 230.2 387.5 205.4 432.7 205.4C526.7 205.4 544 267.3 544 347.7L544 512L543.9 512z" />
      ),
    },
    {
      name: "Facebook",
      url: "https://facebook.com",
      icon: (
        <path d="M240 363.3L240 576L356 576L356 363.3L442.5 363.3L460.5 265.5L356 265.5L356 230.9C356 179.2 376.3 159.4 428.7 159.4C445 159.4 458.1 159.8 465.7 160.6L465.7 71.9C451.4 68 416.4 64 396.2 64C289.3 64 240 114.5 240 223.4L240 265.5L174 265.5L174 363.3L240 363.3z" />
      ),
    },
  ];

  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <NavLink to="/" className="inline-block mb-6">
              <img
                src={SheroLight}
                alt="Shero Logo"
                className="h-10 w-auto"
              />
            </NavLink>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-6">
              A technology company delivering innovative solutions through premium 
              tech products, strategic consultation, partnerships, and custom software 
              development. One mission:{" "}
              <span className="text-emerald-400 font-semibold">
                Redefine Possible
              </span>{" "}
              through technology.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-600 
                           text-slate-400 hover:text-white
                           flex items-center justify-center
                           transition-all duration-300
                           hover:scale-110"
                  aria-label={`Visit our ${social.name}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 640 640"
                  >
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((item) => (
                <li key={item}>
                  <NavLink
                    to={`/${item.toLowerCase().replace(" ", "-")}`}
                    className={({ isActive }) =>
                      `text-sm transition-colors duration-200 ${
                        isActive
                          ? "text-emerald-400 font-medium"
                          : "text-slate-400 hover:text-white"
                      }`
                    }
                  >
                    {item}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Resources</h3>
            <ul className="space-y-3">
              {resourceLinks.map((item) => (
                <li key={item}>
                  <NavLink
                    to={`/${item.toLowerCase().replace(" ", "-")}`}
                    className={({ isActive }) =>
                      `text-sm transition-colors duration-200 ${
                        isActive
                          ? "text-emerald-400 font-medium"
                          : "text-slate-400 hover:text-white"
                      }`
                    }
                  >
                    {item}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} Shero Group. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link
                to="/terms-privacy"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Terms & Privacy
              </Link>
              <div className="w-px h-4 bg-slate-700" />
              <Link
                to="/security"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Security
              </Link>
              <div className="w-px h-4 bg-slate-700" />
              <Link
                to="/cookies"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;