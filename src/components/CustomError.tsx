import Link from "next/link";

interface ErrorProps {
  error: string | null;
}

const CustomError: React.FC<ErrorProps> = ({ error }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 gap-5">
      <div className="text-red-400 text-lg font-medium">
        {error || "Document not found"}
      </div>
      <Link
        href="/"
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        ← Return to Home
      </Link>
    </div>
  );
};

export default CustomError;