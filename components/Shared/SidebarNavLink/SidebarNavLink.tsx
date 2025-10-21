import { GoHome } from "react-icons/go";
import { IoTrendingUp } from "react-icons/io5";
import { BsExclamationCircle } from "react-icons/bs";
import { RiMenuSearchLine } from "react-icons/ri";
import { FaRegQuestionCircle } from "react-icons/fa";
import FriendsIcon from "../../Icons/FriendsIcon";
import StoreIcon from "../../Icons/StoreIcon";
import SubscriptionIcon from "../../Icons/SubscriptionIcon";
import DatabaseIcon from "../../Icons/DatabaseIcon";
import Link from "next/link";
import HexagonIcon from "../../Icons/HexagonIcon";
import { FiPlus } from "react-icons/fi";
import { usePathname, useRouter } from "next/navigation";
const menuItems = [
  {
    icon: <GoHome size={24} />,
    label: "Home",
    href: "/",
  },
  {
    icon: <FriendsIcon />,
    label: "Friends",
    href: "/",
  },
  {
    icon: <IoTrendingUp size={24} />,
    label: "Popular",
    href: "/",
  },
  {
    icon: <StoreIcon />,
    label: "Virtual Store",
    href: "/",
  },
];
const menuItemsTwo = [
  {
    icon: <BsExclamationCircle size={24} className="scale-y-[-1]" />,
    label: "Contact Us",
    href: "/",
  },
  {
    icon: <RiMenuSearchLine size={24} />,
    label: "Topics",
    href: "/",
  },
  {
    icon: <FriendsIcon />,
    label: "Communities",
    href: "/",
  },
  {
    icon: <FaRegQuestionCircle size={24} />,
    label: "Help",
    href: "/",
  },
  {
    icon: <SubscriptionIcon />,
    label: "Subscription",
    href: "/",
  },
  {
    icon: <DatabaseIcon />,
    label: "Storage",
    href: "/",
  },
];

const SidebarNavLink = () => {
  const pathname =  usePathname()
  const router  = useRouter()
  return (
    <nav className={`space-y-3 text-gray-700 ${pathname === '/' ? 'mt-16' : 'py-10'}`}>
      <div className="bg-[#06133FBF] backdrop-blur-[1px] py-6 px-2 rounded-2xl">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-xs text-white flex items-center gap-5 hover:bg-[#06133FBF] p-2.5 px-6 rounded-xl duration-300 ease-in-out"
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </div>
      <div className="bg-[#06133FBF] backdrop-blur-[1px] py-1.5 px-2.5 rounded-2xl">
        <h3 className="text-base text-[#BCB3B3] px-8 mb-7">Communities</h3>
        <button onClick={() => router.push('/main/create-community')} className="w-full text-xs text-white flex items-center gap-5 hover:bg-[#06133FBF] p-2.5 px-6 rounded-xl duration-300 ease-in-out cursor-pointer">
          <FiPlus size={24} /> Create Communities
        </button>
        <button className="w-full text-xs text-white flex items-center gap-5 hover:bg-[#06133FBF] p-2.5 px-6 rounded-xl duration-300 ease-in-out cursor-pointer">
          <HexagonIcon /> Manage Communities
        </button>
      </div>
      <div className="bg-[#06133FBF] backdrop-blur-[1px] py-1.5 px-2.5 rounded-2xl">
        <h3 className="text-base text-[#BCB3B3] px-8 mb-7">Categories</h3>
        <button className="w-full text-xs text-white flex items-center gap-5 hover:bg-[#06133FBF] p-2.5 px-6 rounded-xl duration-300 ease-in-out cursor-pointer">
          <FiPlus size={24} /> Join Categories
        </button>
        <button className="w-full text-xs text-white flex items-center gap-5 hover:bg-[#06133FBF] p-2.5 px-6 rounded-xl duration-300 ease-in-out cursor-pointer">
          <HexagonIcon /> Manage Categories
        </button>
      </div>
      <div className="bg-[#06133FBF] backdrop-blur-[1px] py-6 px-2.5 rounded-2xl">
        {menuItemsTwo.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-xs text-white flex items-center gap-5 hover:bg-[#06133FBF] p-2.5 px-6 rounded-xl duration-300 ease-in-out"
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default SidebarNavLink;
