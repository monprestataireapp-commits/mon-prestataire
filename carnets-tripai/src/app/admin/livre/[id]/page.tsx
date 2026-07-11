"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

type Element = {
  id: string;
  type: "photo" | "text";
  url?: string;
  content?: string;
  size: "small" | "medium" | "large" | "full";
  textSize?: "sm" | "md" | "lg" | "xl";
};

type PageLivre = {
  id: string;
  ordre: number;
  elements: string;
};

type CarnetData = {
  id: string;
  slug: string;
  format: string;
  titre: string;
  sousTitre: string;
  dateDebut: string;
  dateFin: string;
  villes: string;
  photoCouverture: string | null;
  publie: boolean;
  pagesLivre: PageLivre[];
};

const SIZE_LABELS: Record<string, string> = {
  small: "Petit",
  medium: "Moyen",
  large: "Grand",
  full: "Plein",
};

const TEXT_SIZE_LABELS: Record<string, string> = {
  sm: "Petit",
  md: "Normal",
  lg: "Grand",
  xl: "Très grand",
};

const TEXT_SIZE_CLASSES: Record<string, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

const SIZE_WIDTHS: Record<string, string> = {
  small: "w-1/3",
  medium: "w-1/2",
  large: "w-3/4",
  full: "w-full",
};

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function EditLivre() {
  const { id } = useParams();
  const router = useRouter();
  const [carnet, setCarnet] = useState<CarnetData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(0);

  const load = useCallback(async () => {
    const r = await fetch(`/api/carnets/${id}`);
    if (r.ok) setCarnet(await r.json());
    else router.push("/admin");
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function saveCarnet(data: Partial<CarnetData>) {
    setSaving(true);
    await fetch(`/api/carnets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await load();
    setSaving(false);
  }

  async function togglePublish() {
    if (!carnet) return;
    await saveCarnet({ publie: !carnet.publie } as Partial<CarnetData>);
  }

  async function addPage() {
    await fetch(`/api/carnets/${id}/pages`, { method: "POST" });
    await load();
  }

  async function savePage(pageId: string, elements: Element[]) {
    await fetch(`/api/carnets/${id}/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ elements: JSON.stringify(elements) }),
    });
    await load();
  }

  async function deletePage(pageId: string) {
    if (!confirm("Supprimer cette page ?")) return;
    await fetch(`/api/carnets/${id}/pages/${pageId}`, { method: "DELETE" });
    await load();
    setActivePage((p) => Math.max(0, p - 1));
  }

  async function uploadPhoto(pageId: string, file: File, elements: Element[]) {
    setUploading(pageId);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "livre");
    const r = await fetch("/api/upload", { method: "POST", body: formData });
    if (r.ok) {
      const data = await r.json();
      const newEl: Element = {
        id: genId(),
        type: "photo",
        url: data.url,
        size: "medium",
      };
      await savePage(pageId, [...elements, newEl]);
    }
    setUploading(null);
  }

  function addText(pageId: string, elements: Element[]) {
    const newEl: Element = {
      id: genId(),
      type: "text",
      content: "",
      size: "full",
      textSize: "md",
    };
    savePage(pageId, [...elements, newEl]);
  }

  function updateElement(pageId: string, elements: Element[], elId: string, update: Partial<Element>) {
    const updated = elements.map((el) =>
      el.id === elId ? { ...el, ...update } : el
    );
    savePage(pageId, updated);
  }

  function removeElement(pageId: string, elements: Element[], elId: string) {
    savePage(pageId, elements.filter((el) => el.id !== elId));
  }

  function moveElement(pageId: string, elements: Element[], elId: string, dir: "up" | "down") {
    const idx = elements.findIndex((el) => el.id === elId);
    if (idx < 0) return;
    const newIdx = dir === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= elements.length) return;
    const copy = [...elements];
    [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
    savePage(pageId, copy);
  }

  async function saveAll() {
    if (!carnet) return;
    setSaving(true);
    const form = document.getElementById("livre-form") as HTMLElement;
    const get = (name: string) =>
      (form?.querySelector(`[data-field="${name}"]`) as HTMLInputElement)?.value;
    await saveCarnet({
      titre: get("titre") || carnet.titre,
      sousTitre: get("sousTitre") || carnet.sousTitre,
      dateDebut: get("dateDebut") || carnet.dateDebut,
      dateFin: get("dateFin") || carnet.dateFin,
      villes: JSON.stringify(
        (get("villes") || "").split(",").map((v: string) => v.trim()).filter(Boolean)
      ),
    } as Partial<CarnetData>);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!carnet)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#8A7080]">Chargement…</p>
      </div>
    );

  const villes = carnet.villes ? JSON.parse(carnet.villes) : [];
  const pages = carnet.pagesLivre;

  return (
    <div className="min-h-screen px-6 py-8 max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <button
          onClick={() => router.push("/admin")}
          className="text-sm text-[#8A7080] hover:text-dark transition"
        >
          ← Retour aux carnets
        </button>
        <div className="flex gap-2 items-center">
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
            Livre
          </span>
          <button
            onClick={saveAll}
            disabled={saving}
            className="text-sm px-5 py-2 rounded-lg font-semibold bg-rose text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Sauvegarde…" : saved ? "✓ Enregistré !" : "Enregistrer"}
          </button>
          <a
            href={`/v/${carnet.slug}`}
            target="_blank"
            className="text-sm px-4 py-2 rounded-lg border border-rose/20 text-rose hover:bg-rose/5 transition"
          >
            Aperçu ↗
          </a>
          <button
            onClick={togglePublish}
            className={`text-sm px-4 py-2 rounded-lg font-semibold transition ${
              carnet.publie
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {carnet.publie ? "Dépublier" : "Publier"}
          </button>
        </div>
      </div>

      {/* Carnet info */}
      <div id="livre-form" className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="font-bold text-lg mb-4">Informations du livre</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[#8A7080] mb-1 block">Titre</label>
            <input
              data-field="titre"
              defaultValue={carnet.titre}
              spellCheck={true}
              lang="fr"
              className="w-full px-4 py-2.5 border border-rose/20 rounded-xl outline-none focus:border-rose bg-bg"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#8A7080] mb-1 block">Sous-titre / Voyageurs</label>
            <input
              data-field="sousTitre"
              defaultValue={carnet.sousTitre}
              spellCheck={true}
              lang="fr"
              className="w-full px-4 py-2.5 border border-rose/20 rounded-xl outline-none focus:border-rose bg-bg"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#8A7080] mb-1 block">Date de début</label>
            <input
              data-field="dateDebut"
              type="date"
              defaultValue={carnet.dateDebut?.slice(0, 10)}
              className="w-full px-4 py-2.5 border border-rose/20 rounded-xl outline-none focus:border-rose bg-bg"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#8A7080] mb-1 block">Date de fin</label>
            <input
              data-field="dateFin"
              type="date"
              defaultValue={carnet.dateFin?.slice(0, 10)}
              className="w-full px-4 py-2.5 border border-rose/20 rounded-xl outline-none focus:border-rose bg-bg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#8A7080] mb-1 block">Villes (séparées par des virgules)</label>
            <input
              data-field="villes"
              defaultValue={villes.join(", ")}
              spellCheck={true}
              lang="fr"
              className="w-full px-4 py-2.5 border border-rose/20 rounded-xl outline-none focus:border-rose bg-bg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#8A7080] mb-1 block">Photo de couverture</label>
            <div className="flex items-center gap-4">
              {carnet.photoCouverture && (
                <img src={carnet.photoCouverture} alt="Couverture" className="w-32 h-20 object-cover rounded-xl" />
              )}
              <label className="cursor-pointer text-sm px-4 py-2 rounded-lg border border-rose/20 text-rose hover:bg-rose/5 transition">
                {uploading === "cover" ? "Envoi…" : "Choisir une image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setUploading("cover");
                    const fd = new FormData();
                    fd.append("file", f);
                    fd.append("type", "cover");
                    fd.append("carnetId", carnet.id);
                    const r = await fetch("/api/upload", { method: "POST", body: fd });
                    if (r.ok) {
                      const data = await r.json();
                      await saveCarnet({ photoCouverture: data.url } as Partial<CarnetData>);
                    }
                    setUploading(null);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Pages tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <h2 className="font-bold text-lg mr-2">Pages ({pages.length})</h2>
        {pages.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActivePage(i)}
            className={`text-sm px-3.5 py-1.5 rounded-lg transition ${
              activePage === i
                ? "bg-rose text-white"
                : "bg-white border border-rose/20 text-[#8A7080] hover:text-dark"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={addPage}
          className="text-sm px-3.5 py-1.5 rounded-lg bg-dark text-white hover:opacity-90 transition"
        >
          + Page
        </button>
      </div>

      {/* Active page editor */}
      {pages.length > 0 && pages[activePage] && (() => {
        const page = pages[activePage];
        const elements: Element[] = JSON.parse(page.elements || "[]");

        return (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                Page {activePage + 1}
              </span>
              <button
                onClick={() => deletePage(page.id)}
                className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50"
              >
                Supprimer la page
              </button>
            </div>

            {/* Preview area */}
            <div className="border-2 border-dashed border-rose/20 rounded-xl p-4 mb-4 min-h-[300px] bg-[#FFF8F9]">
              {elements.length === 0 && (
                <p className="text-center text-[#8A7080] text-sm py-12">
                  Page vide — ajoutez des photos ou du texte ci-dessous
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                {elements.map((el, idx) => (
                  <div
                    key={el.id}
                    className={`relative group ${SIZE_WIDTHS[el.size]} shrink-0`}
                    style={{ maxWidth: el.size === "full" ? "100%" : undefined }}
                  >
                    {/* Controls overlay */}
                    <div className="absolute -top-2 right-0 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => moveElement(page.id, elements, el.id, "up")}
                        disabled={idx === 0}
                        className="w-5 h-5 bg-white shadow rounded text-[10px] disabled:opacity-30"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => moveElement(page.id, elements, el.id, "down")}
                        disabled={idx === elements.length - 1}
                        className="w-5 h-5 bg-white shadow rounded text-[10px] disabled:opacity-30"
                      >
                        →
                      </button>
                      {/* Size selector */}
                      <select
                        value={el.size}
                        onChange={(e) =>
                          updateElement(page.id, elements, el.id, {
                            size: e.target.value as Element["size"],
                          })
                        }
                        className="text-[10px] bg-white shadow rounded px-1 outline-none"
                      >
                        {Object.entries(SIZE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                      {el.type === "text" && (
                        <select
                          value={el.textSize || "md"}
                          onChange={(e) =>
                            updateElement(page.id, elements, el.id, {
                              textSize: e.target.value as Element["textSize"],
                            })
                          }
                          className="text-[10px] bg-white shadow rounded px-1 outline-none"
                        >
                          {Object.entries(TEXT_SIZE_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={() => removeElement(page.id, elements, el.id)}
                        className="w-5 h-5 bg-red-500 text-white shadow rounded text-[10px]"
                      >
                        ✕
                      </button>
                    </div>

                    {el.type === "photo" ? (
                      <img
                        src={el.url}
                        alt=""
                        className="w-full rounded-lg object-cover"
                        style={{
                          height: el.size === "small" ? "120px" : el.size === "medium" ? "180px" : el.size === "large" ? "240px" : "320px",
                        }}
                      />
                    ) : (
                      <textarea
                        defaultValue={el.content}
                        onBlur={(e) =>
                          updateElement(page.id, elements, el.id, {
                            content: e.target.value,
                          })
                        }
                        spellCheck={true}
                        lang="fr"
                        placeholder="Votre texte ici…"
                        className={`w-full bg-transparent border border-rose/15 rounded-lg p-3 outline-none focus:border-rose resize-y ${
                          TEXT_SIZE_CLASSES[el.textSize || "md"]
                        } text-[#5A4450] leading-relaxed`}
                        rows={2}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add elements */}
            <div className="flex gap-2">
              <label
                className="cursor-pointer inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-dashed border-rose/30 text-rose hover:bg-rose/5 transition"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  Array.from(e.dataTransfer.files).forEach((f) =>
                    uploadPhoto(page.id, f, elements)
                  );
                }}
              >
                {uploading === page.id ? "Envoi…" : "📷 Ajouter une photo"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    Array.from(e.target.files || []).forEach((f) =>
                      uploadPhoto(page.id, f, elements)
                    );
                  }}
                />
              </label>
              <button
                onClick={() => addText(page.id, elements)}
                className="text-sm px-3 py-1.5 rounded-lg border border-dashed border-gold/30 text-gold hover:bg-gold/5 transition"
              >
                ✏️ Ajouter du texte
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
