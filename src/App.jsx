import { useState, useEffect } from "react";

const SUPA_URL = "https://fxwnpebzfcfvqvnxkayn.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4d25wZWJ6ZmNmdnF2bnhrYXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzMxMDUsImV4cCI6MjA5NDIwOTEwNX0._94i3GtL_5IPFdm8aVs1RRIhwXEiPd-cudf0Fomh3fs";
const HEADERS = { "Content-Type": "application/json", "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}` };

async function sb(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, { headers: HEADERS, ...opts });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || res.statusText); }
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}
async function sbAuth(path: string, body: object) {
  const res = await fetch(`${SUPA_URL}/auth/v1/${path}`, { method: "POST", headers: { "Content-Type": "application/json", "apikey": SUPA_KEY }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || "Auth error");
  return data;
}

const SEED = [
  { brand: "Apple", model: "iPhone 15 Pro Max", storage: "256GB", condition: "Excellent", color: "Titanium", image_url: "", start_price: 8500, current_bid: 9200, end_time: new Date(Date.now() + 3600e3 * 24).toISOString() },
  { brand: "Samsung", model: "Galaxy S24 Ultra", storage: "512GB", condition: "Good", color: "Phantom Black", image_url: "", start_price: 7000, current_bid: 7650, end_time: new Date(Date.now() + 3600e3 * 48).toISOString() },
  { brand: "Google", model: "Pixel 8 Pro", storage: "128GB", condition: "Like New", color: "Obsidian", image_url: "", start_price: 5500, current_bid: 5800, end_time: new Date(Date.now() + 3600e3 * 12).toISOString() },
  { brand: "OnePlus", model: "12R", storage: "256GB", condition: "Good", color: "Iron Gray", image_url: "", start_price: 3200, current_bid: 3450, end_time: new Date(Date.now() + 3600e3 * 72).toISOString() },
  { brand: "Apple", model: "iPhone 14", storage: "128GB", condition: "Fair", color: "Midnight", image_url: "", start_price: 5000, current_bid: 5300, end_time: new Date(Date.now() + 3600e3 * 36).toISOString() },
  { brand: "Samsung", model: "Galaxy A54", storage: "128GB", condition: "Excellent", color: "Awesome Violet", image_url: "", start_price: 2800, current_bid: 2950, end_time: new Date(Date.now() + 3600e3 * 60).toISOString() },
];

const formatZAR = (n: number) => "R " + Number(n).toLocaleString("en-ZA");
const formatTime = (ms: number) => {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

// ── Apple-style design tokens ─────────────────────────────────────────────────
const C = {
  black: "#1d1d1f",
  white: "#ffffff",
  gray1: "#f5f5f7",   // page bg
  gray2: "#e8e8ed",   // borders
  gray3: "#6e6e73",   // muted text
  gray4: "#424245",   // secondary text
  blue: "#0071e3",    // Apple blue
  blueHover: "#0077ed",
  green: "#1d8348",
  greenLight: "#eafaf1",
  red: "#c0392b",
  redLight: "#fdedec",
  amber: "#d4830a",
  amberLight: "#fef9e7",
};

const font = "'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', sans-serif";

const s: Record<string, React.CSSProperties> = {
  inp: { border: `1px solid ${C.gray2}`, borderRadius: 12, padding: "11px 16px", fontSize: 15, width: "100%", background: C.white, color: C.black, boxSizing: "border-box", outline: "none", fontFamily: font },
  btnPrimary: { background: C.blue, color: C.white, border: "none", borderRadius: 980, padding: "12px 24px", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: font, letterSpacing: "-0.01em" },
  btnSecondary: { background: "transparent", color: C.blue, border: `1px solid ${C.blue}`, borderRadius: 980, padding: "11px 24px", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: font },
  btnGhost: { background: "transparent", color: C.gray3, border: "none", padding: "8px 14px", fontSize: 14, cursor: "pointer", fontFamily: font },
  btnDanger: { background: C.redLight, color: C.red, border: `1px solid ${C.red}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontFamily: font },
  card: { background: C.white, border: `1px solid ${C.gray2}`, borderRadius: 18, padding: 24 },
  label: { fontSize: 12, fontWeight: 500, color: C.gray3, marginBottom: 6, display: "block", letterSpacing: "0.02em", textTransform: "uppercase" as const },
};

function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const init = (name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  return <div style={{ width: size, height: size, borderRadius: "50%", background: C.gray1, border: `1px solid ${C.gray2}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 600, color: C.gray4, flexShrink: 0, fontFamily: font }}>{init}</div>;
}

function Countdown({ endTime }: { endTime: string }) {
  const [left, setLeft] = useState(new Date(endTime).getTime() - Date.now());
  useEffect(() => { const t = setInterval(() => setLeft(new Date(endTime).getTime() - Date.now()), 1000); return () => clearInterval(t); }, [endTime]);
  const urgent = left < 3600e3 && left > 0, ended = left <= 0;
  return (
    <span style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 980, background: ended ? C.gray1 : urgent ? C.redLight : C.greenLight, color: ended ? C.gray3 : urgent ? C.red : C.green, letterSpacing: "0.01em", fontFamily: font }}>
      {ended ? "Ended" : `${formatTime(left)} left`}
    </span>
  );
}

function CondBadge({ cond }: { cond: string }) {
  const map: Record<string, [string, string]> = { "Like New": [C.greenLight, C.green], "Excellent": ["#eaf3fb", C.blue], "Good": [C.amberLight, C.amber], "Fair": [C.redLight, C.red] };
  const [bg, col] = map[cond] ?? [C.gray1, C.gray3];
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 980, background: bg, color: col, letterSpacing: "0.02em", textTransform: "uppercase", fontFamily: font }}>{cond}</span>;
}

function Toast({ msg, type }: { msg: string; type: string }) {
  if (!msg) return null;
  const bg = type === "success" ? C.black : type === "warn" ? C.amber : C.red;
  return <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: bg, color: C.white, padding: "14px 28px", borderRadius: 980, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", pointerEvents: "none", fontFamily: font, letterSpacing: "-0.01em" }}>{msg}</div>;
}

function ConfirmModal({ msg, onConfirm, onCancel }: { msg: React.ReactNode; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, backdropFilter: "blur(4px)" }}>
      <div style={{ ...s.card, maxWidth: 380, width: "90%", textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 15, color: C.black, marginBottom: 28, lineHeight: 1.5, fontFamily: font }}>{msg}</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onCancel} style={s.btnSecondary}>Cancel</button>
          <button onClick={onConfirm} style={s.btnPrimary}>Confirm bid</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [listings, setListings] = useState<any[]>([]);
  const [bids, setBids] = useState<Record<number, any[]>>({});
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [page, setPage] = useState("home");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "", username: "" });
  const [authErr, setAuthErr] = useState("");
  const [bidInput, setBidInput] = useState("");
  const [confirm, setConfirm] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [adminForm, setAdminForm] = useState({ brand: "", model: "", storage: "", condition: "Good", color: "", startPrice: "", hours: "", imageUrl: "" });
  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);

  const showToast = (msg: string, type = "success", ms = 2800) => { setToast({ msg, type }); setTimeout(() => setToast({ msg: "", type: "" }), ms); };

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("pb_session");
        if (raw) { const sess = JSON.parse(raw); setSession(sess); await loadProfile(sess.user.id); }
        const wl = localStorage.getItem("pb_watchlist");
        if (wl) setWatchlist(JSON.parse(wl));
        await loadListings();
      } catch {}
      setLoading(false);
    })();
  }, []);

  async function loadListings() {
    try {
      let data = await sb("listings?order=created_at.desc&select=*");
      if (!data || data.length === 0) {
        await sb("listings", { method: "POST", headers: { ...HEADERS, "Prefer": "return=representation" }, body: JSON.stringify(SEED) });
        data = await sb("listings?order=created_at.desc&select=*");
      }
      setListings(data || []);
    } catch { showToast("Could not load listings", "error"); }
  }

  async function loadBids(id: number) {
    try { const data = await sb(`bids?listing_id=eq.${id}&order=created_at.desc&select=*`); setBids(p => ({ ...p, [id]: data || [] })); } catch {}
  }

  async function loadProfile(uid: string) {
    try { const d = await sb(`profiles?id=eq.${uid}&select=*`); if (d?.[0]) setProfile(d[0]); } catch {}
  }

  async function login() {
    if (!authForm.email || !authForm.password) { setAuthErr("Enter your email and password."); return; }
    try {
      const data = await sbAuth("token?grant_type=password", { email: authForm.email, password: authForm.password });
      localStorage.setItem("pb_session", JSON.stringify(data));
      setSession(data); await loadProfile(data.user.id);
      setAuthErr(""); setPage("home"); showToast("Welcome back.");
    } catch (e: any) { setAuthErr(e.message); }
  }

  async function register() {
    if (!authForm.name || !authForm.email || !authForm.password || !authForm.username) { setAuthErr("All fields are required."); return; }
    if (authForm.password.length < 6) { setAuthErr("Password must be at least 6 characters."); return; }
    try {
      const data = await sbAuth("signup", { email: authForm.email, password: authForm.password });
      const isAdmin = authForm.email === "admin@phonebid.co.za";
      await sb("profiles", { method: "POST", headers: { ...HEADERS, "Authorization": `Bearer ${data.access_token}`, "Prefer": "return=minimal" }, body: JSON.stringify({ id: data.user.id, name: authForm.name, username: authForm.username, is_admin: isAdmin }) });
      localStorage.setItem("pb_session", JSON.stringify(data));
      setSession(data); setProfile({ id: data.user.id, name: authForm.name, username: authForm.username, is_admin: isAdmin });
      setAuthErr(""); setPage("home"); showToast(`Welcome, ${authForm.name.split(" ")[0]}.`);
    } catch (e: any) { setAuthErr(e.message); }
  }

  function logout() { localStorage.removeItem("pb_session"); setSession(null); setProfile(null); setPage("home"); }

  const toggleWatch = (id: number) => {
    const next = watchlist.includes(id) ? watchlist.filter(x => x !== id) : [...watchlist, id];
    setWatchlist(next); localStorage.setItem("pb_watchlist", JSON.stringify(next));
    showToast(next.includes(id) ? "Added to watchlist" : "Removed from watchlist");
  };

  const activePhone = selectedId ? listings.find(p => p.id === selectedId) : null;
  const activeBids = selectedId ? (bids[selectedId] || []) : [];

  function requestBid() {
    const amt = parseFloat(bidInput);
    if (!session) { showToast("Sign in to place a bid", "error"); return; }
    if (!amt || isNaN(amt)) { showToast("Enter a valid amount", "error"); return; }
    if (amt <= activePhone.current_bid) { showToast(`Bid must exceed ${formatZAR(activePhone.current_bid)}`, "error"); return; }
    setConfirm({ phone: activePhone, amount: amt });
  }

  async function confirmBid() {
    const { phone, amount } = confirm; setConfirm(null); setBidLoading(true);
    try {
      await sb("bids", { method: "POST", headers: { ...HEADERS, "Prefer": "return=minimal" }, body: JSON.stringify({ listing_id: phone.id, user_id: session.user.id, user_name: profile?.name || session.user.email, amount }) });
      await sb(`listings?id=eq.${phone.id}`, { method: "PATCH", headers: { ...HEADERS, "Prefer": "return=minimal" }, body: JSON.stringify({ current_bid: amount }) });
      setListings(prev => prev.map(p => p.id === phone.id ? { ...p, current_bid: amount } : p));
      await loadBids(phone.id); setBidInput(""); showToast(`Bid of ${formatZAR(amount)} placed.`);
    } catch (e: any) { showToast("Bid failed: " + e.message, "error"); }
    setBidLoading(false);
  }

  async function addListing() {
    const { brand, model, storage, condition, color, startPrice, hours, imageUrl } = adminForm;
    if (!brand || !model || !startPrice || !hours) { showToast("Fill in all required fields", "error"); return; }
    const price = parseFloat(startPrice);
    try {
      await sb("listings", { method: "POST", headers: { ...HEADERS, "Prefer": "return=minimal" }, body: JSON.stringify({ brand, model, storage: storage || "N/A", condition: condition || "Good", color: color || "N/A", image_url: imageUrl || "", start_price: price, current_bid: price, end_time: new Date(Date.now() + parseFloat(hours) * 3600e3).toISOString() }) });
      await loadListings();
      setAdminForm({ brand: "", model: "", storage: "", condition: "Good", color: "", startPrice: "", hours: "", imageUrl: "" });
      showToast("Listing added.");
    } catch (e: any) { showToast("Failed: " + e.message, "error"); }
  }

  async function removeListing(id: number) {
    try { await sb(`listings?id=eq.${id}`, { method: "DELETE", headers: HEADERS }); setListings(p => p.filter(x => x.id !== id)); showToast("Listing removed.", "warn"); }
    catch (e: any) { showToast("Failed: " + e.message, "error"); }
  }

  const endMs = (p: any) => new Date(p.end_time).getTime();
  const filtered = listings.filter(p => {
    const matchSearch = search === "" || `${p.brand} ${p.model}`.toLowerCase().includes(search.toLowerCase());
    const ms = endMs(p);
    const matchFilter = filter === "all" || (filter === "active" && ms > Date.now()) || (filter === "ending" && (ms - Date.now()) < 3600e3 && ms > Date.now()) || (filter === "watched" && watchlist.includes(p.id));
    return matchSearch && matchFilter;
  });

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: C.gray3, fontSize: 15, fontFamily: font }}>Loading…</div>;

  return (
    <div style={{ fontFamily: font, color: C.black, minHeight: "100vh", background: C.gray1 }}>
      <Toast {...toast} />
      {confirm && <ConfirmModal msg={<>Place a bid of <strong>{formatZAR(confirm.amount)}</strong> on <strong>{confirm.phone.brand} {confirm.phone.model}</strong>?</>} onConfirm={confirmBid} onCancel={() => setConfirm(null)} />}

      {/* ── NAV (Apple-style top bar) ── */}
      <nav style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${C.gray2}`, padding: "0 40px", display: "flex", alignItems: "center", height: 52, position: "sticky", top: 0, zIndex: 200 }}>
        <span onClick={() => setPage("home")} style={{ fontWeight: 600, fontSize: 18, cursor: "pointer", color: C.black, letterSpacing: "-0.03em", marginRight: 32 }}>PhoneBid</span>
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          {[["home", "Auctions"], ...(profile?.is_admin ? [["admin", "Admin"]] : [])].map(([k, l]) => (
            <button key={k} onClick={() => setPage(k)} style={{ ...s.btnGhost, color: page === k ? C.black : C.gray3, fontWeight: page === k ? 500 : 400, fontSize: 14 }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {session ? (
            <>
              <button onClick={() => setPage("profile")} style={{ ...s.btnGhost, color: page === "profile" ? C.black : C.gray3, display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar name={profile?.name || "U"} size={26} /><span style={{ fontSize: 14 }}>{profile?.name?.split(" ")[0]}</span>
              </button>
              <button onClick={logout} style={{ ...s.btnGhost, fontSize: 13 }}>Sign out</button>
            </>
          ) : (
            <button onClick={() => { setPage("auth"); setAuthMode("login"); setAuthErr(""); }} style={s.btnPrimary}>Sign in</button>
          )}
        </div>
      </nav>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px" }}>

        {/* ── HOME ── */}
        {page === "home" && (<>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.blue, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>Live auctions · South Africa</div>
            <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-0.04em", color: C.black, margin: "0 0 16px", lineHeight: 1.05 }}>Bid on pre-owned phones.</h1>
            <p style={{ fontSize: 19, color: C.gray3, margin: "0 auto 32px", maxWidth: 480, lineHeight: 1.5, fontWeight: 400 }}>Real devices. Real prices. All in South African Rand.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {[["all", "All listings"], ["active", "Active"], ["ending", "Ending soon"], ["watched", `Watchlist (${watchlist.length})`]].map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)} style={{ ...(filter === k ? s.btnPrimary : s.btnSecondary), padding: "9px 20px", fontSize: 14 }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div style={{ display: "flex", gap: 12, marginBottom: 32, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.gray3, fontSize: 15 }}>⌕</span>
              <input placeholder="Search brand or model…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...s.inp, paddingLeft: 36, background: C.white }} />
            </div>
            <span style={{ fontSize: 13, color: C.gray3 }}>{filtered.length} listing{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {filtered.length === 0 && <div style={{ color: C.gray3, fontSize: 15, gridColumn: "1/-1", padding: 60, textAlign: "center" }}>No listings found.</div>}
            {filtered.map(p => {
              const ended = endMs(p) <= Date.now();
              return (
                <div key={p.id} style={{ background: C.white, border: `1px solid ${C.gray2}`, borderRadius: 18, overflow: "hidden", cursor: "pointer", position: "relative", transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.10)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                  onClick={() => { setSelectedId(p.id); setPage("detail"); setBidInput(""); loadBids(p.id); }}>
                  {/* Image area */}
                  <div style={{ height: 180, background: C.gray1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, position: "relative" }}>
                    {p.image_url ? <img src={p.image_url} style={{ height: 160, objectFit: "contain" }} alt="" /> : "📱"}
                    <button onClick={e => { e.stopPropagation(); toggleWatch(p.id); }} style={{ position: "absolute", top: 12, right: 12, background: C.white, border: `1px solid ${C.gray2}`, borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {watchlist.includes(p.id) ? "♥" : "♡"}
                    </button>
                  </div>
                  {/* Info */}
                  <div style={{ padding: "16px 20px 20px" }}>
                    <div style={{ fontSize: 12, color: C.gray3, marginBottom: 2, fontWeight: 500 }}>{p.brand}</div>
                    <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8, letterSpacing: "-0.02em" }}>{p.model}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
                      <CondBadge cond={p.condition} />
                      <span style={{ fontSize: 12, color: C.gray3 }}>{p.storage}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ fontSize: 11, color: C.gray3, marginBottom: 2, letterSpacing: "0.02em", textTransform: "uppercase" as const }}>Current bid</div>
                        <div style={{ fontWeight: 700, fontSize: 22, color: ended ? C.gray3 : C.black, letterSpacing: "-0.03em" }}>{formatZAR(p.current_bid)}</div>
                      </div>
                      <Countdown endTime={p.end_time} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>)}

        {/* ── DETAIL ── */}
        {page === "detail" && activePhone && (() => {
          const ended = endMs(activePhone) <= Date.now();
          const minBid = activePhone.current_bid + 50;
          return (
            <div>
              <button onClick={() => setPage("home")} style={{ ...s.btnGhost, padding: 0, marginBottom: 32, fontSize: 14, color: C.gray3 }}>← All auctions</button>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                {/* Left */}
                <div>
                  <div style={{ background: C.gray1, borderRadius: 18, height: 320, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, marginBottom: 24 }}>
                    {activePhone.image_url ? <img src={activePhone.image_url} style={{ height: 280, objectFit: "contain" }} alt="" /> : "📱"}
                  </div>
                  <div style={{ ...s.card }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                      <div>
                        <div style={{ fontSize: 13, color: C.gray3, marginBottom: 4 }}>{activePhone.brand}</div>
                        <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: "-0.03em" }}>{activePhone.model}</div>
                      </div>
                      <button onClick={() => toggleWatch(activePhone.id)} style={{ background: "none", border: `1px solid ${C.gray2}`, borderRadius: "50%", width: 38, height: 38, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>{watchlist.includes(activePhone.id) ? "♥" : "♡"}</button>
                    </div>
                    {[["Storage", activePhone.storage], ["Condition", activePhone.condition], ["Colour", activePhone.color], ["Starting price", formatZAR(activePhone.start_price)]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.gray1}`, fontSize: 14 }}>
                        <span style={{ color: C.gray3 }}>{k}</span>
                        <span style={{ fontWeight: 500 }}>{k === "Condition" ? <CondBadge cond={v} /> : v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ ...s.card, padding: 32 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: C.gray3, textTransform: "uppercase" as const, letterSpacing: "0.05em", fontWeight: 500 }}>Current bid</span>
                      <Countdown endTime={activePhone.end_time} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 40, letterSpacing: "-0.04em", color: ended ? C.gray3 : C.black, marginBottom: 28 }}>{formatZAR(activePhone.current_bid)}</div>
                    {!ended && (session ? (<>
                      <label style={s.label}>Your bid (min {formatZAR(minBid)})</label>
                      <input type="number" placeholder={String(minBid)} value={bidInput} onChange={e => setBidInput(e.target.value)} style={{ ...s.inp, marginBottom: 14, fontSize: 18, fontWeight: 500 }} min={minBid} />
                      <button onClick={requestBid} disabled={bidLoading} style={{ ...s.btnPrimary, width: "100%", padding: 16, fontSize: 16, opacity: bidLoading ? 0.7 : 1 }}>{bidLoading ? "Placing bid…" : "Place bid"}</button>
                      <p style={{ fontSize: 12, color: C.gray3, textAlign: "center", marginTop: 10 }}>You'll confirm before your bid is submitted.</p>
                    </>) : (
                      <button onClick={() => { setPage("auth"); setAuthMode("login"); }} style={{ ...s.btnPrimary, width: "100%", padding: 16, fontSize: 16 }}>Sign in to bid</button>
                    ))}
                    {ended && <div style={{ fontSize: 15, color: C.gray3, textAlign: "center" }}>This auction has ended.</div>}
                  </div>

                  <div style={s.card}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, letterSpacing: "-0.02em" }}>Bid history <span style={{ color: C.gray3, fontWeight: 400 }}>({activeBids.length})</span></div>
                    {activeBids.length === 0 ? <div style={{ fontSize: 14, color: C.gray3 }}>No bids yet — be the first.</div>
                      : activeBids.slice(0, 8).map((b: any, i: number) => (
                        <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.gray1}`, fontSize: 14 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar name={b.user_name} size={28} />
                            <span style={{ fontWeight: i === 0 ? 600 : 400 }}>{b.user_name}</span>
                            {i === 0 && <span style={{ fontSize: 10, background: C.greenLight, color: C.green, padding: "2px 8px", borderRadius: 980, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Leading</span>}
                          </span>
                          <span style={{ fontWeight: i === 0 ? 700 : 400, letterSpacing: "-0.02em" }}>{formatZAR(b.amount)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── AUTH ── */}
        {page === "auth" && (
          <div style={{ maxWidth: 420, margin: "40px auto" }}>
            <div style={{ ...s.card, padding: 40 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📱</div>
                <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 8px" }}>PhoneBid</h2>
                <p style={{ fontSize: 15, color: C.gray3, margin: 0 }}>{authMode === "login" ? "Sign in to your account" : "Create your account"}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {authMode === "register" && (<>
                  <div><label style={s.label}>Full name</label><input placeholder="Thabo Nkosi" value={authForm.name} onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))} style={s.inp} /></div>
                  <div><label style={s.label}>Username</label><input placeholder="thabo_za" value={authForm.username} onChange={e => setAuthForm(f => ({ ...f, username: e.target.value }))} style={s.inp} /></div>
                </>)}
                <div><label style={s.label}>Email address</label><input type="email" value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} style={s.inp} /></div>
                <div><label style={s.label}>Password</label><input type="password" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} style={s.inp} /></div>
              </div>
              {authErr && <div style={{ color: C.red, fontSize: 13, marginTop: 14, padding: "10px 14px", background: C.redLight, borderRadius: 10 }}>{authErr}</div>}
              <button onClick={authMode === "login" ? login : register} style={{ ...s.btnPrimary, width: "100%", padding: 15, marginTop: 20, fontSize: 16 }}>
                {authMode === "login" ? "Sign in" : "Create account"}
              </button>
              <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: C.gray3 }}>
                {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
                <span onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthErr(""); }} style={{ color: C.blue, cursor: "pointer", fontWeight: 500 }}>
                  {authMode === "login" ? "Create one" : "Sign in"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {page === "profile" && session && (
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ ...s.card, display: "flex", alignItems: "center", gap: 20, marginBottom: 20, padding: 32 }}>
              <Avatar name={profile?.name || "U"} size={64} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.03em" }}>{profile?.name}</div>
                <div style={{ fontSize: 14, color: C.gray3, marginTop: 4 }}>@{profile?.username} · {session.user.email}</div>
                {profile?.is_admin && <span style={{ fontSize: 11, background: C.black, color: C.white, padding: "3px 10px", borderRadius: 980, fontWeight: 600, marginTop: 8, display: "inline-block", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Admin</span>}
              </div>
            </div>
            <div style={s.card}>
              <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4, letterSpacing: "-0.02em" }}>Watchlist</div>
              <div style={{ fontSize: 13, color: C.gray3, marginBottom: 16 }}>{watchlist.length} item{watchlist.length !== 1 ? "s" : ""}</div>
              {watchlist.length === 0 ? <div style={{ fontSize: 14, color: C.gray3 }}>Nothing saved yet. Tap ♡ on any listing.</div>
                : watchlist.map((id: number) => {
                  const p = listings.find((x: any) => x.id === id);
                  if (!p) return null;
                  return (
                    <div key={id} onClick={() => { setSelectedId(id); setPage("detail"); loadBids(id); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.gray1}`, cursor: "pointer" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{p.brand} {p.model}</div>
                        <div style={{ fontSize: 12, color: C.gray3, marginTop: 2 }}>{p.storage} · {p.condition}</div>
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>{formatZAR(p.current_bid)}</span>
                        <Countdown endTime={p.end_time} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── ADMIN ── */}
        {page === "admin" && profile?.is_admin && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 28, letterSpacing: "-0.03em", marginBottom: 32 }}>Admin panel</h2>
            <div style={{ ...s.card, marginBottom: 24 }}>
              <h3 style={{ fontWeight: 600, fontSize: 17, marginBottom: 20, letterSpacing: "-0.02em" }}>Add new listing</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                {[["brand", "Brand *"], ["model", "Model *"], ["storage", "Storage"], ["color", "Colour"], ["startPrice", "Starting price (R) *"], ["hours", "Duration (hours) *"], ["imageUrl", "Image URL"]].map(([k, lbl]) => (
                  <div key={k}><label style={s.label}>{lbl}</label><input value={(adminForm as any)[k]} onChange={e => setAdminForm((f: any) => ({ ...f, [k]: e.target.value }))} style={s.inp} /></div>
                ))}
                <div><label style={s.label}>Condition</label>
                  <select value={adminForm.condition} onChange={e => setAdminForm(f => ({ ...f, condition: e.target.value }))} style={{ ...s.inp }}>
                    {["Like New", "Excellent", "Good", "Fair"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={addListing} style={{ ...s.btnPrimary, marginTop: 20 }}>Add listing</button>
            </div>
            <div style={s.card}>
              <h3 style={{ fontWeight: 600, fontSize: 17, marginBottom: 20, letterSpacing: "-0.02em" }}>Manage listings <span style={{ color: C.gray3, fontWeight: 400 }}>({listings.length})</span></h3>
              {listings.map((p: any) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.gray1}`, gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{p.brand} {p.model}</div>
                    <div style={{ fontSize: 12, color: C.gray3, marginTop: 2 }}>{p.storage} · <CondBadge cond={p.condition} /></div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>{formatZAR(p.current_bid)}</span>
                    <Countdown endTime={p.end_time} />
                    <button onClick={() => removeListing(p.id)} style={s.btnDanger}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${C.gray2}`, marginTop: 80, padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em", marginBottom: 8 }}>PhoneBid</div>
        <div style={{ fontSize: 13, color: C.gray3 }}>South Africa's pre-owned phone auction platform · All prices in ZAR</div>
        <div style={{ fontSize: 12, color: C.gray3, marginTop: 8 }}>© 2025 PhoneBid. All rights reserved.</div>
      </footer>
    </div>
  );
}
