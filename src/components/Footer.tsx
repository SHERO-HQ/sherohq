import { NavLink } from "react-router-dom";
import SheroLight from "../assets/logo/shero-light.svg";
import { navLinkClassVariant } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="lg:max-w-11/12 w-full rounded-t-[4rem] mx-auto bg-secondary pt-16">
      <div className="container mx-auto max-w-11/12 lg:w-full">
        <div className="container flex lg:flex-row flex-col justify-around items-start text-white pt-10 pb-14">
          <div className="logo">
            <img
              src={SheroLight}
              alt="Shero Logo"
              className="h-12 mb-4"
              aria-label="Shero Logo Light"
            />
            <p className="max-w-sm" aria-label="Shero values">
              Technology, Finance, Hardware, and humanity. One mission, many
              impacts to <span className="font-bold">Redefine possible</span>{" "}
              for the world.
            </p>
          </div>
          <div className="company">
            <h3 className="font-bold mt-8 mb-4 text-xl">Company</h3>
            <ul className="lg:flex flex-col gap-5">
              {["About Us", "Solutions", "Services", "Contact Us"].map(
                (item) => (
                  <li key={item}>
                    <NavLink
                      className={({ isActive }) =>
                        navLinkClassVariant(isActive, "footer")
                      }
                      to={`/${item.toLowerCase().replace(" ", "-")}`}
                    >
                      {item}
                    </NavLink>
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="resources">
            <h3 className="font-bold mt-8 mb-4 text-xl">Resources</h3>
            <ul className="lg:flex flex-col gap-5">
              {["About Us", "Solutions", "Services", "Contact Us"].map(
                (item) => (
                  <li key={item}>
                    <NavLink
                      className={({ isActive }) =>
                        navLinkClassVariant(isActive, "footer")
                      }
                      to={`/${item.toLowerCase().replace(" ", "-")}`}
                    >
                      {item}
                    </NavLink>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
                  <div className="grid grid-cols-1 mb-2 items-center text-slate-300 text-sm gap-3 lg:hidden">
            <div className="flex items-center gap-1">
              {/* Language */}
              <Globe className="size-4" aria-label="language icon" />
              <select className="languages flex items-center gap-1 cursor-pointer">
                <option
                  value="en"
                  className="bg-slate-800"
                  aria-label="english"
                >
                  English
                </option>
                <option
                  value="es"
                  className="bg-slate-800"
                  aria-label="spanish"
                >
                  Spanish
                </option>
                <option value="fr" className="bg-slate-800" aria-label="french">
                  French
                </option>
                <option value="de" className="bg-slate-800" aria-label="german">
                  German
                </option>
                <option
                  value="zh"
                  className="bg-slate-800"
                  aria-label="chinese"
                >
                  Chinese
                </option>
              </select>
            </div>
            {/* <span className="text-2xl">&#8226;</span>{" "} */}
            <div className="flex items-center gap-8">
              <Link to="terms-privacy" aria-label="Terms & Privacy">
                Terms & Privacy
              </Link>
              <Link to="terms-privacy" aria-label="Terms & Privacy">
                Security
              </Link>
              {/* <span className="text-2xl">&#8226;</span>{" "} */}
              <p
                className="flex items-center gap-2 text-slate-300"
                aria-label="Footer Copyright Notice"
              >
                &copy; {new Date().getFullYear()} Shero Group.
              </p>
            </div>
          </div>
        <hr className="max-w-10/12 mx-auto bg-primary" />
        <div className="text-sm text-slate-300 py-6 max-w-10/12 mx-auto flex justify-between items-center flex-row gap-5">
          <div className="lg:flex items-center gap-5 hidden text-slate-300 text-sm">
            <div className="flex items-center gap-1">
              {/* Language */}
              <Globe className="size-4" aria-label="language icon" />
              <select className="languages flex items-center gap-1 cursor-pointer">
                <option
                  value="en"
                  className="bg-slate-800"
                  aria-label="english"
                >
                  English
                </option>
                <option
                  value="es"
                  className="bg-slate-800"
                  aria-label="spanish"
                >
                  Spanish
                </option>
                <option value="fr" className="bg-slate-800" aria-label="french">
                  French
                </option>
                <option value="de" className="bg-slate-800" aria-label="german">
                  German
                </option>
                <option
                  value="zh"
                  className="bg-slate-800"
                  aria-label="chinese"
                >
                  Chinese
                </option>
              </select>
            </div>
            <span className="text-2xl">&#8226;</span>{" "}
            <div className="flex items-center gap-8">
              <Link to="terms-privacy" aria-label="Terms & Privacy">
                Terms & Privacy
              </Link>
              <Link to="terms-privacy" aria-label="Terms & Privacy">
                Security
              </Link>
              <span className="text-2xl">&#8226;</span>{" "}
              <p
                className="flex items-center gap-2 text-slate-300"
                aria-label="Footer Copyright Notice"
              >
                &copy; {new Date().getFullYear()} Shero Group.
              </p>
            </div>
          </div>
          <div className="socials flex items-center justify-center gap-6 text-slate-300 lg:w-auto w-full " aria-label="Shero social media links">
            {/* Social media links can be added here in the future */}
            <Link
              className="hover:text-slate-200 transition-all duration-300 ease-in-out"
              to="https://twitter.com"
              aria-label="Link to Shero's Twitter"
            >
              <svg
                className="size-5"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
              >
                <path d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z" />
              </svg>
            </Link>
            <Link
              className="hover:text-slate-200 transition-all duration-300 ease-in-out"
              to="https://linkedin.com"
              aria-label="Link to Shero's LinkedIn"
            >
              <svg
                className="size-5"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
              >
                <path d="M196.3 512L103.4 512L103.4 212.9L196.3 212.9L196.3 512zM149.8 172.1C120.1 172.1 96 147.5 96 117.8C96 103.5 101.7 89.9 111.8 79.8C121.9 69.7 135.6 64 149.8 64C164 64 177.7 69.7 187.8 79.8C197.9 89.9 203.6 103.6 203.6 117.8C203.6 147.5 179.5 172.1 149.8 172.1zM543.9 512L451.2 512L451.2 366.4C451.2 331.7 450.5 287.2 402.9 287.2C354.6 287.2 347.2 324.9 347.2 363.9L347.2 512L254.4 512L254.4 212.9L343.5 212.9L343.5 253.7L344.8 253.7C357.2 230.2 387.5 205.4 432.7 205.4C526.7 205.4 544 267.3 544 347.7L544 512L543.9 512z" />
              </svg>
            </Link>
            <Link
              className="hover:text-slate-200 transition-all duration-300 ease-in-out"
              to="https://facebook.com"
              aria-label="Link to Shero's Facebook"
            >
              <svg
                className="size-5"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
              >
                <path d="M240 363.3L240 576L356 576L356 363.3L442.5 363.3L460.5 265.5L356 265.5L356 230.9C356 179.2 376.3 159.4 428.7 159.4C445 159.4 458.1 159.8 465.7 160.6L465.7 71.9C451.4 68 416.4 64 396.2 64C289.3 64 240 114.5 240 223.4L240 265.5L174 265.5L174 363.3L240 363.3z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
