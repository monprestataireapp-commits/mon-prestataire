"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ModerationLivreOr from "../../ModerationLivreOr";

type Photo = { id: string; url: string; ordre: number };
type Etape = {
  id: string;
  ordre: number;
  jourLabel: string;
  titre: string;
  texte: string;
  photos: Photo[];
};
type CarnetData = {
  id: string;
  slug: string;
  titre: string;
  sousTitre: string;
  dateDebut: string;
  dateFin: string;
  villes: string;
  photoCouverture: string | null;
  publie: boolean;
  etapes: Etape[];
};

export default function EditCarnet() {
  const { id } = useParams();
  const router = useRouter();
  const [carnet, setCarnet] = useState<CarnetData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch(`/api/carnets/${id}`);
    if (r.ok) setCarnet(await r.json());
    else router.push("/admin");
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function save(data: Partial<CarnetData>) {
    setSaving(true);
    await fetch(`/api/carnets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await load();
    setSaving(false);
  }

  async function saveAll() {
    if (!carnet) return;
    setSaving(true);
    const form = document.getElementById("carnet-form") as HTMLElement;
    const get = (name: string) => (form.querySelector(`[data-field="${name}"]`) as HTMLInputElement)?.value;
    await save({
      titre: get("titre") || carnet.titre,
      sousTitre: get("sousTitre") || carnet.sousTitre,
      dateDebut: get("dateDebut") || carnet.dateDebut,
      dateFin: get("dateFin") || carnet.dateFin,
      villes: JSON.stringify(
        (get("villes") || "").split(",").map((v: string) => v.trim()).filter(Boolean)
      ),
    } as Partial<CarnetData>);
    for (const etape of carnet.etapes) {
      const el = document.getElementById(`etape-${etape.id}`) as HTMLElement | null;
      if (!el) continue;
      const eget = (name: string) => (el.querySelector(`[data-field="${name}"]`) as HTMLInputElement)?.value;
      await updateEtape(etape.id, {
        jourLabel: eget("jourLabel") || etape.jourLabel,
        titre: eget("titre") || etape.titre,
        texte: eget("texte") || etape.texte,
      });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function togglePublish() {
    if (!carnet) return;
    await save({ publie: !carnet.publie } as Partial<CarnetData>);
  }

  async function addEtape() {
    await fetch(`/api/carnets/${id}/etapes`, { method: "POST" });
    await load();
  }

  async function updateEtape(etapeId: string, data: Partial<Etape>) {
    await fetch(`/api/carnets/${id}/etapes/${etapeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await load();
  }

  async function deleteEtape(etapeId: string) {
    if (!confirm("Supprimer cette étape ?")) return;
    await fetch(`/api/carnets/${id}/etapes/${etapeId}`, { method: "DELETE" });
    await load();
  }

  async function uploadPhoto(etapeId: string, file: File) {
    setUploading(etapeId);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("etapeId", etapeId);
    await fetch(`/api/upload`, { method: "POST", body: formData });
    await load();
    setUploading(null);
  }

  async function uploadCover(file: File) {
    setUploading("cover");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "cover");
    formData.append("carnetId", id as string);
    await fetch(`/api/upload`, { method: "POST", body: formData });
    await load();
    setUploading(null);
  }

  async function deletePhoto(photoId: string) {
    await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
    await load();
  }

  async function updatePhotoOrdre(photoId: string, ordre: number) {
    await fetch(`/api/photos/${photoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ordre }),
    });
    await load();
  }

  async function moveEtape(etapeId: string, direction: "up" | "down") {
    await fetch(`/api/carnets/${id}/etapes/${etapeId}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    await load();
  }

  if (!carnet)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#8A7080]">Chargement…</p>
      </div>
    );

  const villes = carnet.villes ? JSON.parse(carnet.villes) : [];

  return (
    <div className="min-h-screen px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <button
          onClick={() => router.push("/admin")}
          className="text-sm text-[#8A7080] hover:text-dark transition"
        >
          ← Retour aux carnets
        </button>
        <div className="flex gap-2 items-center">
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
      <div id="carnet-form" className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="font-bold text-lg mb-4">Informations du carnet</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[#8A7080] mb-1 block">
              Titre
            </label>
            <input
              data-field="titre"
              defaultValue={carnet.titre}
              onBlur={(e) => save({ titre: e.target.value } as Partial<CarnetData>)}
              spellCheck={true}
              lang="fr"
              className="w-full px-4 py-2.5 border border-rose/20 rounded-xl outline-none focus:border-rose bg-bg"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#8A7080] mb-1 block">
              Prénoms des voyageurs
            </label>
            <input
              data-field="sousTitre"
              defaultValue={carnet.sousTitre}
              onBlur={(e) => save({ sousTitre: e.target.value } as Partial<CarnetData>)}
              spellCheck={true}
              lang="fr"
              className="w-full px-4 py-2.5 border border-rose/20 rounded-xl outline-none focus:border-rose bg-bg"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#8A7080] mb-1 block">
              Date de début
            </label>
            <input
              data-field="dateDebut"
              type="date"
              defaultValue={carnet.dateDebut?.slice(0, 10)}
              onBlur={(e) => save({ dateDebut: e.target.value } as Partial<CarnetData>)}
              className="w-full px-4 py-2.5 border border-rose/20 rounded-xl outline-none focus:border-rose bg-bg"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#8A7080] mb-1 block">
              Date de fin
            </label>
            <input
              data-field="dateFin"
              type="date"
              defaultValue={carnet.dateFin?.slice(0, 10)}
              onBlur={(e) => save({ dateFin: e.target.value } as Partial<CarnetData>)}
              className="w-full px-4 py-2.5 border border-rose/20 rounded-xl outline-none focus:border-rose bg-bg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#8A7080] mb-1 block">
              Villes de l&apos;itinéraire (séparées par des virgules)
            </label>
            <input
              data-field="villes"
              defaultValue={villes.join(", ")}
              onBlur={(e) =>
                save({
                  villes: JSON.stringify(
                    e.target.value.split(",").map((v: string) => v.trim()).filter(Boolean)
                  ),
                } as Partial<CarnetData>)
              }
              placeholder="Tokyo, Hakone, Kyoto, Osaka"
              spellCheck={true}
              lang="fr"
              className="w-full px-4 py-2.5 border border-rose/20 rounded-xl outline-none focus:border-rose bg-bg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#8A7080] mb-1 block">
              Photo de couverture
            </label>
            <div className="flex items-center gap-4">
              {carnet.photoCouverture && (
                <img
                  src={carnet.photoCouverture}
                  alt="Couverture"
                  className="w-32 h-20 object-cover rounded-xl"
                />
              )}
              <label className="cursor-pointer text-sm px-4 py-2 rounded-lg border border-rose/20 text-rose hover:bg-rose/5 transition">
                {uploading === "cover" ? "Envoi…" : "Choisir une image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadCover(f);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
        {saving && (
          <p className="text-xs text-gold mt-3">Sauvegarde en cours…</p>
        )}
      </div>

      {/* Etapes */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">
          Étapes ({carnet.etapes.length})
        </h2>
        <button
          onClick={addEtape}
          className="text-sm px-4 py-2 rounded-lg bg-dark text-white hover:opacity-90 transition"
        >
          + Ajouter une étape
        </button>
      </div>

      <div className="space-y-4">
        {carnet.etapes
          .sort((a, b) => a.ordre - b.ordre)
          .map((etape, idx) => (
            <div
              key={etape.id}
              id={`etape-${etape.id}`}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                  Étape {idx + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveEtape(etape.id, "up")}
                    disabled={idx === 0}
                    className="text-xs px-2 py-1 rounded border border-rose/10 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveEtape(etape.id, "down")}
                    disabled={idx === carnet.etapes.length - 1}
                    className="text-xs px-2 py-1 rounded border border-rose/10 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => deleteEtape(etape.id)}
                    className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 mb-3">
                <input
                  data-field="jourLabel"
                  defaultValue={etape.jourLabel}
                  onBlur={(e) =>
                    updateEtape(etape.id, { jourLabel: e.target.value })
                  }
                  placeholder="Jour 1 – 2 · Tokyo"
                  spellCheck={true}
                  lang="fr"
                  className="px-3 py-2 border border-rose/20 rounded-lg outline-none focus:border-rose bg-bg text-sm"
                />
                <input
                  data-field="titre"
                  defaultValue={etape.titre}
                  onBlur={(e) =>
                    updateEtape(etape.id, { titre: e.target.value })
                  }
                  placeholder="Titre de l'étape"
                  spellCheck={true}
                  lang="fr"
                  className="px-3 py-2 border border-rose/20 rounded-lg outline-none focus:border-rose bg-bg text-sm"
                />
              </div>
              <textarea
                data-field="texte"
                defaultValue={etape.texte}
                onBlur={(e) =>
                  updateEtape(etape.id, { texte: e.target.value })
                }
                placeholder="Texte de l'étape…"
                rows={3}
                spellCheck={true}
                lang="fr"
                className="w-full px-3 py-2 border border-rose/20 rounded-lg outline-none focus:border-rose bg-bg text-sm mb-3 resize-y"
              />

              {/* Photos */}
              <div className="flex flex-wrap gap-2 mb-3">
                {etape.photos
                  .sort((a, b) => a.ordre - b.ordre)
                  .map((p) => (
                    <div key={p.id} className="relative group flex flex-col items-center gap-1">
                      <div className="relative">
                        <img
                          src={p.url}
                          alt=""
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => deletePhoto(p.id)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        type="number"
                        defaultValue={p.ordre}
                        onBlur={(e) => {
                          const v = parseInt(e.target.value);
                          if (!isNaN(v) && v !== p.ordre) updatePhotoOrdre(p.id, v);
                        }}
                        className="w-10 text-center text-xs py-0.5 border border-rose/20 rounded bg-bg outline-none focus:border-rose"
                        title="Ordre d'affichage"
                      />
                    </div>
                  ))}
              </div>
              <label
                className="cursor-pointer inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-dashed border-rose/30 text-rose hover:bg-rose/5 transition"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  files.forEach((f) => uploadPhoto(etape.id, f));
                }}
              >
                {uploading === etape.id
                  ? "Envoi en cours…"
                  : "📷 Ajouter des photos (ou glisser-déposer)"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach((f) => uploadPhoto(etape.id, f));
                  }}
                />
              </label>
            </div>
          ))}
      </div>

      <ModerationLivreOr carnetId={carnet.id} />
    </div>
  );
}
