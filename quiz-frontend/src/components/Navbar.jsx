export default function Navbar() {
  return (
    <div className="flex justify-between items-center px-10 py-5 bg-[--color-bg] border-b border-gray-800">
      <h1 className="text-xl font-bold text-[--color-primary]">
        Dr. Anchal Classes
      </h1>

      <div className="space-x-4">
        <a href="/login" className="hover:text-[--color-primary]">
          Login
        </a>
        <a
          href="/signup"
          className="px-4 py-2 bg-[--color-primary] text-black rounded-lg"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}