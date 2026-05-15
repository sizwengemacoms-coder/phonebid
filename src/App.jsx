import { useState, useEffect } from "react";

const SUPA_URL = "https://fxwnpebzfcfvqvnxkayn.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4d25wZWJ6ZmNmdnF2bnhrYXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzMxMDUsImV4cCI6MjA5NDIwOTEwNX0._94i3GtL_5IPFdm8aVs1RRIhwXEiPd-cudf0Fomh3fs";

// FIX: always pass the logged-in user's JWT for write operations so RLS can identify them
function makeHeaders(token, extra) {
  return {
    "Content-Type": "application/json",
    "apikey": SUPA_KEY,
    "Authorization": "Bearer " + (token || SUPA_KEY),
    ...extra,
  };
}

async function sb(path, opts, token) {
  const { extraHeaders, ...restOpts } = opts || {};
  const headers = makeHeaders(token, extraHeaders || {});
  const res = await fetch(SUPA_URL + "/rest/v1/" + path, { ...restOpts, headers });
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || res.statusText); }
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

async function sbAuth(path, body) {
  const res = await fetch(SUPA_URL + "/auth/v1/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPA_KEY },
    body: JSON.stringify(body),
  });
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
  gray3: "#6e6e73", gray4: "#424245", blue: "#ffbd59", green: "#1d8348",
  greenLight: "#eafaf1", red: "#c0392b", redLight: "#fdedec", amber: "#d4830a", amberLight: "#fef9e7",
  goldBg: "#fffbea", goldBorder: "#f0c040", goldText: "#8a6a00",
};

const inp = { border: "1px solid " + C.gray2, borderRadius: 12, padding: "11px 16px", fontSize: 15, width: "100%", background: C.white, color: C.black, boxSizing: "border-box", outline: "none" };
const btnPrimary = { background: C.blue, color: C.black, border: "none", borderRadius: 980, padding: "12px 24px", fontSize: 15, fontWeight: 500, cursor: "pointer" };
const btnSecondary = { background: "transparent", color: C.black, border: "1px solid " + C.blue, borderRadius: 980, padding: "11px 24px", fontSize: 15, fontWeight: 500, cursor: "pointer" };
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

function WinnerBanner({ bids }) {
  const winner = bids && bids.length > 0 ? bids[0] : null;
  return (
    <div style={{ background: C.goldBg, border: "1.5px solid " + C.goldBorder, borderRadius: 14, padding: "22px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>🏆</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.goldText, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Auction Ended</div>
      {winner ? (
        <>
          <div style={{ fontSize: 15, color: C.black, marginBottom: 6 }}>Won by <strong>{winner.user_name || "Anonymous"}</strong></div>
          <div style={{ fontWeight: 800, fontSize: 32, color: C.goldText, letterSpacing: "-0.03em" }}>{formatZAR(winner.amount)}</div>
        </>
      ) : (
        <div style={{ fontSize: 15, color: C.gray3 }}>No bids were placed on this listing.</div>
      )}
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
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "", username: "", phone: "" });
  const [authErr, setAuthErr] = useState("");
  const [bidInput, setBidInput] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [watchlist, setWatchlist] = useState([]);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [adminForm, setAdminForm] = useState({ brand: "", model: "", storage: "", condition: "Good", color: "", startPrice: "", hours: "", imageUrls: "" });
  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);
  const [winners, setWinners] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const showToast = (msg, type, ms) => { setToast({ msg, type: type || "success" }); setTimeout(() => setToast({ msg: "", type: "" }), ms || 2800); };

  // Helper: get the current user's JWT from state or localStorage
  function getToken() {
    if (session && session.access_token) return session.access_token;
    try { const raw = localStorage.getItem("pb_session"); if (raw) return JSON.parse(raw).access_token; } catch(e) {}
    return null;
  }

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
        const token = getToken();
        await sb("listings", { method: "POST", extraHeaders: { "Prefer": "return=representation" }, body: JSON.stringify(SEED) }, token);
        data = await sb("listings?order=created_at.desc&select=*");
      }
      setListings(data || []);
    } catch(e) { showToast("Could not load listings", "error"); }
  }

  // Sort by amount desc so bids[0] is always the highest bidder (winner)
  async function loadBids(id) {
    try {
      const data = await sb("bids?listing_id=eq." + id + "&order=amount.desc&select=*");
      setBids(p => ({ ...p, [id]: data || [] }));
    } catch(e) {}
  }

  // Load all auction winners from the auction_winners view
  async function loadWinners() {
    try {
      const data = await sb("auction_winners?order=end_time.desc&select=*");
      setWinners(data || []);
    } catch(e) { 
      console.error("Failed to load winners:", e);
      showToast("Could not load winners list", "error");
    }
  }

  // Load description for a listing
  async function loadComments(listingId) {
    try {
      const data = await sb("comments?listing_id=eq." + listingId + "&select=*");
      setComments(p => ({ ...p, [listingId]: data && data.length > 0 ? data[0] : null }));
    } catch(e) { console.error("Failed to load description:", e); }
  }

  // Add/Update admin description
  async function addComment() {
    if (!profile || !profile.is_admin) { showToast("Only admins can add descriptions", "error"); return; }
    if (!commentInput.trim()) { showToast("Description cannot be empty", "error"); return; }

    const token = getToken();
    setCommentLoading(true);
    try {
      const existing = comments[activePhone.id];
      
      if (existing) {
        // Update existing description
        await sb("comments?id=eq." + existing.id, { method: "PATCH", extraHeaders: { "Prefer": "return=minimal" }, body: JSON.stringify({ content: commentInput }) }, token);
      } else {
        // Create new description
        await sb("comments", { method: "POST", extraHeaders: { "Prefer": "return=minimal" }, body: JSON.stringify({ listing_id: activePhone.id, user_id: session.user.id, user_name: profile.name, content: commentInput }) }, token);
      }
      
      await loadComments(activePhone.id);
      setCommentInput("");
      showToast("Description saved.");
    } catch(e) { showToast("Failed to save description: " + e.message, "error"); }
    setCommentLoading(false);
  }

  // Delete description
  async function deleteComment(commentId) {
    const token = getToken();
    try {
      await sb("comments?id=eq." + commentId, { method: "DELETE" }, token);
      await loadComments(activePhone.id);
      setCommentInput("");
      showToast("Description deleted.", "warn");
    } catch(e) { showToast("Failed to delete description: " + e.message, "error"); }
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
      // Use the new user's own token to insert their own profile (satisfies RLS insert policy)
      await sb("profiles", { method: "POST", extraHeaders: { "Prefer": "return=minimal" }, body: JSON.stringify({ id: data.user.id, name: authForm.name, username: authForm.username, phone_number: authForm.phone || null, is_admin: isAdmin }) }, data.access_token);
      localStorage.setItem("pb_session", JSON.stringify(data));
      setSession(data); setProfile({ id: data.user.id, name: authForm.name, username: authForm.username, phone_number: authForm.phone || null, is_admin: isAdmin });
      setAuthErr(""); setPage("home"); showToast("Welcome, " + authForm.name.split(" ")[0] + ".");
    } catch(e) { setAuthErr(e.message); }
  }

  function logout() { localStorage.removeItem("pb_session"); setSession(null); setProfile(null); setPage("home"); }

  const toggleWatch = (id) => {
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
    if (amt <= activePhone.current_bid) { showToast("Bid must exceed " + formatZAR(activePhone.current_bid), "error"); return; }
    setConfirm({ phone: activePhone, amount: amt });
  }

  async function confirmBid() {
    const phone = confirm.phone, amount = confirm.amount;
    setConfirm(null); setBidLoading(true);

    // Block anonymous bids — require a real profile name
    const userName = profile && profile.name;
    if (!userName) {
      showToast("Profile not loaded. Please sign out and sign back in.", "error");
      setBidLoading(false);
      return;
    }

    const token = getToken();
    try {
      // Pass session token so RLS can verify user_id matches the logged-in user
      await sb("bids", { method: "POST", extraHeaders: { "Prefer": "return=minimal" }, body: JSON.stringify({ listing_id: phone.id, user_id: session.user.id, user_name: userName, amount }) }, token);
      await sb("listings?id=eq." + phone.id, { method: "PATCH", extraHeaders: { "Prefer": "return=minimal" }, body: JSON.stringify({ current_bid: amount }) }, token);
      setListings(prev => prev.map(p => p.id === phone.id ? { ...p, current_bid: amount } : p));
      await loadBids(phone.id); setBidInput(""); showToast("Bid of " + formatZAR(amount) + " placed.");
    } catch(e) { showToast("Bid failed: " + e.message, "error"); }
    setBidLoading(false);
  }

  async function addListing() {
    const { brand, model, storage, condition, color, startPrice, hours, imageUrls } = adminForm;
    if (!brand || !model || !startPrice || !hours) { showToast("Fill in all required fields", "error"); return; }
    const price = parseFloat(startPrice);
    const token = getToken();
    try {
      // Split imageUrls by comma and trim whitespace
      const urls = imageUrls ? imageUrls.split(",").map(url => url.trim()).filter(url => url) : [];
      
      // Pass admin session token so RLS allows the insert
      await sb("listings", { method: "POST", extraHeaders: { "Prefer": "return=minimal" }, body: JSON.stringify({ brand, model, storage: storage || "N/A", condition: condition || "Good", color: color || "N/A", image_urls: urls, start_price: price, current_bid: price, end_time: new Date(Date.now() + parseFloat(hours) * 3600e3).toISOString() }) }, token);
      await loadListings();
      setAdminForm({ brand: "", model: "", storage: "", condition: "Good", color: "", startPrice: "", hours: "", imageUrls: "" });
      showToast("Listing added.");
    } catch(e) { showToast("Failed: " + e.message, "error"); }
  }

  async function removeListing(id) {
    const token = getToken();
    try {
      // Pass admin session token so RLS allows the delete
      await sb("listings?id=eq." + id, { method: "DELETE" }, token);
      setListings(p => p.filter(x => x.id !== id));
      showToast("Listing removed.", "warn");
    } catch(e) { showToast("Failed: " + e.message, "error"); }
  }

  const filtered = listings.filter(p => {
    const matchSearch = search === "" || (p.brand + " " + p.model).toLowerCase().includes(search.toLowerCase());
    const ms = endMs(p);
    const matchFilter = filter === "all" || (filter === "active" && ms > Date.now()) || (filter === "ending" && (ms - Date.now()) < 3600e3 && ms > Date.now()) || (filter === "watched" && watchlist.includes(p.id));
    return matchSearch && matchFilter;
  });

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: C.gray3, fontSize: 15 }}>Loading…</div>;

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif", color: C.black, minHeight: "100vh", background: C.gray1 }}>
      <Toast msg={toast.msg} type={toast.type} />
      {confirm && <ConfirmModal msg={<span>Place a bid of <strong>{formatZAR(confirm.amount)}</strong> on <strong>{confirm.phone.brand + " " + confirm.phone.model}</strong>?</span>} onConfirm={confirmBid} onCancel={() => setConfirm(null)} />}

      {/* NAV */}
      <nav style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.gray2, padding: "0 40px", display: "flex", alignItems: "center", height: 52, position: "sticky", top: 0, zIndex: 200 }}>
        <span onClick={() => setPage("home")} style={{ fontWeight: 700, fontSize: 18, cursor: "pointer", color: C.black, letterSpacing: "-0.03em", marginRight: 32 }}>Supreme Gadgets</span>
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          <button onClick={() => setPage("home")} style={{ ...btnGhost, color: page === "home" ? C.black : C.gray3, fontWeight: page === "home" ? 500 : 400 }}>Auctions</button>
          {profile && profile.is_admin && <button onClick={() => { setPage("admin"); loadWinners(); }} style={{ ...btnGhost, color: page === "admin" ? C.black : C.gray3, fontWeight: page === "admin" ? 500 : 400 }}>Admin</button>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {session ? (
            <>
              <button onClick={() => setPage("profile")} style={{ ...btnGhost, color: page === "profile" ? C.black : C.gray3, display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar name={(profile && profile.name) || "U"} size={26} />
                <span style={{ fontSize: 14 }}>{profile && profile.name ? profile.name.split(" ")[0] : "Profile"}</span>
              </button>
              <button onClick={logout} style={{ ...btnGhost, fontSize: 13 }}>Sign out</button>
            </>
          ) : (
            <button onClick={() => { setPage("auth"); setAuthMode("login"); setAuthErr(""); }} style={btnPrimary}>Sign in</button>
          )}
        </div>
      </nav>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px" }}>

        {/* HOME */}
        {page === "home" && (
          <div>
            {/* HERO IMAGE BANNER */}
            <div style={{ marginLeft: -24, marginRight: -24, marginTop: -48, marginBottom: 56 }}>
              <img
                src="/SUPREME_GADGETS_-_1.png"
                alt="Supreme Gadgets — Auction Live"
                style={{ width: "100%", display: "block", maxHeight: 500, objectFit: "cover", objectPosition: "center" }}
              />
            </div>

            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.black, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>Live auctions</div>
              <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-0.04em", color: C.black, margin: "0 0 16px", lineHeight: 1.05 }}>Bid on New & Pre-owned Phones.</h1>
              <p style={{ fontSize: 19, color: C.gray3, margin: "0 auto 32px", maxWidth: 480, lineHeight: 1.5, fontWeight: 400 }}>Authentic. Inspected.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                {[["all","All listings"],["active","Active"],["ending","Ending soon"],["watched","Watchlist (" + watchlist.length + ")"]].map(function(item) {
                  return <button key={item[0]} onClick={() => setFilter(item[0])} style={{ ...(filter === item[0] ? btnPrimary : btnSecondary), padding: "9px 20px", fontSize: 14 }}>{item[1]}</button>;
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 32, alignItems: "center" }}>
              <input placeholder="Search brand or model…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, maxWidth: 340 }} />
              <span style={{ fontSize: 13, color: C.gray3 }}>{filtered.length} listing{filtered.length !== 1 ? "s" : ""}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {filtered.length === 0 && <div style={{ color: C.gray3, fontSize: 15, gridColumn: "1/-1", padding: 60, textAlign: "center" }}>No listings found.</div>}
              {filtered.map(p => {
                const ended = endMs(p) <= Date.now();
                return (
                  <div key={p.id}
                    style={{ background: C.white, border: "1px solid " + C.gray2, borderRadius: 18, overflow: "hidden", cursor: "pointer", position: "relative" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.10)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
                    onClick={() => { setSelectedId(p.id); setPage("detail"); setBidInput(""); setSelectedImageIndex(0); loadBids(p.id); loadComments(p.id); setCommentInput(""); }}>
                    <div style={{ height: 180, background: C.gray1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, position: "relative" }}>
                      {p.image_urls && p.image_urls.length > 0 ? <img src={p.image_urls[0]} style={{ height: 160, objectFit: "contain" }} alt="" /> : "📱"}
                      <button onClick={e => { e.stopPropagation(); toggleWatch(p.id); }} style={{ position: "absolute", top: 12, right: 12, background: C.white, border: "1px solid " + C.gray2, borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {watchlist.includes(p.id) ? "♥" : "♡"}
                      </button>
                      {p.image_urls && p.image_urls.length > 1 && (
                        <div style={{ position: "absolute", bottom: 12, right: 12, background: C.black, color: C.white, fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6, letterSpacing: "0.02em" }}>
                          {p.image_urls.length} photos
                        </div>
                      )}
                      {ended && (
                        <div style={{ position: "absolute", top: 12, left: 12, background: C.goldBg, border: "1px solid " + C.goldBorder, color: C.goldText, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 980, letterSpacing: "0.04em" }}>
                          🏆 Ended
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "16px 20px 20px" }}>
                      <div style={{ fontSize: 12, color: C.gray3, marginBottom: 2, fontWeight: 500 }}>{p.brand}</div>
                      <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8, letterSpacing: "-0.02em" }}>{p.model}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
                        <CondBadge cond={p.condition} />
                        <span style={{ fontSize: 12, color: C.gray3 }}>{p.storage}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div>
                          <div style={{ fontSize: 11, color: C.gray3, marginBottom: 2, letterSpacing: "0.02em", textTransform: "uppercase" }}>{ended ? "Winning bid" : "Current bid"}</div>
                          <div style={{ fontWeight: 700, fontSize: 22, color: ended ? C.goldText : C.black, letterSpacing: "-0.03em" }}>{formatZAR(p.current_bid)}</div>
                        </div>
                        <Countdown endTime={p.end_time} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DETAIL */}
        {page === "detail" && activePhone && (
          <div>
            <button onClick={() => setPage("home")} style={{ ...btnGhost, padding: 0, marginBottom: 32, fontSize: 14, color: C.gray3 }}>← All auctions</button>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              <div>
                {/* Large image gallery */}
                <div style={{ background: C.gray1, borderRadius: 18, height: 500, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, marginBottom: 20, position: "relative", overflow: "hidden" }}>
                  {activePhone.image_urls && activePhone.image_urls.length > 0 ? (
                    <img src={activePhone.image_urls[selectedImageIndex]} style={{ height: "100%", width: "100%", objectFit: "contain" }} alt={`${activePhone.brand} ${activePhone.model} image ${selectedImageIndex + 1}`} />
                  ) : (
                    "📱"
                  )}
                  
                  {/* Image navigation arrows */}
                  {activePhone.image_urls && activePhone.image_urls.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex((i) => (i - 1 + activePhone.image_urls.length) % activePhone.image_urls.length)}
                        style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: C.white, border: "none", width: 44, height: 44, borderRadius: "50%", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex((i) => (i + 1) % activePhone.image_urls.length)}
                        style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: C.white, border: "none", width: 44, height: 44, borderRadius: "50%", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        ›
                      </button>
                      
                      {/* Image indicators */}
                      <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
                        {activePhone.image_urls.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            style={{ width: idx === selectedImageIndex ? 24 : 8, height: 8, borderRadius: 4, background: idx === selectedImageIndex ? C.white : "rgba(255,255,255,0.6)", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail strip */}
                {activePhone.image_urls && activePhone.image_urls.length > 1 && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 8 }}>
                    {activePhone.image_urls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        style={{ minWidth: 80, height: 80, borderRadius: 12, border: selectedImageIndex === idx ? "2px solid " + C.blue : "1px solid " + C.gray2, overflow: "hidden", cursor: "pointer", background: "transparent", padding: 0 }}
                      >
                        <img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={`Thumbnail ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}

                <div style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 13, color: C.gray3, marginBottom: 4 }}>{activePhone.brand}</div>
                      <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: "-0.03em" }}>{activePhone.model}</div>
                    </div>
                    <button onClick={() => toggleWatch(activePhone.id)} style={{ background: "none", border: "1px solid " + C.gray2, borderRadius: "50%", width: 38, height: 38, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>{watchlist.includes(activePhone.id) ? "♥" : "♡"}</button>
                  </div>
                  {[["Storage", activePhone.storage], ["Condition", activePhone.condition], ["Colour", activePhone.color], ["Starting price", formatZAR(activePhone.start_price)]].map(function(row) {
                    return (
                      <div key={row[0]} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid " + C.gray1, fontSize: 14 }}>
                        <span style={{ color: C.gray3 }}>{row[0]}</span>
                        <span style={{ fontWeight: 500 }}>{row[0] === "Condition" ? <CondBadge cond={row[1]} /> : row[1]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ ...card, padding: 32 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.gray3, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>{endMs(activePhone) <= Date.now() ? "Winning bid" : "Current bid"}</span>
                    <Countdown endTime={activePhone.end_time} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 40, letterSpacing: "-0.04em", color: endMs(activePhone) <= Date.now() ? C.goldText : C.black, marginBottom: 28 }}>{formatZAR(activePhone.current_bid)}</div>

                  {endMs(activePhone) <= Date.now() ? (
                    <WinnerBanner bids={activeBids} />
                  ) : (
                    session ? (
                      <div>
                        <label style={lbl}>Your bid (min {formatZAR(activePhone.current_bid + 50)})</label>
                        <input type="number" placeholder={String(activePhone.current_bid + 50)} value={bidInput} onChange={e => setBidInput(e.target.value)} style={{ ...inp, marginBottom: 14, fontSize: 18, fontWeight: 500 }} />
                        <button onClick={requestBid} disabled={bidLoading} style={{ ...btnPrimary, width: "100%", padding: 16, fontSize: 16, opacity: bidLoading ? 0.7 : 1 }}>{bidLoading ? "Placing bid…" : "Place bid"}</button>
                        <p style={{ fontSize: 12, color: C.gray3, textAlign: "center", marginTop: 10 }}>You'll confirm before your bid is submitted.</p>
                      </div>
                    ) : (
                      <button onClick={() => { setPage("auth"); setAuthMode("login"); }} style={{ ...btnPrimary, width: "100%", padding: 16, fontSize: 16 }}>Sign in to bid</button>
                    )
                  )}
                </div>

                <div style={card}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, letterSpacing: "-0.02em" }}>Bid history ({activeBids.length})</div>
                  {activeBids.length === 0 ? <div style={{ fontSize: 14, color: C.gray3 }}>No bids yet — be the first.</div>
                    : activeBids.slice(0, 8).map(function(b, i) {
                      const isWinner = endMs(activePhone) <= Date.now() && i === 0;
                      return (
                        <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + C.gray1, fontSize: 14, background: isWinner ? C.goldBg : "transparent", marginLeft: isWinner ? -24 : 0, marginRight: isWinner ? -24 : 0, paddingLeft: isWinner ? 24 : 0, paddingRight: isWinner ? 24 : 0 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar name={b.user_name} size={28} />
                            <span style={{ fontWeight: i === 0 ? 600 : 400 }}>{b.user_name || "Anonymous"}</span>
                            {i === 0 && endMs(activePhone) > Date.now() && (
                              <span style={{ fontSize: 10, background: C.greenLight, color: C.green, padding: "2px 8px", borderRadius: 980, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Leading</span>
                            )}
                            {isWinner && (
                              <span style={{ fontSize: 10, background: C.goldBg, color: C.goldText, border: "1px solid " + C.goldBorder, padding: "2px 8px", borderRadius: 980, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>🏆 Winner</span>
                            )}
                          </span>
                          <span style={{ fontWeight: i === 0 ? 700 : 400, letterSpacing: "-0.02em", color: isWinner ? C.goldText : C.black }}>{formatZAR(b.amount)}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* DESCRIPTION SECTION (Admin Only) */}
            <div style={{ ...card, marginTop: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, letterSpacing: "-0.02em" }}>Device Description</div>
              
              {/* Admin edit form */}
              {profile && profile.is_admin ? (
                <div>
                  {comments[activePhone.id] && (
                    <div style={{ background: C.goldBg, border: "1px solid " + C.goldBorder, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.goldText, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Current description</div>
                      <p style={{ fontSize: 14, color: C.black, lineHeight: 1.6, margin: 0 }}>{comments[activePhone.id].content}</p>
                      <div style={{ fontSize: 12, color: C.gray3, marginTop: 8 }}>
                        Last updated: {new Date(comments[activePhone.id].updated_at).toLocaleDateString("en-ZA")} {new Date(comments[activePhone.id].updated_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  )}
                  
                  <label style={lbl}>Edit device description</label>
                  <textarea
                    placeholder="Add details about condition, features, included accessories, warranty status, etc..."
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    style={{
                      ...inp,
                      fontFamily: "inherit",
                      minHeight: 120,
                      padding: "12px 16px",
                      resize: "vertical",
                      fontWeight: 400
                    }}
                  />
                  <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                    <button onClick={addComment} disabled={commentLoading} style={{ ...btnPrimary, flex: 1, opacity: commentLoading ? 0.7 : 1 }}>
                      {commentLoading ? "Saving..." : comments[activePhone.id] ? "Update description" : "Add description"}
                    </button>
                    {comments[activePhone.id] && (
                      <button onClick={() => deleteComment(comments[activePhone.id].id)} style={{ ...btnDanger }}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  {comments[activePhone.id] ? (
                    <div style={{ background: C.gray1, borderRadius: 12, padding: 16 }}>
                      <p style={{ fontSize: 14, color: C.black, lineHeight: 1.6, margin: 0 }}>{comments[activePhone.id].content}</p>
                      <div style={{ fontSize: 12, color: C.gray3, marginTop: 12 }}>
                        Added by {comments[activePhone.id].user_name} on {new Date(comments[activePhone.id].created_at).toLocaleDateString("en-ZA")}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, color: C.gray3, textAlign: "center", padding: "24px 0" }}>No description added yet</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AUTH */}
        {page === "auth" && (
          <div style={{ maxWidth: 420, margin: "40px auto" }}>
            <div style={{ ...card, padding: 40 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <img src="/auth-logo.png" alt="Supreme Gadgets" style={{ width: 64, height: 64, objectFit: "contain", marginBottom: 8 }} />
                <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Supreme Gadgets</h2>
                <p style={{ fontSize: 15, color: C.gray3, margin: 0 }}>{authMode === "login" ? "Sign in to your account" : "Create your account"}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {authMode === "register" && (
                  <div>
                    <div style={{ marginBottom: 12 }}><label style={lbl}>Full name</label><input placeholder="Thabo Nkosi" value={authForm.name} onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))} style={inp} /></div>
                    <div style={{ marginBottom: 12 }}><label style={lbl}>Username</label><input placeholder="thabo_za" value={authForm.username} onChange={e => setAuthForm(f => ({ ...f, username: e.target.value }))} style={inp} /></div>
                    <div><label style={lbl}>Phone number</label><input placeholder="+27 81 234 5678" value={authForm.phone} onChange={e => setAuthForm(f => ({ ...f, phone: e.target.value }))} style={inp} /></div>
                  </div>
                )}
                <div><label style={lbl}>Email address</label><input type="email" value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} style={inp} /></div>
                <div><label style={lbl}>Password</label><input type="password" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} style={inp} /></div>
              </div>
              {authErr && <div style={{ color: C.red, fontSize: 13, marginTop: 14, padding: "10px 14px", background: C.redLight, borderRadius: 10 }}>{authErr}</div>}
              <button onClick={authMode === "login" ? login : register} style={{ ...btnPrimary, width: "100%", padding: 15, marginTop: 20, fontSize: 16 }}>
                {authMode === "login" ? "Sign in" : "Create account"}
              </button>
              <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: C.gray3 }}>
                {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
                <span onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthErr(""); }} style={{ color: C.black, cursor: "pointer", fontWeight: 500 }}>
                  {authMode === "login" ? "Create one" : "Sign in"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {page === "profile" && session && (
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ ...card, display: "flex", alignItems: "center", gap: 20, marginBottom: 20, padding: 32 }}>
              <Avatar name={(profile && profile.name) || "U"} size={64} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.03em" }}>{profile && profile.name}</div>
                <div style={{ fontSize: 14, color: C.gray3, marginTop: 4 }}>@{profile && profile.username} · {session.user.email}</div>
                {profile && profile.phone_number && <div style={{ fontSize: 14, color: C.gray3, marginTop: 2 }}>📱 {profile.phone_number}</div>}
                {profile && profile.is_admin && <span style={{ fontSize: 11, background: C.black, color: C.white, padding: "3px 10px", borderRadius: 980, fontWeight: 600, marginTop: 8, display: "inline-block", letterSpacing: "0.05em", textTransform: "uppercase" }}>Admin</span>}
              </div>
            </div>
            <div style={card}>
              <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4, letterSpacing: "-0.02em" }}>Watchlist ({watchlist.length})</div>
              <div style={{ fontSize: 13, color: C.gray3, marginBottom: 16 }}>Items you are watching</div>
              {watchlist.length === 0 ? <div style={{ fontSize: 14, color: C.gray3 }}>Nothing saved yet. Tap ♡ on any listing.</div>
                : watchlist.map(function(id) {
                  const p = listings.find(function(x) { return x.id === id; });
                  if (!p) return null;
                  return (
                    <div key={id} onClick={() => { setSelectedId(id); setPage("detail"); loadBids(id); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid " + C.gray1, cursor: "pointer" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{p.brand + " " + p.model}</div>
                        <div style={{ fontSize: 12, color: C.gray3, marginTop: 2 }}>{p.storage + " · " + p.condition}</div>
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

        {/* ADMIN */}
        {page === "admin" && profile && profile.is_admin && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 28, letterSpacing: "-0.03em", marginBottom: 32 }}>Admin panel</h2>
            <div style={{ ...card, marginBottom: 24 }}>
              <h3 style={{ fontWeight: 600, fontSize: 17, marginBottom: 20, letterSpacing: "-0.02em" }}>Add new listing</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                {[["brand","Brand *"],["model","Model *"],["storage","Storage"],["color","Colour"],["startPrice","Starting price (R) *"],["hours","Duration (hours) *"],["imageUrls","Image URLs (comma-separated)"]].map(function(item) {
                  return (
                    <div key={item[0]}>
                      <label style={lbl}>{item[1]}</label>
                      <input value={adminForm[item[0]]} onChange={e => setAdminForm(f => ({ ...f, [item[0]]: e.target.value }))} style={inp} placeholder={item[0] === "imageUrls" ? "https://example.com/img1.jpg, https://example.com/img2.jpg" : ""} />
                    </div>
                  );
                })}
                <div>
                  <label style={lbl}>Condition</label>
                  <select value={adminForm.condition} onChange={e => setAdminForm(f => ({ ...f, condition: e.target.value }))} style={inp}>
                    {["Like New","Excellent","Good","Fair"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={addListing} style={{ ...btnPrimary, marginTop: 20 }}>Add listing</button>
            </div>
            <div style={{ ...card, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontWeight: 600, fontSize: 17, letterSpacing: "-0.02em", margin: 0 }}>Auction Winners</h3>
                <button onClick={loadWinners} style={{ ...btnSecondary, padding: "6px 12px", fontSize: 13 }}>Refresh</button>
              </div>
              {winners.length === 0 ? (
                <div style={{ fontSize: 14, color: C.gray3, textAlign: "center", padding: "24px" }}>No completed auctions yet.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid " + C.gray2 }}>
                        <th style={{ textAlign: "left", padding: "12px 0", fontWeight: 600, color: C.gray3, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: 11 }}>Phone</th>
                        <th style={{ textAlign: "left", padding: "12px 0", fontWeight: 600, color: C.gray3, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: 11 }}>Winner Name</th>
                        <th style={{ textAlign: "left", padding: "12px 0", fontWeight: 600, color: C.gray3, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: 11 }}>Email</th>
                        <th style={{ textAlign: "left", padding: "12px 0", fontWeight: 600, color: C.gray3, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: 11 }}>Phone</th>
                        <th style={{ textAlign: "right", padding: "12px 0", fontWeight: 600, color: C.gray3, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: 11 }}>Winning Bid</th>
                        <th style={{ textAlign: "right", padding: "12px 0", fontWeight: 600, color: C.gray3, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: 11 }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {winners.map((w) => (
                        <tr key={w.listing_id} style={{ borderBottom: "1px solid " + C.gray1 }}>
                          <td style={{ padding: "12px 0" }}>
                            <div style={{ fontWeight: 600 }}>{w.brand} {w.model}</div>
                            <div style={{ fontSize: 12, color: C.gray3, marginTop: 2 }}>{w.storage} · <CondBadge cond={w.condition} /></div>
                          </td>
                          <td style={{ padding: "12px 0", fontWeight: 500 }}>{w.user_name || "Anonymous"}</td>
                          <td style={{ padding: "12px 0", fontSize: 13, color: C.black }}>
                            {w.email ? (
                              <a href={"mailto:" + w.email} style={{ color: C.black, textDecoration: "none" }}>
                                {w.email}
                              </a>
                            ) : (
                              <span style={{ color: C.gray3 }}>N/A</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 0", fontSize: 13 }}>
                            {w.phone_number ? (
                              <a href={"tel:" + w.phone_number} style={{ color: C.black, textDecoration: "none", fontWeight: 500 }}>
                                {w.phone_number}
                              </a>
                            ) : (
                              <span style={{ color: C.gray3 }}>N/A</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 700, color: C.goldText }}>{formatZAR(w.amount)}</td>
                          <td style={{ padding: "12px 0", textAlign: "right", fontSize: 12, color: C.gray3 }}>{new Date(w.end_time).toLocaleDateString("en-ZA")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div style={card}>
              <h3 style={{ fontWeight: 600, fontSize: 17, marginBottom: 20, letterSpacing: "-0.02em" }}>Manage listings ({listings.length})</h3>
              {listings.map(function(p) {
                const ended = endMs(p) <= Date.now();
                return (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid " + C.gray1, gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{p.brand + " " + p.model}</div>
                      <div style={{ fontSize: 12, color: C.gray3, marginTop: 2 }}>{p.storage} · <CondBadge cond={p.condition} /></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                      <span style={{ fontWeight: 700, letterSpacing: "-0.02em", color: ended ? C.goldText : C.black }}>{formatZAR(p.current_bid)}</span>
                      <Countdown endTime={p.end_time} />
                      <button onClick={() => removeListing(p.id)} style={btnDanger}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer style={{ borderTop: "1px solid " + C.gray2, marginTop: 80, padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em", marginBottom: 8 }}>Supreme Gadgets</div>
        <div style={{ fontSize: 13, color: C.gray3 }}>South Africa's pre-owned Tech auction platform · All prices in ZAR</div>
        <div style={{ fontSize: 12, color: C.gray3, marginTop: 8 }}>© 2025 Supreme Gadgets. All rights reserved.</div>
      </footer>
    </div>
  );
}
