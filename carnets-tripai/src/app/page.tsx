import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">
        Trip<span className="text-rose">AI</span>{" "}
        <span className="text-[#8A7080] font-inter font-normal text-xl">
          · Carnets
        </span>
      </h1>
      <p className="text-lg text-[#5A4450] max-w-md mb-8 leading-relaxed">
        Des carnets de voyage personnalisés, composés à partir de vos photos et
        souvenirs. Un lien privé à partager avec vos proches.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <a
          href="https://tripai-phi.vercel.app"
          className="btn-grad rounded-full px-8 py-3 text-sm"
        >
          Découvrir TripAI
        </a>
        <Link
          href="/admin"
          className="rounded-full border border-rose/30 text-rose font-semibold px-8 py-3 text-sm hover:bg-rose/5 transition"
        >
          Espace admin
        </Link>
      </div>
    </div>
  );
}
