"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ModerationLivreOr from "../../ModerationLivreOr";

type Element = {
  id: string;
  type: "photo" | "text";
  url?: string;
  content?: string;
  size?: "small" | "medium" | "large" | "full";
  textSize?: "sm" | "md" | "lg" | "xl";
  font?: "sans" | "serif" | "cursive";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  align?: "left" | "center" | "right";
  x?: number;
  y?: number;
  w?: number;
  h?: number;
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

const TEXT_SIZE_LABELS: Record<string, string> = {
  xs: "10px",
  sm: "12px",
  md: "14px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "30px",
  "4xl": "36px",
  "5xl": "48px",
};

const TEXT_SIZE_PX: Record<string, string> = {
  xs: "10px",
  sm: "12px",
  md: "14px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "30px",
  "4xl": "36px",
  "5xl": "48px",
};

const FONT_LABELS: Record<string, string> = {
  sans: "Sans-serif",
  serif: "Serif",
  cursive: "Cursive",
};

const FONT_CLASSES: Record<string, string> = {
  sans: "font-sans",
  serif: "font-serif",
  cursive: "font-cursive",
};

const TEXT_COLORS: { value: string; label: string }[] = [
  { value: "#5A4450", label: "Prune" },
  { value: "#2D1B25", label: "Noir" },
  { value: "#C8748A", label: "Rose" },
  { value: "#C8A951", label: "Doré" },
  { value: "#4A7C6F", label: "Vert" },
  { value: "#3B6B9E", label: "Bleu" },
  { value: "#FFFFFF", label: "Blanc" },
];

const LEGACY_WIDTHS: Record<string, number> = {
  small: 30,
  medium: 45,
  large: 70,
  full: 90,
};

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function withLayout(elements: Element[]): Element[] {
  let cursor = 0;
  return elements.map((el) => {
    if (el.x != null && el.y != null && el.w != null) return el;
    const w = LEGACY_WIDTHS[el.size || "medium"] ?? 45;
    const placed = {
      ...el,
      x: 5 + (cursor % 3) * 10,
      y: 4 + cursor * 16,
      w,
    };
    cursor++;
    return placed;
  });
}

function PageCanvas({
  carnetId,
  page,
  onDeletePage,
  pageLabel,
}: {
  carnetId: string;
  page: PageLivre;
  onDeletePage: () => void;
  pageLabel: string;
}) {
  const [els, setEls] = useState<Element[]>(() =>
    withLayout(JSON.parse(page.elements || "[]"))
  );
  const [history, setHistory] = useState<Element[][]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const elsRef = useRef(els);
  elsRef.current = els;
  const dragRef = useRef<{
    elId: string;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);

  const persist = useCallback(
    async (elements: Element[]) => {
      await fetch(`/api/carnets/${carnetId}/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements: JSON.stringify(elements) }),
      });
    },
    [carnetId, page.id]
  );

  function apply(elements: Element[]) {
    setHistory((prev) => [...prev, els]);
    setEls(elements);
    persist(elements);
  }

  function undo() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setEls(prev);
    persist(prev);
  }

  function startDrag(
    e: React.PointerEvent,
    elId: string,
    mode: "move" | "resize"
  ) {
    e.preventDefault();
    e.stopPropagation();
    beginDrag(elId, mode, e.clientX, e.clientY);
  }

  function beginDrag(
    elId: string,
    mode: "move" | "resize",
    clientX: number,
    clientY: number
  ) {
    const el = elsRef.current.find((x) => x.id === elId);
    if (!el) return;

    setEls((prev) => {
      const me = prev.find((x) => x.id === elId);
      if (!me) return prev;
      return [...prev.filter((x) => x.id !== elId), me];
    });

    let origH = el.h ?? 0;
    if (origH === 0 && mode === "resize" && canvasRef.current) {
      const elDom = canvasRef.current.querySelector(`[data-elid-wrap="${elId}"]`);
      if (elDom && canvasRef.current) {
        origH = (elDom.getBoundingClientRect().height / canvasRef.current.getBoundingClientRect().height) * 100;
      }
    }

    dragRef.current = {
      elId,
      mode,
      startX: clientX,
      startY: clientY,
      origX: el.x!,
      origY: el.y!,
      origW: el.w!,
      origH,
    };
    setDragId(elId);

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      const canvas = canvasRef.current;
      if (!d || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dx = ((ev.clientX - d.startX) / rect.width) * 100;
      const dy = ((ev.clientY - d.startY) / rect.height) * 100;
      setEls((prev) =>
        prev.map((el2) => {
          if (el2.id !== d.elId) return el2;
          if (d.mode === "move") {
            return {
              ...el2,
              x: clamp(d.origX + dx, 0, 100 - Math.min(el2.w ?? 45, 25)),
              y: clamp(d.origY + dy, 0, 96),
            };
          }
          return {
            ...el2,
            w: clamp(d.origW + dx, 10, 100),
            h: clamp(d.origH + dy, 3, 100),
          };
        })
      );
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      dragRef.current = null;
      setDragId(null);
      persist(elsRef.current);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  // Text blocks: press and move = drag the block; release without moving = edit
  function textPointerDown(e: React.PointerEvent, elId: string) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    let started = false;

    const onMove = (ev: PointerEvent) => {
      if (started) return;
      if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 5) {
        started = true;
        cleanup();
        beginDrag(elId, "move", startX, startY);
      }
    };
    const onUp = () => {
      cleanup();
      if (!started) {
        setEditingId(elId);
        setTimeout(() => {
          const ta = document.querySelector(
            `textarea[data-elid="${elId}"]`
          ) as HTMLTextAreaElement | null;
          if (ta) {
            ta.focus();
            ta.selectionStart = ta.value.length;
          }
        }, 0);
      }
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  async function uploadPhotos(files: File[]) {
    setUploading(true);
    let current = elsRef.current;
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "livre");
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      if (r.ok) {
        const data = await r.json();
        const n = current.length;
        current = [
          ...current,
          {
            id: genId(),
            type: "photo",
            url: data.url,
            x: 6 + (n % 4) * 8,
            y: 6 + (n % 4) * 10,
            w: 45,
          },
        ];
      }
    }
    apply(current);
    setUploading(false);
  }

  function addText() {
    const n = els.length;
    const newId = genId();
    apply([
      ...els,
      {
        id: newId,
        type: "text",
        content: "",
        textSize: "md",
        x: 6 + (n % 4) * 8,
        y: 6 + (n % 4) * 10,
        w: 60,
      },
    ]);
    setEditingId(newId);
    setTimeout(() => {
      (document.querySelector(
        `textarea[data-elid="${newId}"]`
      ) as HTMLTextAreaElement | null)?.focus();
    }, 0);
  }

  function updateElement(elId: string, update: Partial<Element>) {
    apply(els.map((el) => (el.id === elId ? { ...el, ...update } : el)));
  }

  function removeElement(elId: string) {
    apply(els.filter((el) => el.id !== elId));
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-gold">
          {pageLabel}
        </span>
        <button
          onClick={onDeletePage}
          className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50"
        >
          Supprimer la page
        </button>
      </div>

      <p className="text-xs text-[#8A7080] mb-3">
        Glissez les photos et les textes pour les placer où vous voulez. Un simple
        clic sur un texte pour l&apos;éditer. Tirez la poignée ronde en bas à
        droite d&apos;un élément pour changer sa taille.
      </p>

      {/* Free canvas — same 3:4 ratio as the public book page */}
      <div
        ref={canvasRef}
        className="relative mx-auto rounded-xl overflow-hidden bg-[#FFF8F9] border-2 border-dashed border-rose/20 select-none"
        style={{ width: "min(480px, 100%)", aspectRatio: "3 / 4" }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith("image/")
          );
          if (files.length) uploadPhotos(files);
        }}
      >
        {els.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-[#8A7080] text-sm px-8 text-center">
            Page vide — ajoutez des photos ou du texte ci-dessous, puis
            glissez-les où vous voulez
          </p>
        )}

        {els.map((el) => (
          <div
            key={el.id}
            data-elid-wrap={el.id}
            className={`absolute group ${
              dragId === el.id ? "ring-2 ring-rose z-30" : "hover:ring-1 hover:ring-rose/40"
            } rounded-lg`}
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.w}%`,
              ...(el.h ? { height: `${el.h}%` } : {}),
              touchAction: "none",
            }}
          >
            {/* Controls */}
            <div
              className={`absolute -top-7 right-0 z-20 flex gap-1 items-center transition ${
                dragId === el.id ? "opacity-0" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {el.type === "text" && (
                <>
                  <select
                    value={el.textSize || "md"}
                    onPointerDown={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      updateElement(el.id, {
                        textSize: e.target.value as Element["textSize"],
                      })
                    }
                    className="text-[10px] bg-white shadow rounded px-1 outline-none"
                  >
                    {Object.entries(TEXT_SIZE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <select
                    value={el.font || "sans"}
                    onPointerDown={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      updateElement(el.id, {
                        font: e.target.value as Element["font"],
                      })
                    }
                    className="text-[10px] bg-white shadow rounded px-1 outline-none"
                  >
                    {Object.entries(FONT_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => updateElement(el.id, { bold: !el.bold })}
                    className={`w-5 h-5 text-[11px] font-bold rounded shadow ${
                      el.bold ? "bg-rose text-white" : "bg-white text-[#5A4450]"
                    }`}
                  >
                    B
                  </button>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => updateElement(el.id, { italic: !el.italic })}
                    className={`w-5 h-5 text-[11px] italic rounded shadow ${
                      el.italic ? "bg-rose text-white" : "bg-white text-[#5A4450]"
                    }`}
                  >
                    I
                  </button>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => updateElement(el.id, { underline: !el.underline })}
                    className={`w-5 h-5 text-[11px] underline rounded shadow ${
                      el.underline ? "bg-rose text-white" : "bg-white text-[#5A4450]"
                    }`}
                  >
                    U
                  </button>
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => updateElement(el.id, { align: a })}
                      className={`w-5 h-5 text-[11px] rounded shadow ${
                        (el.align || "left") === a ? "bg-rose text-white" : "bg-white text-[#5A4450]"
                      }`}
                      title={a === "left" ? "Gauche" : a === "center" ? "Centré" : "Droite"}
                    >
                      {a === "left" ? "⫷" : a === "center" ? "☰" : "⫸"}
                    </button>
                  ))}
                  <div className="flex gap-0.5" onPointerDown={(e) => e.stopPropagation()}>
                    {TEXT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => updateElement(el.id, { color: c.value })}
                        title={c.label}
                        className={`w-4 h-4 rounded-full border ${
                          (el.color || "#5A4450") === c.value
                            ? "border-rose ring-1 ring-rose"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </>
              )}
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => removeElement(el.id)}
                className="w-5 h-5 bg-red-500 text-white shadow rounded text-[10px]"
              >
                ✕
              </button>
            </div>

            {el.type === "photo" ? (
              <img
                src={el.url}
                alt=""
                draggable={false}
                onPointerDown={(e) => startDrag(e, el.id, "move")}
                className="w-full rounded-lg shadow-md cursor-move object-cover"
                style={el.h ? { height: "100%" } : {}}
              />
            ) : (
              <div
                className={`relative rounded-lg ${
                  editingId === el.id
                    ? "bg-white border border-rose"
                    : "bg-white/60 border border-rose/15"
                }`}
                style={el.h ? { height: "100%", overflow: "hidden" } : {}}
              >
                <textarea
                  data-elid={el.id}
                  defaultValue={el.content}
                  onBlur={(e) => {
                    setEditingId(null);
                    updateElement(el.id, { content: e.target.value });
                  }}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = t.scrollHeight + "px";
                  }}
                  spellCheck={true}
                  lang="fr"
                  placeholder="Votre texte ici…"
                  className={`w-full bg-transparent p-2 outline-none resize-none overflow-hidden ${
                    FONT_CLASSES[el.font || "sans"]
                  } leading-relaxed`}
                  style={{
                    fontSize: TEXT_SIZE_PX[el.textSize || "md"] || "14px",
                    color: el.color || "#5A4450",
                    fontWeight: el.bold ? "bold" : "normal",
                    fontStyle: el.italic ? "italic" : "normal",
                    textDecoration: el.underline ? "underline" : "none",
                    textAlign: el.align || "left",
                    ...(el.h ? { height: "100%" } : {}),
                  }}
                  rows={el.h ? undefined : 2}
                />
                {editingId !== el.id && (
                  <div
                    onPointerDown={(e) => textPointerDown(e, el.id)}
                    className="absolute inset-0 cursor-move rounded-lg"
                    title="Glisser pour déplacer · cliquer pour éditer"
                  />
                )}
              </div>
            )}

            {/* Resize handle */}
            <div
              onPointerDown={(e) => startDrag(e, el.id, "resize")}
              className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border border-rose rounded-full shadow cursor-nwse-resize transition ${
                dragId === el.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
              title="Redimensionner"
            />
          </div>
        ))}
      </div>

      {/* Add elements */}
      <div className="flex gap-2 mt-4">
        <label className="cursor-pointer inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-dashed border-rose/30 text-rose hover:bg-rose/5 transition">
          {uploading ? "Envoi…" : "📷 Ajouter une photo"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length) uploadPhotos(files);
              e.target.value = "";
            }}
          />
        </label>
        <button
          onClick={addText}
          className="text-sm px-3 py-1.5 rounded-lg border border-dashed border-gold/30 text-gold hover:bg-gold/5 transition"
        >
          ✏️ Ajouter du texte
        </button>
        <button
          onClick={undo}
          disabled={history.length === 0}
          className="text-sm px-3 py-1.5 rounded-lg border border-dashed border-white/30 text-white/70 hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
          title="Annuler (Ctrl+Z)"
        >
          ↩ Annuler
        </button>
      </div>
    </div>
  );
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

  async function deletePage(pageId: string) {
    if (!confirm("Supprimer cette page ?")) return;
    await fetch(`/api/carnets/${id}/pages/${pageId}`, { method: "DELETE" });
    await load();
    setActivePage((p) => Math.max(0, p - 1));
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
      {pages.length > 0 && pages[activePage] && (
        <PageCanvas
          key={pages[activePage].id}
          carnetId={carnet.id}
          page={pages[activePage]}
          pageLabel={`Page ${activePage + 1}`}
          onDeletePage={() => deletePage(pages[activePage].id)}
        />
      )}

      <ModerationLivreOr carnetId={carnet.id} />
    </div>
  );
}
