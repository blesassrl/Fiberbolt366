'use client';

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Radar, MapPin } from "lucide-react";

type Tone = "success" | "warn" | "error" | "neutral";

const STATUS_MAP: Record<string, { label: string; tone: Tone; icon: JSX.Element }> = {
  available: { label: "Disponibile", tone: "success", icon: <CheckCircle2 size={16} /> },
  soon: { label: "In arrivo", tone: "warn", icon: <AlertTriangle size={16} /> },
  in_build: { label: "In costruzione", tone: "warn", icon: <Radar size={16} /> },
  not_available: { label: "Non disponibile", tone: "error", icon: <XCircle size={16} /> },
};

function toneClass(t: Tone) {
  switch (t) {
    case "success": return "status-success";
    case "warn": return "status-warn";
    case "error": return "status-error";
    default: return "status-neutral";
  }
}

export default function CoveragePage() {
  const [country, setCountry] = useState("IT");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");
  const [civic, setCivic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [queried, setQueried] = useState<any | null>(null);

  const canSearch = useMemo(() => !!(country && city && (postalCode || street) && civic), [country, city, postalCode, street, civic]);

  async function search() {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const qs = new URLSearchParams({ country, city, postalCode, street, civic });
      const res = await fetch(`/api/coverage?${qs.toString()}`);
      if (res.status === 204) {
        setQueried({ country, city, postalCode, street, civic });
        setResults([]);
        return;
      }
      if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
      const data = await res.json();
      setQueried(data.query ?? { country, city, postalCode, street, civic });
      setResults(data.results || []);
    } catch (e: any) {
      setError(e.message || "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }

  function useGeolocation() {
    if (!navigator.geolocation) { setError("Geolocalizzazione non supportata."); return; }
    navigator.geolocation.getCurrentPosition(() => {
      // Placeholder: in un caso reale faresti reverse‑geocoding per riempire i campi
      setError(null);
    }, () => setError("Impossibile ottenere la posizione."));
  }

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">Verifica copertura fibra</h1>
      <div className="card space-y-4">
        <div className="grid md:grid-cols-6 gap-3">
          <div className="md:col-span-1">
            <label className="block text-sm mb-1">Paese</label>
            <select className="select w-full" value={country} onChange={(e)=>setCountry(e.target.value)}>
              <option value="IT">Italia</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Comune</label>
            <input className="input w-full" placeholder="Es. Asti" value={city} onChange={(e)=>setCity(e.target.value)} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm mb-1">CAP</label>
            <input className="input w-full" placeholder="Es. 14100" value={postalCode} onChange={(e)=>setPostalCode(e.target.value)} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm mb-1">Via</label>
            <input className="input w-full" placeholder="Es. Via Roma" value={street} onChange={(e)=>setStreet(e.target.value)} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm mb-1">Civico</label>
            <input className="input w-full" placeholder="Es. 10" value={civic} onChange={(e)=>setCivic(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="button" onClick={search} disabled={!canSearch || loading}>
            {loading ? "Verifico..." : "Verifica copertura"}
          </button>
          <button className="button" onClick={useGeolocation} disabled={loading}>
            Usa la mia posizione
          </button>
          <span className="text-sm text-slate-300">Compila Comune + CAP o Via + Civico</span>
        </div>

        {error && <div className="card status-error">Errore: {error}</div>}
        {results && <ResultsPanel queried={queried} results={results} />}
      </div>
    </main>
  );
}

function ResultsPanel({ queried, results }: { queried: any, results: any[] }) {
  if (!results.length) {
    return (
      <div className="card status-neutral">
        <div className="text-white/90 font-medium">Nessun risultato per l'indirizzo indicato</div>
        <div className="text-sm text-white/70">Ricerca: {[queried?.street, queried?.civic, queried?.postalCode, queried?.city].filter(Boolean).join(" ")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-white/80 text-sm">
        Risultati per <strong>{[queried?.street, queried?.civic, queried?.postalCode, queried?.city].filter(Boolean).join(" ")}</strong>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {results.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }}>
            <div className={"card " + toneClass(STATUS_MAP[r.status]?.tone || "neutral")}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold flex items-center gap-2">
                  <ProviderAvatar name={r.provider} /> {r.provider}
                </div>
                <span className="badge">{STATUS_MAP[r.status]?.icon}{STATUS_MAP[r.status]?.label || "Sconosciuto"}</span>
              </div>
              <div className="text-sm space-x-3 mb-2">
                <span className="badge">{r.tech || "n/d"}</span>
                {r.maxDownMbps && <span>↓ {r.maxDownMbps} Mbps</span>}
                {r.maxUpMbps && <span>↑ {r.maxUpMbps} Mbps</span>}
                {typeof r.estimatedActivationDays === "number" && <span>Attivazione ~ {r.estimatedActivationDays} gg</span>}
              </div>
              {r.notes && <div className="text-white/80 text-sm mb-2">{r.notes}</div>}
              {r.offersUrl && <a className="underline" href={r.offersUrl} target="_blank" rel="noreferrer">Vedi offerte</a>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ProviderAvatar({ name }: { name: string }) {
  const letters = name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
  return <div style={{width:32,height:32}} className="badge">{letters}</div>;
}
