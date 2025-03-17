import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRightCircleIcon  } from "@heroicons/react/24/solid";

const LogoutButton: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    router.push("/auth/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
    >
      <ArrowRightCircleIcon  className="w-5 h-5" />
      <span>Logout</span>
    </button>
  );
};

export default LogoutButton;