import { useState, useEffect } from "react";

const SUPA_URL = "https://fxwnpebzfcfvqvnxkayn.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4d25wZWJ6ZmNmdnF2bnhrYXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzMxMDUsImV4cCI6MjA5NDIwOTEwNX0._94i3GtL_5IPFdm8aVs1RRIhwXEiPd-cudf0Fomh3fs";
const HEADERS = { "Content-Type": "application/json", "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY };

async function sb(path, opts) {
  const res = await fetch(SUPA_URL + "/rest/v1/" + path, { headers: HEADERS, ...opts });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || res.statusText); }
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

async function sbAuth(path, body) {
  const res = await fetch(SUPA_URL + "/auth/v1/" + path, { method: "POST", headers: { "Content-Type": "application/json", "apikey": SUPA_KEY }, body: JSON.stringify(body) });
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

const formatZAR = (n) => "R " + Number(n).toLocaleString("en-ZA");
const formatTime = (ms) => {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return h + "h " + m + "m";
  if (m > 0) return m + "m " + sec + "s";
  return sec + "s";
};
const endMs = (p) => new Date(p.end_time).getTime();

const C = {
  black: "#1d1d1f", white: "#ffffff", gray1: "#f5f5f7", gray2: "#e8e8ed",
  gray3: "#6e6e73", gray4: "#424245", blue: "#0071e3", green: "#1d8348",
  greenLight: "#eafaf1", red: "#c0392b", redLight: "#fdedec", amber: "#d4830a", amberLight: "#fef9e7",
};

const font = "'-apple-system','BlinkMacSystemFont','Helvetica Neue',sans-serif";

const inp = { border: "1px solid " + C.gray2, borderRadius: 12, padding: "11px 16px", fontSize: 15, width: "100%", background: C.white, color: C.black, boxSizing: "border-box", outline: "none" };
const btnPrimary = { background: C.blue, color: C.white, border: "none", borderRadius: 980, padding: "12px 24px", fontSize: 15, fontWeight: 500, cursor: "pointer" };
const btnSecondary = { background: "transparent", color: C.blue, border: "1px solid " + C.blue, borderRadius: 980, padding: "11px 24px", fontSize: 15, fontWeight: 500, cursor: "pointer" };
const btnGhost = { background: "transparent", color: C.gray3, border: "none", padding: "8px 14px", fontSize: 14, cursor: "pointer" };
const btnDanger = { background: C.redLight, color: C.red, border: "1px solid " + C.red, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" };
const card = { background: C.white, border: "1px solid " + C.gray2, borderRadius: 18, padding: 24 };
const lbl = { fontSize: 12, fontWeight: 500, color: C.gray3, marginBottom: 6, display: "block", letterSpacing: "0.02em", textTransform: "uppercase" };

function Avatar({ name, size }) {
  size = size || 34;
  const init = (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return <div style={{ width: size, height: size, borderRadius: "50%", background: C.gray1, border: "1px solid " + C.gray2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 600, color: C.gray4, flexShrink: 0 }}>{init}</div>;
}

function Countdown({ endTime }) {
  const [left, setLeft] = useState(new Date(endTime).getTime() - Date.now());
  useEffect(() => { const t = setInterval(() => setLeft(new Date(endTime).getTime() - Date.now()), 1000); return () => clearInterval(t); }, [endTime]);
  const urgent = left < 3600e3 && left > 0, ended = left <= 0;
  return <span style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 980, background: ended ? C.gray1 : urgent ? C.redLight : C.greenLight, color: ended ? C.gray3 : urgent ? C.red : C.green }}>{ended ? "Ended" : formatTime(left) + " left"}</span>;
}

function CondBadge({ cond }) {
  const map = { "Like New": [C.greenLight, C.green], "Excellent": ["#eaf3fb", C.blue], "Good": [C.amberLight, C.amber], "Fair": [C.redLight, C.red] };
  const bg = (map[cond] || [C.gray1, C.gray3])[0];
  const col = (map[cond] || [C.gray1, C.gray3])[1];
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 980, background: bg, color: col, letterSpacing: "0.02em", textTransform: "uppercase" }}>{cond}</span>;
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const bg = type === "success" ? C.black : type === "warn" ? C.amber : C.red;
  return <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: bg, color: C.white, padding: "14px 28px", borderRadius: 980, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", pointerEvents: "none" }}>{msg}</div>;
}

function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, backdropFilter: "blur(4px)" }}>
      <div style={{ ...card, maxWidth: 380, width: "90%", textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 15, color: C.black, marginBottom: 28, lineHeight: 1.5 }}>{msg}</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onCancel} style={btnSecondary}>Cancel</button>
          <button onClick={onConfirm} style={btnPrimary}>Confirm bid</button>
        </div>
      </div>
    </div>
  );
}

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

  const showToast = (msg, type, ms) => { setToast({ msg, type: type || "success" }); setTimeout(() => setToast({ msg: "", type: "" }), ms || 2800); };

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("pb_session");
        if (raw) { const sess = JSON.parse(raw); setSession(sess); await loadProfile(sess.user.id); }
        const wl = localStorage.getItem("pb_watchlist");
        if (wl) setWatchlist(JSON.parse(wl));
        await loadListings();
      } catch(e) { console.error(e); }
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
    } catch(e) { showToast("Could not load listings", "error"); }
  }

  async function loadBids(id) {
    try { const data = await sb("bids?listing_id=eq." + id + "&order=created_at.desc&select=*"); setBids(p => ({ ...p, [id]: data || [] })); } catch(e) {}
  }

  async function loadProfile(uid) {
    try { const d = await sb("profiles?id=eq." + uid + "&select=*"); if (d && d[0]) setProfile(d[0]); } catch(e) {}
  }

  async function login() {
    if (!authForm.email || !authForm.password) { setAuthErr("Enter your email and password."); return; }
    try {
      const data = await sbAuth("token?grant_type=password", { email: authForm.email, password: authForm.password });
      localStorage.setItem("pb_session", JSON.stringify(data));
      setSession(data); await loadProfile(data.user.id);
      setAuthErr(""); setPage("home"); showToast("Welcome back.");
    } catch(e) { setAuthErr(e.message); }
  }

  async function register() {
    if (!authForm.name || !authForm.email || !authForm.password || !authForm.username) { setAuthErr("All fields are required."); return; }
    if (authForm.password.length < 6) { setAuthErr("Password must be at least 6 characters."); return; }
    try {
      const data = await sbAuth("signup", { email: authForm.email, password: authForm.password });
      const isAdmin = authForm.email === "admin@phonebid.co.za";
      await sb("profiles", { method: "POST", headers: { ...HEADERS, "Authorization": "Bearer " + data.access_token, "Prefer": "return=minimal" }, body: JSON.stringify({ id: data.user.id, name: authForm.name, username: authForm.username, is_admin: isAdmin }) });
