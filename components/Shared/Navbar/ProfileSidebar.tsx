import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

interface ProfileSidebarProps {
  onClose: () => void;
}

const profileItems = [
  {
    label: "Edit Profile",
    href: "/profile/edit",
  },
  {
    label: "Settings",
    href: "/profile/settings",
  },
  {
    label: "Privacy",
    href: "/profile/privacy",
  },
  {
    label: "Help & Support",
    href: "/profile/help-support",
  },
  {
    label: "Sign Out",
    href: "/profile/sign-out",
  },
];

const ProfileSidebar = ({ onClose }: ProfileSidebarProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      setIsOpen(true);
    }, 10);
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full bg-black/50 z-50 duration-300 transition-all ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`fixed top-0 right-0 w-full max-w-xs h-full bg-[#1d293d] rounded-l-xl transition-transform duration-300 ease-in-out ${
          isOpen && !isClosing ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Profile</h2>
            <button
              className="text-2xl cursor-pointer hover:bg-gray-700/20 rounded-full p-2 transition-colors duration-200"
              onClick={handleClose}
            >
              <FiX size={24} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <Image
              src="/profile.jpg"
              alt="profile"
              width={80}
              height={80}
              className="rounded-full h-[80px] w-[80px] object-cover mb-4"
            />
            <h3 className="text-xl font-semibold text-white">John Doe</h3>
            <p className="text-white">john.doe@example.com</p>
          </div>

          <div className="flex flex-col">
            {profileItems?.map((item) => (
              <Link
                href={item.href}
                className="w-full text-sm text-left p-3 hover:bg-[#06133FBF] rounded-lg transition-colors duration-200"
              >
                <span className="text-white font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
