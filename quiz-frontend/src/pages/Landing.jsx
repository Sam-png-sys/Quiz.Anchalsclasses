import Navbar from "../components/Navbar";

export default function Landing() {
  return (
    <div className="bg-[--color-bg] text-[--color-text] min-h-screen">

      <Navbar />

      <div className="flex flex-col items-center justify-center px-6 mt-32 text-center">
        
        <h1 className="mb-6 text-5xl font-bold">
          Smart Quiz Platform
          <span className="text-[--color-primary]"> for Coaching</span>
        </h1>

        <p className="text-[--color-muted] max-w-xl mb-8">
          Create quizzes, manage students, and track performance — all in one place.
        </p>

        <a
          href="/signup"
          className="px-8 py-3 bg-[--color-primary] text-black rounded-xl 
                     hover:shadow-[0_0_20px_#00E5FF80] transition"
        >
          Get Started
        </a>

      </div>

    </div>
  );
}