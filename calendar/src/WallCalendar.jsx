import { useState, useRef, useEffect } from "react";

const MONTH_THEMES = [
  { name: "January",   grad: "linear-gradient(160deg,#0f2027 0%,#203a43 55%,#2c5364 100%)", accent: "#4FC3F7", accentDark: "#0277BD", rangeBg: "#B3E5FC", scene: "❄", label: "Winter Frost" },
  { name: "February",  grad: "linear-gradient(160deg,#360033 0%,#6a0f49 55%,#b5305c 100%)", accent: "#E91E8C", accentDark: "#AD1457", rangeBg: "#FCE4EC", scene: "✿", label: "Bloom Season" },
  { name: "March",     grad: "linear-gradient(160deg,#0d3320 0%,#1a6b4a 55%,#71b280 100%)", accent: "#66BB6A", accentDark: "#2E7D32", rangeBg: "#C8E6C9", scene: "☘", label: "Spring Green" },
  { name: "April",     grad: "linear-gradient(160deg,#0d1b6e 0%,#1565C0 55%,#42A5F5 100%)", accent: "#42A5F5", accentDark: "#1565C0", rangeBg: "#BBDEFB", scene: "☂", label: "April Showers" },
  { name: "May",       grad: "linear-gradient(160deg,#1b4f1f 0%,#2e7d32 55%,#66bb6a 100%)", accent: "#8BC34A", accentDark: "#33691E", rangeBg: "#DCEDC8", scene: "❀", label: "Golden Meadows" },
  { name: "June",      grad: "linear-gradient(160deg,#7a2800 0%,#e65100 55%,#ffa726 100%)", accent: "#FFA726", accentDark: "#E65100", rangeBg: "#FFE0B2", scene: "☀", label: "Summer Solstice" },
  { name: "July",      grad: "linear-gradient(160deg,#5c0011 0%,#b71c1c 55%,#ef5350 100%)", accent: "#EF5350", accentDark: "#B71C1C", rangeBg: "#FFCDD2", scene: "★", label: "Midsummer Blaze" },
  { name: "August",    grad: "linear-gradient(160deg,#2a0040 0%,#6a1b9a 55%,#ab47bc 100%)", accent: "#CE93D8", accentDark: "#6A1B9A", rangeBg: "#E1BEE7", scene: "◈", label: "Violet Dusk" },
  { name: "September", grad: "linear-gradient(160deg,#5a1500 0%,#bf360c 55%,#ff7043 100%)", accent: "#FF7043", accentDark: "#BF360C", rangeBg: "#FBE9E7", scene: "◉", label: "Autumn Leaves" },
  { name: "October",   grad: "linear-gradient(160deg,#1a1000 0%,#3e2800 55%,#8a5000 100%)", accent: "#FF8F00", accentDark: "#E65100", rangeBg: "#FFF8E1", scene: "◐", label: "Harvest Moon" },
  { name: "November",  grad: "linear-gradient(160deg,#0a0e1a 0%,#1a1e3a 55%,#2e3560 100%)", accent: "#78909C", accentDark: "#37474F", rangeBg: "#ECEFF1", scene: "◎", label: "Misty Pines" },
  { name: "December",  grad: "linear-gradient(160deg,#051020 0%,#0d1b2a 55%,#1b3a5c 100%)", accent: "#80DEEA", accentDark: "#00838F", rangeBg: "#E0F7FA", scene: "✦", label: "Silent Night" },
];

const HOLIDAYS = {
  "1-1": "New Year's Day", "1-15": "MLK Jr. Day",
  "2-14": "Valentine's Day", "3-17": "St. Patrick's Day",
  "4-18": "Good Friday", "5-26": "Memorial Day",
  "6-19": "Juneteenth", "7-4": "Independence Day",
  "9-1": "Labor Day", "10-31": "Halloween",
  "11-11": "Veterans Day", "11-27": "Thanksgiving",
  "12-25": "Christmas Day", "12-31": "New Year's Eve",
};

const DAY_LABELS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }
function fmtKey(y, m, d) { return `${y}-${m + 1}-${d}`; }
function parseKey(k) { const [y,m,d] = k.split("-").map(Number); return new Date(y, m-1, d); }

export default function WallCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [picking, setPicking] = useState(false);
  const [notes, setNotes] = useState({});
  const [draft, setDraft] = useState("");
  const [flipping, setFlipping] = useState(false);
  const [savedPulse, setSavedPulse] = useState(false);
  const cardRef = useRef(null);

  const T = MONTH_THEMES[month];
  const totalDays = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const noteKey = `${year}-${month}`;

  useEffect(() => { setDraft(notes[noteKey] || ""); }, [noteKey]);

  const changeMonth = (dir) => {
    setFlipping(true);
    setTimeout(() => {
      setMonth(prev => {
        if (prev + dir < 0) { setYear(y => y - 1); return 11; }
        if (prev + dir > 11) { setYear(y => y + 1); return 0; }
        return prev + dir;
      });
      setFlipping(false);
    }, 280);
  };

  const handleDay = (day) => {
    const key = fmtKey(year, month, day);
    if (!picking || !rangeStart) {
      setRangeStart(key); setRangeEnd(null); setPicking(true);
    } else {
      const s = parseKey(rangeStart), c = parseKey(key);
      if (c < s) { setRangeStart(key); setRangeEnd(rangeStart); }
      else { setRangeEnd(key); }
      setPicking(false);
    }
  };

  const inRange = (day) => {
    if (!rangeStart) return false;
    const key = fmtKey(year, month, day);
    const d = parseKey(key), s = parseKey(rangeStart);
    const e = rangeEnd ? parseKey(rangeEnd) : (picking && hovered ? parseKey(fmtKey(year, month, hovered)) : null);
    if (!e) return false;
    const [lo, hi] = s <= e ? [s, e] : [e, s];
    return d > lo && d < hi;
  };

  const isStart = (day) => {
    if (!rangeStart) return false;
    const key = fmtKey(year, month, day);
    const d = parseKey(key), s = parseKey(rangeStart);
    const e = rangeEnd ? parseKey(rangeEnd) : null;
    if (!e) return key === rangeStart;
    return d.getTime() === Math.min(s.getTime(), e.getTime());
  };

  const isEnd = (day) => {
    if (!rangeEnd) return false;
    const key = fmtKey(year, month, day);
    const d = parseKey(key), s = parseKey(rangeStart), e = parseKey(rangeEnd);
    return d.getTime() === Math.max(s.getTime(), e.getTime());
  };

  const isToday = (day) =>
    now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;

  const getHoliday = (day) => HOLIDAYS[`${month + 1}-${day}`] || null;

  const saveNote = () => {
    setNotes(p => ({ ...p, [noteKey]: draft }));
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1500);
  };

  const clearRange = () => { setRangeStart(null); setRangeEnd(null); setPicking(false); };

  const rangeSummary = (() => {
    if (!rangeStart) return null;
    if (!rangeEnd) return picking ? "Select end date…" : rangeStart;
    const s = parseKey(rangeStart), e = parseKey(rangeEnd);
    const [lo, hi] = s < e ? [s, e] : [e, s];
    const days = Math.round((hi - lo) / 86400000) + 1;
    const fmt = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(lo)} → ${fmt(hi)}  ·  ${days} day${days !== 1 ? "s" : ""}`;
  })();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div style={{
      minHeight: "100vh", background: "#DDD9D0",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Georgia', serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .wc-root { font-family: 'DM Sans', sans-serif; }
        .wc-flip { animation: wcflip .28s cubic-bezier(.4,0,.2,1) both; }
        @keyframes wcflip { from { opacity:0; transform:perspective(600px) rotateX(-6deg) translateY(-12px); } to { opacity:1; transform:none; } }
        .wc-day { cursor:pointer; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-size:12.5px; font-family:'DM Sans',sans-serif; font-weight:400; transition:background .12s, transform .12s, color .12s; position:relative; margin:auto; user-select:none; }
        .wc-day:hover { transform:scale(1.18); }
        .wc-in-range { border-radius:0; width:100%; }
        .wc-start { border-radius:50% 0 0 50%; width:100%; padding-left:calc(50% - 15px); display:flex; align-items:center; justify-content:center; }
        .wc-end { border-radius:0 50% 50% 0; width:100%; padding-right:calc(50% - 15px); display:flex; align-items:center; justify-content:center; }
        .wc-start.wc-end { border-radius:50%; width:30px; padding:0; }
        .wc-navbtn { background:rgba(255,255,255,0.18); border:1.5px solid rgba(255,255,255,0.35); color:#fff; width:34px; height:34px; border-radius:50%; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; transition:all .2s; line-height:1; }
        .wc-navbtn:hover { background:rgba(255,255,255,0.35); transform:scale(1.08); }
        .wc-hol-dot { position:absolute; bottom:1px; left:50%; transform:translateX(-50%); width:3px; height:3px; border-radius:50%; }
        .wc-tip { position:absolute; bottom:calc(100%+5px); left:50%; transform:translateX(-50%); background:#111; color:#fff; font-size:9px; font-family:'DM Sans',sans-serif; white-space:nowrap; padding:3px 7px; border-radius:4px; pointer-events:none; z-index:20; }
        .wc-tip::after { content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%); border:4px solid transparent; border-top-color:#111; }
        .wc-note { width:100%; resize:none; border:none; outline:none; background:transparent; font-family:'DM Sans',sans-serif; font-size:13px; color:#444; line-height:2.1em; background-image:repeating-linear-gradient(transparent, transparent calc(2.1em - 1px), #DDD8D0 calc(2.1em - 1px), #DDD8D0 2.1em); background-size:100% 2.1em; padding:0; }
        .wc-note::placeholder { color:#BBB; }
        .wc-savebtn { font-size:11px; font-family:'DM Sans',sans-serif; padding:4px 14px; border-radius:20px; border:1.5px solid; cursor:pointer; transition:all .2s; background:transparent; }
        .wc-savebtn:hover { opacity:.8; }
        .wc-savebtn.pulse { animation:wcpulse .4s ease; }
        @keyframes wcpulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        .wc-spiral { width:16px; height:16px; border-radius:50%; border:2.5px solid #888; background:radial-gradient(circle at 40% 35%, #ccc, #777); display:inline-block; margin:0 5px; box-shadow:0 1px 3px rgba(0,0,0,0.35); }
        @media(max-width:650px) {
          .wc-body { flex-direction:column !important; }
          .wc-left { width:100% !important; min-width:unset !important; height:200px !important; flex-direction:row !important; align-items:flex-end !important; }
          .wc-left-bottom { flex-direction:row !important; align-items:center !important; gap:12px !important; }
          .wc-right { padding:14px !important; }
        }
      `}</style>

      {/* Spiral wire */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:-1, zIndex:3 }}>
        {Array.from({length:20}).map((_,i)=><div key={i} className="wc-spiral" />)}
      </div>

      {/* Card */}
      <div ref={cardRef} className={`wc-root ${flipping?"wc-flip":""}`} style={{
        width:"100%", maxWidth:840,
        background:"#FAFAF7",
        borderRadius:"0 0 3px 3px",
        boxShadow:`0 12px 50px rgba(0,0,0,0.22), 0 3px 12px rgba(0,0,0,0.12)`,
        overflow:"hidden",
      }}>
        <div className="wc-body" style={{ display:"flex", minHeight:500 }}>

          {/* LEFT IMAGE PANEL */}
          <div className="wc-left" style={{
            minWidth:280, width:"36%", flexShrink:0,
            background:T.grad,
            position:"relative", overflow:"hidden",
            display:"flex", flexDirection:"column",
            justifyContent:"space-between",
          }}>
            {/* Decorative SVG landscape */}
            <svg viewBox="0 0 280 500" preserveAspectRatio="xMidYMid slice" style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.6 }}>
              {/* Stars */}
              {Array.from({length:24}).map((_,i)=>(
                <circle key={i} cx={10+((i*97)%260)} cy={8+((i*43)%180)} r={i%4===0?1.8:0.9} fill={T.accent} opacity={0.3+((i%5)*0.14)} />
              ))}
              {/* Mountains back */}
              <polygon points="0,340 50,200 110,270 170,160 230,230 280,180 280,500 0,500" fill="rgba(0,0,0,0.2)" />
              {/* Mountains front */}
              <polygon points="0,380 80,260 140,310 200,230 280,290 280,500 0,500" fill="rgba(0,0,0,0.28)" />
              {/* Glowing orb */}
              <circle cx="155" cy="145" r="55" fill={T.accent} opacity="0.12" />
              <circle cx="155" cy="145" r="30" fill={T.accent} opacity="0.18" />
              {/* Central icon */}
              <text x="155" y="165" textAnchor="middle" fontSize="50" opacity="0.55" fill={T.accent}>{T.scene}</text>
              {/* Horizon glow */}
              <ellipse cx="140" cy="280" rx="130" ry="30" fill={T.accent} opacity="0.08" />
            </svg>

            {/* Nav bar top */}
            <div style={{ position:"relative", zIndex:2, padding:"18px 16px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <button className="wc-navbtn" onClick={()=>changeMonth(-1)}>‹</button>
              <div style={{ textAlign:"center" }}>
                <div style={{ color:"rgba(255,255,255,0.55)", fontSize:10, letterSpacing:"0.12em", fontFamily:"'DM Sans',sans-serif" }}>NAVIGATE</div>
              </div>
              <button className="wc-navbtn" onClick={()=>changeMonth(1)}>›</button>
            </div>

            {/* Bottom month label with chevron cut like reference */}
            <div className="wc-left-bottom" style={{ position:"relative", zIndex:2, flexDirection:"column" }}>
              <svg viewBox="0 0 280 80" width="100%" style={{ display:"block", marginBottom:-1 }}>
                {/* White chevron cutout (matching reference image aesthetic) */}
                <polygon points="0,80 0,20 90,80" fill="#FAFAF7" />
                <polygon points="280,80 280,5 165,80" fill="#FAFAF7" />
              </svg>
              <div style={{ background:"#FAFAF7", padding:"2px 20px 18px" }}>
                <div style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>
                  <div style={{ fontSize:13, color:T.accentDark, opacity:0.7, fontWeight:400, letterSpacing:"0.05em" }}>{year}</div>
                  <div style={{ fontSize:30, color:T.accentDark, fontWeight:900, lineHeight:1.05, letterSpacing:"0.02em" }}>
                    {T.name.toUpperCase()}
                  </div>
                  <div style={{ fontSize:10, color:"#AAA", letterSpacing:"0.1em", marginTop:3, fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>
                    {T.label}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="wc-right" style={{ flex:1, padding:"22px 22px 18px", display:"flex", flexDirection:"column", background:"#FAFAF7" }}>

            {/* Range info bar */}
            {rangeStart && (
              <div style={{ marginBottom:10, padding:"5px 12px", background:T.rangeBg, borderRadius:6, fontSize:11.5, fontFamily:"'DM Sans',sans-serif", color:T.accentDark, display:"flex", justifyContent:"space-between", alignItems:"center", border:`1px solid ${T.accent}40` }}>
                <span>📅 {rangeSummary}</span>
                <button onClick={clearRange} style={{ background:"none", border:"none", cursor:"pointer", color:T.accentDark, fontSize:13, opacity:0.6, padding:"0 2px", lineHeight:1 }}>✕</button>
              </div>
            )}

            {/* Day headers */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:2 }}>
              {DAY_LABELS.map(d=>(
                <div key={d} style={{ textAlign:"center", fontSize:9.5, fontFamily:"'DM Sans',sans-serif", fontWeight:500, letterSpacing:"0.07em", color: d==="SAT"||d==="SUN" ? T.accentDark : "#ABABAB", padding:"2px 0" }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ flex:1 }}>
              {weeks.map((week, wi)=>(
                <div key={wi} style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:2 }}>
                  {week.map((day, di)=>{
                    if (!day) return <div key={`e-${wi}-${di}`} style={{ height:30 }} />;
                    const hol = getHoliday(day);
                    const isWknd = di >= 5;
                    const start = isStart(day);
                    const end = isEnd(day);
                    const range = inRange(day);
                    const today = isToday(day);
                    const isHov = hovered === day;

                    let bg = "transparent";
                    let fg = isWknd ? T.accentDark : "#2A2A2A";
                    if (start || end) { bg = T.accentDark; fg = "#fff"; }
                    else if (range) { bg = T.rangeBg; fg = T.accentDark; }

                    let cls = "wc-day";
                    if (start && end) cls += " wc-start wc-end";
                    else if (start) cls += " wc-start";
                    else if (end) cls += " wc-end";
                    else if (range) cls += " wc-in-range";

                    return (
                      <div key={day} style={{ position:"relative", height:34, display:"flex", alignItems:"center" }}>
                        <div className={cls} style={{
                          background: bg, color: fg,
                          fontWeight: today ? 600 : 400,
                          outline: today && !start && !end ? `2px solid ${T.accentDark}` : "none",
                          outlineOffset: -1,
                          width: range ? "100%" : (start||end) ? "100%" : 30,
                        }}
                          onClick={()=>handleDay(day)}
                          onMouseEnter={()=>setHovered(day)}
                          onMouseLeave={()=>setHovered(null)}
                        >
                          {day}
                          {hol && isHov && <div className="wc-tip">{hol}</div>}
                          {hol && <div className="wc-hol-dot" style={{ background: start||end ? "rgba(255,255,255,0.7)" : T.accentDark }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", fontSize:9.5, fontFamily:"'DM Sans',sans-serif", color:"#B0A8A0", margin:"8px 0 10px", alignItems:"center" }}>
              <span style={{ display:"flex", gap:4, alignItems:"center" }}>
                <span style={{ width:7,height:7,borderRadius:"50%",background:T.accentDark,display:"inline-block",opacity:0.6 }}/>Holiday
              </span>
              <span style={{ display:"flex", gap:4, alignItems:"center" }}>
                <span style={{ width:16,height:16,borderRadius:"50%",background:T.accentDark,display:"inline-block" }}/>Start / End
              </span>
              <span style={{ display:"flex", gap:4, alignItems:"center" }}>
                <span style={{ width:22,height:10,borderRadius:2,background:T.rangeBg,border:`1px solid ${T.accent}60`,display:"inline-block" }}/>In range
              </span>
              <span style={{ marginLeft:"auto", fontStyle:"italic" }}>
                {picking ? "Now click end date" : "Click to select range"}
              </span>
            </div>

            {/* Divider */}
            <div style={{ height:"0.5px", background:"#E0DDD5", margin:"0 0 12px" }} />

            {/* Notes section (matching reference's lined notes area) */}
            <div>
              <div style={{ fontSize:9.5, letterSpacing:"0.12em", color:"#C0B8B0", fontFamily:"'DM Sans',sans-serif", marginBottom:6, textTransform:"uppercase" }}>Notes</div>
              <textarea
                className="wc-note"
                rows={5}
                value={draft}
                onChange={e=>setDraft(e.target.value)}
                onBlur={saveNote}
                placeholder={`Add notes for ${T.name} ${year}…`}
              />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
                {draft !== (notes[noteKey]||"") ? (
                  <button className={`wc-savebtn ${savedPulse?"pulse":""}`} style={{ borderColor:T.accentDark, color:T.accentDark }} onClick={saveNote}>
                    Save note
                  </button>
                ) : (
                  savedPulse
                    ? <span style={{ fontSize:11, fontFamily:"'DM Sans',sans-serif", color:"#8AAA70" }}>✓ Saved</span>
                    : <span/>
                )}
                {draft && <button onClick={()=>setDraft("")} style={{ fontSize:11, fontFamily:"'DM Sans',sans-serif", background:"none", border:"none", cursor:"pointer", color:"#C0B8B0" }}>Clear</button>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page shadow */}
      <div style={{ width:"97%", maxWidth:816, height:8, background:"linear-gradient(to bottom,rgba(0,0,0,0.13),transparent)", borderRadius:"0 0 3px 3px" }} />

      <p style={{ marginTop:18, fontSize:11, fontFamily:"'DM Sans',sans-serif", color:"#AAA", letterSpacing:"0.05em", textAlign:"center" }}>
        Click any date to start a range · click again to set end · hover for holidays
      </p>
    </div>
  );
}