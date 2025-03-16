import Link from "next/link";
import LoginForm from "../../../components/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-100">
            Log in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{" "}
            <Link href="./register" className="font-medium text-blue-600 hover:text-blue-500">
              register a new account
            </Link>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}