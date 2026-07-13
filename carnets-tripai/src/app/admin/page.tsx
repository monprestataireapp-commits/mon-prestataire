"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Carnet = {
  id: string;
  slug: string;
  format: string;
  titre: string;
  sousTitre: string;
  publie: boolean;
  createdAt: string;
  _count: { etapes: number; pagesLivre: number };
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [carnets, setCarnets] = useState<Carnet[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/check").then((r) => {
      if (r.ok) {
        setAuthenticated(true);
        loadCarnets();
      } else setAuthenticated(false);
    });
  }, []);

  async function loadCarnets() {
    const r = await fetch("/api/carnets");
    if (r.ok) setCarnets(await r.json());
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) {
      setAuthenticated(true);
      loadCarnets();
    } else setError("Mot de passe incorrect");
  }

  async function createCarnet(format: "blog" | "livre") {
    const r = await fetch("/api/carnets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format }),
    });
    if (r.ok) {
      const c = await r.json();
      if (format === "livre") router.push(`/admin/livre/${c.id}`);
      else router.push(`/admin/carnet/${c.id}`);
    }
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/v/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  }

  async function deleteCarnet(c: Carnet) {
    const nom = c.titre || "Sans titre";
    if (
      !confirm(
        `Supprimer définitivement « ${nom} » ?\n\nToutes ses pages, photos, cœurs et messages du livre d'or seront perdus. Cette action est irréversible.`
      )
    )
      return;
    const r = await fetch(`/api/carnets/${c.id}`, { method: "DELETE" });
    if (r.ok) loadCarnets();
  }

  if (authenticated === null)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#8A7080]">Chargement…</p>
      </div>
    );

  if (!authenticated)
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <form
          onSubmit={login}
          className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">
            Trip<span className="text-rose">AI</span> · Admin
          </h1>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-rose/30 rounded-xl mb-4 outline-none focus:border-rose bg-bg"
          />
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          <button type="submit" className="btn-grad w-full rounded-xl py-3">
            Se connecter
          </button>
        </form>
      </div>
    );

  const blogs = carnets.filter((c) => c.format !== "livre");
  const livres = carnets.filter((c) => c.format === "livre");

  return (
    <div className="min-h-screen px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">
          Trip<span className="text-rose">AI</span>{" "}
          <span className="text-[#8A7080] font-inter font-normal text-base">
            · Mes carnets
          </span>
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => createCarnet("blog")}
            className="btn-grad rounded-xl text-sm"
          >
            + Blog
          </button>
          <button
            onClick={() => createCarnet("livre")}
            className="text-sm px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition font-semibold"
          >
            + Livre
          </button>
        </div>
      </div>

      {/* Blogs */}
      {blogs.length > 0 && (
        <>
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#8A7080] mb-3">
            Format Blog ({blogs.length})
          </h2>
          <div className="space-y-3 mb-8">
            {blogs.map((c) => (
              <CarnetCard
                key={c.id}
                carnet={c}
                copied={copied}
                onCopy={copyLink}
                onEdit={() => router.push(`/admin/carnet/${c.id}`)}
                onDelete={() => deleteCarnet(c)}
              />
            ))}
          </div>
        </>
      )}

      {/* Livres */}
      {livres.length > 0 && (
        <>
          <h2 className="font-semibold text-sm uppercase tracking-wider text-[#8A7080] mb-3">
            Format Livre ({livres.length})
          </h2>
          <div className="space-y-3 mb-8">
            {livres.map((c) => (
              <CarnetCard
                key={c.id}
                carnet={c}
                copied={copied}
                onCopy={copyLink}
                onEdit={() => router.push(`/admin/livre/${c.id}`)}
                onDelete={() => deleteCarnet(c)}
              />
            ))}
          </div>
        </>
      )}

      {carnets.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-[#8A7080]">
          <p className="text-4xl mb-4">📔</p>
          <p>Aucun carnet pour le moment.</p>
          <p className="text-sm mt-2">
            Cliquez sur « + Blog » ou « + Livre » pour commencer.
          </p>
        </div>
      )}
    </div>
  );
}

function CarnetCard({
  carnet: c,
  copied,
  onCopy,
  onEdit,
  onDelete,
}: {
  carnet: {
    id: string;
    slug: string;
    format: string;
    titre: string;
    sousTitre: string;
    publie: boolean;
    _count: { etapes: number; pagesLivre: number };
  };
  copied: string | null;
  onCopy: (slug: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isLivre = c.format === "livre";
  const count = isLivre ? c._count.pagesLivre : c._count.etapes;
  const label = isLivre ? "page" : "étape";

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="font-semibold">{c.titre || "Sans titre"}</h2>
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
              isLivre
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {isLivre ? "Livre" : "Blog"}
          </span>
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
              c.publie
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {c.publie ? "Publié" : "Brouillon"}
          </span>
        </div>
        <p className="text-sm text-[#8A7080]">
          {c.sousTitre || "—"} · {count} {label}
          {count > 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex gap-2">
        <a
          href={`/v/${c.slug}`}
          target="_blank"
          className="text-sm px-4 py-2 rounded-lg border border-rose/20 text-rose hover:bg-rose/5 transition"
        >
          Aperçu ↗
        </a>
        {c.publie && (
          <button
            onClick={() => onCopy(c.slug)}
            className="text-sm px-4 py-2 rounded-lg border border-rose/20 text-rose hover:bg-rose/5 transition"
          >
            {copied === c.slug ? "✓ Copié !" : "Copier le lien"}
          </button>
        )}
        <button
          onClick={onEdit}
          className="text-sm px-4 py-2 rounded-lg bg-dark text-white hover:opacity-90 transition"
        >
          Modifier
        </button>
        <button
          onClick={onDelete}
          title="Supprimer ce carnet"
          className="text-sm px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
