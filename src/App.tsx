import { useState, useEffect } from "react";

// ─── Supabase config ─────────────────────────────────────────────────────────
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

// ─── Seed listings (inserted once if table is empty) ─────────────────────────
const SEED = [
  { brand: "Apple", model: "iPhone 15 Pro Max", storage: "256GB", condition: "Excellent", color: "Titanium", image_url: "", start_price: 8500, current_bid: 9200, end_time: new Date(Date.now() + 3600e3 * 24).toISOString() },
  { brand: "Samsung", model: "Galaxy S24 Ultra", storage: "512GB", condition: "Good", color: "Phantom Black", image_url: "", start_price: 7000, current_bid: 7650, end_time: new Date(Date.now() + 3600e3 * 48).toISOString() },
  { brand: "Google", model: "Pixel 8 Pro", storage: "128GB", condition: "Like New", color: "Obsidian", image_url: "", start_price: 5500, current_bid: 5800, end_time: new Date(Date.now() + 3600e3 * 12).toISOString() },
  { brand: "OnePlus", model: "12R", storage: "256GB", condition: "Good", color: "Iron Gray", image_url: "", start_price: 3200, current_bid: 3450, end_time: new Date(Date.now() + 3600e3 * 72).toISOString() },
  { brand: "Apple", model: "iPhone 14", storage: "128GB", condition: "Fair", color: "Midnight", image_url: "", start_price: 5000, current_bid: 5300, end_time: new Date(Date.now() + 3600e3 * 36).toISOString() },
  { brand: "Samsung", model: "Galaxy A54", storage: "128GB", condition: "Excellent", color: "Awesome Violet", image_url: "", start_price: 2800, current_bid: 2950, end_time: new Date(Date.now() + 3600e3 * 60).toISOString() },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatZAR = n => "R " + Number(n).toLocaleString("en-ZA");
const formatTime = ms => {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

// ─── Colours ──────────────────────────────────────────────────────────────────
const C = { blue: "#1a5fb4", blueLight: "#e8f0fb", blueDark: "#144a8c", red: "#c0392b", redLight: "#fdecea", green: "#2e7d32", greenLight: "#e8f5e9", border: "#e0e0e0", bg: "#f5f6fa", card: "#ffffff", textPrimary: "#1a1a2e", textSecondary: "#555", textMuted: "#888", warning: "#e67e22", warningLight: "#fef5e7" };
const s = {
  inp: { border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 13px", fontSize: 14, width: "100%", background: C.card, color: C.textPrimary, boxSizing: "border-box", outline: "none" },
  btn: { border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 18px", fontSize: 14, cursor: "pointer", background: C.card, color: C.textPrimary, fontWeight: 500 },
  btnPrimary: { border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", background: C.blue, color: "#fff", fontWeight: 600 },
  btnDanger: { border: `1px solid ${C.red}`, borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", background: C.redLight, color: C.red, fontWeight: 500 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 },
  label: { fontSize: 12, fontWeight: 600, color: C.textSecondary, marginBottom: 4, display: "block" },
};

// ─── Small components ─────────────────────────────────────────────────────────
function Avatar({ name, size = 34 }) {
  const init = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return <div style={{ width: size, height: size, borderRadius: "50%", background: C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 700, color: C.blue, flexShrink: 0 }}>{init}</div>;
}

function Countdown({ endTime }) {
  const [left, setLeft] = useState(new Date(endTime) - Date.now());
  useEffect(() => { const t = setInterval(() => setLeft(new Date(endTime) - Date.now()), 1000); return () => clearInterval(t); }, [endTime]);
  const urgent = left < 3600e3 && left > 0, ended = left <= 0;
  return <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: ended ? C.border : urgent ? C.redLight : C.greenLight, color: ended ? C.textMuted : urgent ? C.red : C.green }}>{ended ? "⏹ Ended" : `⏱ ${formatTime(left)}`}</span>;
}

function CondBadge({ cond }) {
  const map = { "Like New": [C.greenLight, C.green], "Excellent": [C.blueLight, C.blue], "Good": [C.warningLight, C.warning], "Fair": [C.redLight, C.red] };
  const [bg, col] = map[cond] ?? [C.border, C.textMuted];
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: bg, color: col }}>{cond}</span>;
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const bg = type === "success" ? C.green : type === "warn" ? C.warning : C.red;
  return <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: bg, color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", pointerEvents: "none" }}>{msg}</div>;
}

function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
      <div style={{ ...s.card, maxWidth: 360, width: "90%", textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 12 }}>🤔</div>
        <div style={{ fontSize: 15, marginBottom: 20 }}>{msg}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onCancel} style={s.btn}>Cancel</button>
          <button onClick={onConfirm} style={s.btnPrimary}>Confirm bid</button>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return <div style={{ textAlign: "center", padding: 60, color: C.textMuted, fontSize: 15 }}>Loading…</div>;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [listings, setListings] = useState([]);
  const [bids, setBids] = useState({});
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState("home");
  const [selectedId, setSelectedId] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "", username: "" });
  const [authErr, setAuthErr] = useState("");
  const [bidInput, setBidInput] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [watchlist, setWatchlist] = useState([]);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [adminForm, setAdminForm] = useState({ brand: "", model: "", storage: "", condition: "Good", color: "", startPrice: "", hours: "", imageUrl: "" });
  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);

  const showToast = (msg, type = "success", ms = 2800) => { setToast({ msg, type }); setTimeout(() => setToast({ msg: "", type: "" }), ms); };

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        // Load session from localStorage
        const raw = localStorage.getItem("pb_session");
        if (raw) {
          const sess = JSON.parse(raw);
          setSession(sess);
          await loadProfile(sess.user.id);
        }
        // Load watchlist
        const wl = localStorage.getItem("pb_watchlist");
        if (wl) setWatchlist(JSON.parse(wl));
        // Load listings
        await loadListings();
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  async function loadListings() {
    try {
      let data = await sb("listings?order=created_at.desc&select=*");
      if (!data || data.length === 0) {
        // Seed demo data
        await sb("listings", { method: "POST", headers: { ...HEADERS, "Prefer": "return=representation" }, body: JSON.stringify(SEED) });
        data = await sb("listings?order=created_at.desc&select=*");
      }
      setListings(data || []);
    } catch (e) { showToast("Could not load listings", "error"); }
  }

  async function loadBids(listingId) {
    try {
      const data = await sb(`bids?listing_id=eq.${listingId}&order=created_at.desc&select=*`);
      setBids(prev => ({ ...prev, [listingId]: data || [] }));
    } catch {}
  }

  async function loadProfile(userId) {
    try {
      const data = await sb(`profiles?id=eq.${userId}&select=*`);
      if (data?.[0]) setProfile(data[0]);
    } catch {}
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  async function login() {
    if (!authForm.email || !authForm.password) { setAuthErr("Enter email and password."); return; }
    try {
      const data = await sbAuth("token?grant_type=password", { email: authForm.email, password: authForm.password });
      localStorage.setItem("pb_session", JSON.stringify(data));
      setSession(data);
      await loadProfile(data.user.id);
      setAuthErr(""); setPage("home");
      showToast(`Welcome back!`);
    } catch (e) { setAuthErr(e.message); }
  }

  async function register() {
    if (!authForm.name || !authForm.email || !authForm.password || !authForm.username) { setAuthErr("All fields required."); return; }
    if (authForm.password.length < 6) { setAuthErr("Password must be at least 6 characters."); return; }
    try {
      const data = await sbAuth("signup", { email: authForm.email, password: authForm.password });
      // Create profile
      const isAdmin = authForm.email === "admin@phonebid.co.za";
      await sb("profiles", { method: "POST", headers: { ...HEADERS, "Authorization": `Bearer ${data.access_token}`, "Prefer": "return=minimal" }, body: JSON.stringify({ id: data.user.id, name: authForm.name, username: authForm.username, is_admin: isAdmin }) });
      localStorage.setItem("pb_session", JSON.stringify(data));
      setSession(data);
      setProfile({ id: data.user.id, name: authForm.name, username: authForm.username, is_admin: isAdmin });
      setAuthErr(""); setPage("home");
      showToast(`Welcome, ${authForm.name.split(" ")[0]}!`);
    } catch (e) { setAuthErr(e.message); }
  }

  function logout() { localStorage.removeItem("pb_session"); setSession(null); setProfile(null); setPage("home"); }

  // ── Watchlist ─────────────────────────────────────────────────────────────
  const toggleWatch = id => {
    const next = watchlist.includes(id) ? watchlist.filter(x => x !== id) : [...watchlist, id];
    setWatchlist(next);
    localStorage.setItem("pb_watchlist", JSON.stringify(next));
    showToast(next.includes(id) ? "Added to watchlist" : "Removed from watchlist");
  };

  // ── Bid ───────────────────────────────────────────────────────────────────
  const activePhone = selectedId ? listings.find(p => p.id === selectedId) : null;
  const activeBids = selectedId ? (bids[selectedId] || []) : [];

  function requestBid() {
    const amt = parseFloat(bidInput);
    if (!session) { showToast("Sign in to place a bid", "error"); return; }
    if (!amt || isNaN(amt)) { showToast("Enter a valid amount", "error"); return; }
    if (amt <= activePhone.current_bid) { showToast(`Bid must exceed ${formatZAR(activePhone.current_bid)}`, "error"); return; }
    if (amt > activePhone.current_bid * 5) showToast("Unusually high bid — double check!", "warn");
    setConfirm({ phone: activePhone, amount: amt });
  }

  async function confirmBid() {
    const { phone, amount } = confirm;
    setConfirm(null);
    setBidLoading(true);
    try {
      // Insert bid
      await sb("bids", { method: "POST", headers: { ...HEADERS, "Prefer": "return=minimal" }, body: JSON.stringify({ listing_id: phone.id, user_id: session.user.id, user_name: profile?.name || session.user.email, amount }) });
      // Update listing current_bid
      await sb(`listings?id=eq.${phone.id}`, { method: "PATCH", headers: { ...HEADERS, "Prefer": "return=minimal" }, body: JSON.stringify({ current_bid: amount }) });
      setListings(prev => prev.map(p => p.id === phone.id ? { ...p, current_bid: amount } : p));
      await loadBids(phone.id);
      setBidInput("");
      showToast(`Bid of ${formatZAR(amount)} placed!`);
    } catch (e) { showToast("Bid failed: " + e.message, "error"); }
    setBidLoading(false);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  async function addListing() {
    const { brand, model, storage, condition, color, startPrice, hours, imageUrl } = adminForm;
    if (!brand || !model || !startPrice || !hours) { showToast("Fill in all required fields", "error"); return; }
    const price = parseFloat(startPrice);
    if (isNaN(price) || price < 1) { showToast("Enter a valid price", "error"); return; }
    try {
      await sb("listings", { method: "POST", headers: { ...HEADERS, "Prefer": "return=minimal" }, body: JSON.stringify({ brand, model, storage: storage || "N/A", condition: condition || "Good", color: color || "N/A", image_url: imageUrl || "", start_price: price, current_bid: price, end_time: new Date(Date.now() + parseFloat(hours) * 3600e3).toISOString() }) });
      await loadListings();
      setAdminForm({ brand: "", model: "", storage: "", condition: "Good", color: "", startPrice: "", hours: "", imageUrl: "" });
      showToast("Listing added!");
    } catch (e) { showToast("Failed: " + e.message, "error"); }
  }

  async function removeListing(id) {
    try {
      await sb(`listings?id=eq.${id}`, { method: "DELETE", headers: HEADERS });
      setListings(prev => prev.filter(p => p.id !== id));
      showToast("Listing removed", "warn");
    } catch (e) { showToast("Failed: " + e.message, "error"); }
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = listings.filter(p => {
    const matchSearch = search === "" || `${p.brand} ${p.model}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "active" && new Date(p.end_time) > Date.now()) || (filter === "ending" && (new Date(p.end_time) - Date.now()) < 3600e3 && new Date(p.end_time) > Date.now()) || (filter === "watched" && watchlist.includes(p.id));
    return matchSearch && matchFilter;
  });

  if (loading) return <Spinner />;

  const navBtn = (key, label) => (
    <button key={key} onClick={() => setPage(key)} style={{ ...s.btn, border: "none", background: page === key ? C.blueLight : "transparent", color: page === key ? C.blue : C.textSecondary, fontWeight: page === key ? 600 : 400 }}>{label}</button>
  );

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: C.textPrimary, minHeight: "100vh", background: C.bg }}>
      <Toast {...toast} />
      {confirm && <ConfirmModal msg={<>Confirm bid of <b>{formatZAR(confirm.amount)}</b> on <b>{confirm.phone.brand} {confirm.phone.model}</b>?</>} onConfirm={confirmBid} onCancel={() => setConfirm(null)} />}

      {/* NAV */}
      <nav style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "0 20px", display: "flex", alignItems: "center", gap: 8, height: 56, position: "sticky", top: 0, zIndex: 200 }}>
        <span onClick={() => setPage("home")} style={{ fontWeight: 800, fontSize: 18, cursor: "pointer", color: C.blue, marginRight: 8 }}>📱 PhoneBid</span>
        {navBtn("home", "Auctions")}
        {profile?.is_admin && navBtn("admin", "Admin")}
        <span style={{ flex: 1 }} />
        {session ? (
          <>
            {navBtn("profile", profile?.name?.split(" ")[0] || "Profile")}
            <button onClick={logout} style={{ ...s.btn, border: "none", background: "transparent", color: C.textMuted, fontSize: 13 }}>Sign out</button>
          </>
        ) : (
          <button onClick={() => { setPage("auth"); setAuthMode("login"); setAuthErr(""); }} style={s.btnPrimary}>Sign in</button>
        )}
      </nav>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 16px" }}>

        {/* HOME */}
        {page === "home" && (<>
          <div style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, borderRadius: 16, padding: "32px 28px", marginBottom: 24, color: "#fff" }}>
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Bid on pre-owned phones 🇿🇦</div>
            <div style={{ fontSize: 15, opacity: 0.85 }}>Live auctions in South African Rand. No hidden fees.</div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <input placeholder="Search brand or model…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...s.inp, maxWidth: 280 }} />
            {[["all", "All"], ["active", "Active"], ["ending", "Ending soon"], ["watched", `Watchlist (${watchlist.length})`]].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{ ...s.btn, padding: "7px 14px", background: filter === k ? C.blueLight : C.card, color: filter === k ? C.blue : C.textSecondary, fontWeight: filter === k ? 600 : 400, fontSize: 13 }}>{l}</button>
            ))}
            <span style={{ fontSize: 13, color: C.textMuted, marginLeft: "auto" }}>{filtered.length} listing{filtered.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
            {filtered.length === 0 && <div style={{ color: C.textMuted, fontSize: 14, gridColumn: "1/-1", padding: 40, textAlign: "center" }}>No listings found.</div>}
            {filtered.map(p => {
              const ended = new Date(p.end_time) <= Date.now();
              return (
                <div key={p.id} style={{ ...s.card, cursor: "pointer", position: "relative" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.09)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                  onClick={() => { setSelectedId(p.id); setPage("detail"); setBidInput(""); loadBids(p.id); }}>
                  <button onClick={e => { e.stopPropagation(); toggleWatch(p.id); }} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
                    {watchlist.includes(p.id) ? "❤️" : "🤍"}
                  </button>
                  <div style={{ height: 100, marginBottom: 12, background: C.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
                    {p.image_url ? <img src={p.image_url} style={{ height: 90, objectFit: "contain" }} alt="" /> : "📱"}
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{p.brand}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{p.model}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}><CondBadge cond={p.condition} /><span style={{ fontSize: 11, color: C.textMuted }}>{p.storage}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>Current bid</div>
                      <div style={{ fontWeight: 800, fontSize: 18, color: ended ? C.textMuted : C.blue }}>{formatZAR(p.current_bid)}</div>
                    </div>
                    <Countdown endTime={p.end_time} />
                  </div>
                </div>
              );
            })}
          </div>
        </>)}

        {/* DETAIL */}
        {page === "detail" && activePhone && (() => {
          const ended = new Date(activePhone.end_time) <= Date.now();
          const minBid = activePhone.current_bid + 50;
          return (
            <div>
              <button onClick={() => setPage("home")} style={{ ...s.btn, border: "none", background: "transparent", padding: 0, color: C.textSecondary, marginBottom: 16, fontSize: 13 }}>← Back</button>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                <div style={{ ...s.card }}>
                  <div style={{ height: 180, background: C.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, marginBottom: 16 }}>
                    {activePhone.image_url ? <img src={activePhone.image_url} style={{ height: 160, objectFit: "contain" }} alt="" /> : "📱"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div><div style={{ fontSize: 13, color: C.textMuted }}>{activePhone.brand}</div><div style={{ fontWeight: 700, fontSize: 20 }}>{activePhone.model}</div></div>
                    <button onClick={() => toggleWatch(activePhone.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22 }}>{watchlist.includes(activePhone.id) ? "❤️" : "🤍"}</button>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    {[["Storage", activePhone.storage], ["Condition", activePhone.condition], ["Colour", activePhone.color], ["Starting price", formatZAR(activePhone.start_price)]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 14 }}>
                        <span style={{ color: C.textSecondary }}>{k}</span>
                        <span style={{ fontWeight: 500 }}>{k === "Condition" ? <CondBadge cond={v} /> : v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={s.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: C.textMuted }}>Current bid</span>
                      <Countdown endTime={activePhone.end_time} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 32, color: ended ? C.textMuted : C.blue, marginBottom: 16 }}>{formatZAR(activePhone.current_bid)}</div>
                    {!ended && (session ? (
                      <>
                        <label style={s.label}>Your bid (min {formatZAR(minBid)})</label>
                        <input type="number" placeholder={minBid} value={bidInput} onChange={e => setBidInput(e.target.value)} style={{ ...s.inp, marginBottom: 10, fontSize: 16 }} min={minBid} />
                        <button onClick={requestBid} disabled={bidLoading} style={{ ...s.btnPrimary, width: "100%", padding: 12, fontSize: 15, opacity: bidLoading ? 0.7 : 1 }}>{bidLoading ? "Placing…" : "Place bid"}</button>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8, textAlign: "center" }}>You'll confirm before your bid is submitted.</div>
                      </>
                    ) : (
                      <button onClick={() => { setPage("auth"); setAuthMode("login"); }} style={{ ...s.btnPrimary, width: "100%", padding: 12 }}>Sign in to bid</button>
                    ))}
                    {ended && <div style={{ fontSize: 14, color: C.textMuted, textAlign: "center" }}>This auction has ended.</div>}
                  </div>
                  <div style={s.card}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>Bid history ({activeBids.length})</div>
                    {activeBids.length === 0 ? <div style={{ fontSize: 13, color: C.textMuted }}>No bids yet — be the first!</div>
                      : activeBids.slice(0, 8).map((b, i) => (
                        <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 14 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Avatar name={b.user_name} size={24} />
                            <span style={{ fontWeight: i === 0 ? 600 : 400 }}>{b.user_name}</span>
                            {i === 0 && <span style={{ fontSize: 10, background: C.greenLight, color: C.green, padding: "2px 6px", borderRadius: 10, fontWeight: 700 }}>LEADING</span>}
                          </span>
                          <span style={{ fontWeight: i === 0 ? 700 : 400, color: i === 0 ? C.blue : C.textPrimary }}>{formatZAR(b.amount)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* AUTH */}
        {page === "auth" && (
          <div style={{ maxWidth: 400, margin: "40px auto" }}>
            <div style={{ ...s.card, padding: 32 }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ fontSize: 32 }}>📱</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.blue }}>PhoneBid</div>
                <div style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>{authMode === "login" ? "Welcome back" : "Create your account"}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {authMode === "register" && (<>
                  <div><label style={s.label}>Full name</label><input placeholder="e.g. Thabo Nkosi" value={authForm.name} onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))} style={s.inp} /></div>
                  <div><label style={s.label}>Username</label><input placeholder="e.g. thabo_za" value={authForm.username} onChange={e => setAuthForm(f => ({ ...f, username: e.target.value }))} style={s.inp} /></div>
                </>)}
                <div><label style={s.label}>Email</label><input type="email" value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} style={s.inp} /></div>
                <div><label style={s.label}>Password</label><input type="password" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} style={s.inp} /></div>
              </div>
              {authErr && <div style={{ color: C.red, fontSize: 13, marginTop: 12, padding: "8px 10px", background: C.redLight, borderRadius: 6 }}>{authErr}</div>}
              <button onClick={authMode === "login" ? login : register} style={{ ...s.btnPrimary, width: "100%", padding: 12, marginTop: 16, fontSize: 15 }}>{authMode === "login" ? "Sign in" : "Create account"}</button>
              <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: C.textMuted }}>
                {authMode === "login" ? "No account? " : "Already registered? "}
                <span onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthErr(""); }} style={{ color: C.blue, cursor: "pointer", fontWeight: 600 }}>{authMode === "login" ? "Sign up" : "Sign in"}</span>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {page === "profile" && session && (
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ ...s.card, display: "flex", alignItems: "center", gap: 20, marginBottom: 20, padding: 24 }}>
              <Avatar name={profile?.name || "User"} size={60} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 20 }}>{profile?.name}</div>
                <div style={{ fontSize: 13, color: C.textMuted }}>@{profile?.username} · {session.user.email}</div>
                {profile?.is_admin && <span style={{ fontSize: 11, background: C.blue, color: "#fff", padding: "2px 8px", borderRadius: 10, fontWeight: 700, marginTop: 4, display: "inline-block" }}>ADMIN</span>}
              </div>
            </div>
            <div style={s.card}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Watchlist ({watchlist.length})</div>
              {watchlist.length === 0 ? <div style={{ fontSize: 13, color: C.textMuted }}>Nothing in your watchlist. Tap 🤍 on any listing.</div>
                : watchlist.map(id => {
                  const p = listings.find(x => x.id === id);
                  if (!p) return null;
                  return (
                    <div key={id} onClick={() => { setSelectedId(id); setPage("detail"); loadBids(id); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{p.brand} {p.model}</span>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}><span style={{ color: C.blue, fontWeight: 700 }}>{formatZAR(p.current_bid)}</span><Countdown endTime={p.end_time} /></div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ADMIN */}
        {page === "admin" && profile?.is_admin && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Admin panel</div>
            <div style={{ ...s.card, marginBottom: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>➕ Add new listing</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                {[["brand", "Brand *"], ["model", "Model *"], ["storage", "Storage"], ["color", "Colour"], ["startPrice", "Starting price (R) *"], ["hours", "Duration (hours) *"], ["imageUrl", "Image URL (optional)"]].map(([k, lbl]) => (
                  <div key={k}><label style={s.label}>{lbl}</label><input value={adminForm[k]} onChange={e => setAdminForm(f => ({ ...f, [k]: e.target.value }))} style={s.inp} /></div>
                ))}
                <div><label style={s.label}>Condition</label><select value={adminForm.condition} onChange={e => setAdminForm(f => ({ ...f, condition: e.target.value }))} style={s.inp}>{["Like New", "Excellent", "Good", "Fair"].map(c => <option key={c}>{c}</option>)}</select></div>
              </div>
              <button onClick={addListing} style={{ ...s.btnPrimary, marginTop: 16 }}>Add listing</button>
            </div>
            <div style={s.card}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Manage listings ({listings.length})</div>
              {listings.map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}`, gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.brand} {p.model}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{p.storage} · <CondBadge cond={p.condition} /></div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}><div style={{ color: C.blue, fontWeight: 700 }}>{formatZAR(p.current_bid)}</div></div>
                    <Countdown endTime={p.end_time} />
                    <button onClick={() => removeListing(p.id)} style={s.btnDanger}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
