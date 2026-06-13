import Head from "next/head";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const EXAMPLES = [
  { label: "😶 I'm Fine",       text: "Me: Hey are you okay?\nThem: Yeah I'm fine.\nMe: You sure? You seem off.\nThem: I said I'm fine." },
  { label: "👻 Left on Read",   text: "Me: Hey! Want to grab coffee this week?\nThem: [seen 2 days ago]\nThem: haha yeah maybe! been super busy" },
  { label: "😬 Cold Boss",      text: "Hi,\nSeen your work on the project. Let's find time to connect this week.\nThanks" },
  { label: "💀 Sounds Good",    text: "Me: We still on for Saturday?\nThem: sounds good\nMe: Great! I'll book it\nThem: sure" },
  { label: "👀 Mixed Signals",  text: "Them: I miss you\nMe: I miss you too, we should hang\nThem: yeah for sure\nMe: When are you free?\nThem: idk this week is crazy" },
];

const TONES = [
  { emoji: "💕", label: "Romantic",      value: "Romantic / Partner" },
  { emoji: "🫂", label: "Bestie",        value: "Friend / Bestie" },
  { emoji: "💼", label: "Work",          value: "Work / Boss" },
  { emoji: "👨‍👩‍👧", label: "Family",   value: "Family" },
  { emoji: "👀", label: "Situationship", value: "Situationship" },
];

const REACTIONS = [
  { emoji: "💀", label: "So accurate"   },
  { emoji: "😭", label: "Why is this me" },
  { emoji: "🤯", label: "I'm shook"     },
  { emoji: "😤", label: "Nah they buggin" },
];

const LIMIT = 15;
const GRAD  = "linear-gradient(135deg,#6d28d9,#db2777)";

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function Avatar({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: GRAD, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.48,
      boxShadow: "0 2px 10px rgba(109,40,217,.45)",
    }}>🔮</div>
  );
}

function Dots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "rgba(255,255,255,.55)",
          animation: `tdot 1.2s ease-in-out ${i*.18}s infinite`,
        }}/>
      ))}
    </div>
  );
}

function Bubble({ from = "bot", delay = 0, typing = false, children }) {
  const me = from === "me";
  return (
    <div className="bin" style={{
      display:"flex", flexDirection: me ? "row-reverse" : "row",
      alignItems:"flex-end", gap:8, marginBottom:8,
      animationDelay:`${delay}s`,
    }}>
      {!me && <Avatar/>}
      <div style={{
        maxWidth:"78%",
        background: me ? "linear-gradient(135deg,#6d28d9,#7c3aed)" : "rgba(255,255,255,.07)",
        backdropFilter: me ? undefined : "blur(14px)",
        border: me ? "none" : "1px solid rgba(255,255,255,.1)",
        borderRadius: me ? "22px 22px 6px 22px" : "22px 22px 22px 6px",
        padding: typing ? "14px 18px" : "12px 16px",
        boxShadow: me ? "0 4px 22px rgba(109,40,217,.38)" : "0 2px 14px rgba(0,0,0,.3)",
      }}>
        {typing ? <Dots/> : children}
      </div>
    </div>
  );
}

function WideBubble({ delay = 0, children }) {
  return (
    <div className="bin" style={{
      display:"flex", flexDirection:"row", alignItems:"flex-end",
      gap:8, marginBottom:10, animationDelay:`${delay}s`,
    }}>
      <Avatar/>
      <div style={{ flex:1, minWidth:0 }}>{children}</div>
    </div>
  );
}

function Glass({ children, style = {} }) {
  return (
    <div style={{
      background:"rgba(255,255,255,.05)",
      border:"1px solid rgba(255,255,255,.09)",
      borderRadius:18, padding:"14px 16px",
      backdropFilter:"blur(10px)", ...style,
    }}>{children}</div>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────
function ShareModal({ result, convo, onClose }) {
  const [copied, setCopied] = useState(false);
  const short = convo.length > 90 ? convo.slice(0,90)+"…" : convo;

  const copy = () => {
    navigator.clipboard.writeText(
      `🔮 Said Different decoded my convo:\n\n"${short}"\n\n${result.headline}\n\nVibe: ${result.vibe} · ${result.confidence}% sure\n\n→ saiddifferent.app`
    ).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };

  return (
    <div role="dialog" aria-modal="true"
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.82)",
        backdropFilter:"blur(14px)", display:"flex", alignItems:"flex-end",
        justifyContent:"center", zIndex:400 }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{
        width:"100%", maxWidth:480, background:"#13001f",
        border:"1px solid rgba(109,40,217,.42)",
        borderRadius:"28px 28px 0 0", padding:"12px 20px 44px",
        boxShadow:"0 -28px 80px rgba(109,40,217,.28)",
      }}>
        <div style={{ width:44, height:5, background:"rgba(255,255,255,.14)", borderRadius:3, margin:"0 auto 22px" }}/>
        <p style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,.4)", letterSpacing:2,
          textTransform:"uppercase", textAlign:"center", margin:"0 0 18px" }}>
          Share your decode
        </p>

        {/* Preview card */}
        <div style={{ background:"linear-gradient(160deg,#1e003a 0%,#0d001a 100%)",
          border:"1px solid rgba(109,40,217,.35)", borderRadius:22, padding:20, marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14,
            paddingBottom:14, borderBottom:"1px solid rgba(255,255,255,.07)" }}>
            <Avatar size={38}/>
            <div>
              <div style={{ fontWeight:800, fontSize:14 }}>Said Different</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>Conversation Decoder</div>
            </div>
          </div>
          <p style={{ fontFamily:"system-ui", color:"rgba(255,255,255,.38)", fontSize:12,
            fontStyle:"italic", lineHeight:1.55, margin:"0 0 12px" }}>"{short}"</p>
          <div style={{ background:"linear-gradient(135deg,rgba(109,40,217,.25),rgba(219,39,119,.2))",
            border:"1px solid rgba(109,40,217,.42)", borderRadius:16, padding:"12px 14px", marginBottom:10 }}>
            <p style={{ fontSize:15, fontWeight:800, margin:0, lineHeight:1.3 }}>{result.headline}</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {[
              { l:"VIBE",     v:result.vibe,            c:"#a78bfa", bg:"rgba(109,40,217,.15)", b:"rgba(109,40,217,.3)" },
              { l:"ACCURACY", v:`${result.confidence}%`, c:"#f472b6", bg:"rgba(219,39,119,.15)", b:"rgba(219,39,119,.3)" },
            ].map(({l,v,c,bg,b}) => (
              <div key={l} style={{ flex:1, background:bg, border:`1px solid ${b}`,
                borderRadius:10, padding:"8px 10px", textAlign:"center" }}>
                <div style={{ fontSize:9, fontWeight:700, color:c, letterSpacing:1.5, marginBottom:3 }}>{l}</div>
                <div style={{ fontSize:14, fontWeight:800 }}>{v}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop:14, textAlign:"center", fontSize:10, fontWeight:700,
            color:"rgba(255,255,255,.18)", letterSpacing:3, textTransform:"uppercase" }}>
            saiddifferent.app
          </p>
        </div>

        <button className="bbtn" onClick={copy} style={{
          width:"100%", padding:"17px",
          background: copied ? "#16a34a" : GRAD,
          border:"none", borderRadius:16, color:"#fff",
          fontSize:16, fontWeight:800, cursor:"pointer",
          boxShadow:"0 6px 26px rgba(109,40,217,.42)",
          transition:"background .3s",
        }}>
          {copied ? "✓  Copied! Paste to TikTok / Stories" : "📋  Copy for TikTok / Stories"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [conversation, setConversation] = useState("");
  const [tone,         setTone]         = useState("Romantic / Partner");
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [showShare,    setShowShare]    = useState(false);
  const [used,         setUsed]         = useState(0);
  const [error,        setError]        = useState(null);
  const [reaction,     setReaction]     = useState(null);
  const [history,      setHistory]      = useState([]);
  const [showHist,     setShowHist]     = useState(false);
  const [floaters,     setFloaters]     = useState([]);

  const resultRef = useRef(null);
  const taRef     = useRef(null);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("sd_usage") || "{}");
      if (u.date === new Date().toDateString()) setUsed(u.count || 0);
      const h = JSON.parse(localStorage.getItem("sd_hist") || "[]");
      setHistory(h);
    } catch {}
  }, []);

  const burst = useCallback((emoji) => {
    const items = Array.from({length:7},(_,i) => ({
      emoji, id: Date.now()+i, x: 12 + Math.random()*76,
    }));
    setFloaters(items);
    setTimeout(() => setFloaters([]), 1700);
  }, []);

  const analyze = useCallback(async () => {
    if (!conversation.trim() || loading || used >= LIMIT) return;
    setLoading(true); setResult(null); setError(null); setReaction(null);
    try {
      const res  = await fetch("/api/decode", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ conversation, tone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong 👀"); return; }

      setResult(data);
      const next = used + 1;
      setUsed(next);
      localStorage.setItem("sd_usage", JSON.stringify({ count:next, date:new Date().toDateString() }));

      const hist = [
        { convo: conversation.slice(0,60)+(conversation.length>60?"…":""), headline:data.headline, vibe:data.vibe },
        ...history,
      ].slice(0,8);
      setHistory(hist);
      localStorage.setItem("sd_hist", JSON.stringify(hist));

      burst("🔮");
      setTimeout(() => resultRef.current?.scrollIntoView({behavior:"smooth",block:"start"}), 120);
    } catch {
      setError("Network error. Check connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [conversation, tone, loading, used, history, burst]);

  const reset = useCallback(() => {
    setResult(null); setConversation(""); setReaction(null); setError(null);
    setTimeout(() => taRef.current?.focus(), 80);
  }, []);

  const remaining = LIMIT - used;

  // ── CSS injected once ──────────────────────────────────────────────────────
  const css = `
    *,*::before,*::after{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    html,body{margin:0;padding:0;background:#080010;color:#fff;
      font-family:'Plus Jakarta Sans',system-ui,sans-serif;
      -webkit-font-smoothing:antialiased;overflow-x:hidden}
    ::-webkit-scrollbar{width:3px}
    ::-webkit-scrollbar-thumb{background:rgba(109,40,217,.4);border-radius:2px}
    textarea{caret-color:#a855f7}
    textarea::placeholder{color:rgba(255,255,255,.22)!important}
    textarea:focus{outline:none}

    @keyframes bin{from{opacity:0;transform:scale(.82) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes tdot{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
    @keyframes float{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-150px) scale(1.6)}}
    @keyframes gp{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
    @keyframes orb1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.1)}66%{transform:translate(-20px,15px) scale(.95)}}
    @keyframes orb2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-25px,20px) scale(.9)}66%{transform:translate(20px,-15px) scale(1.08)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    @keyframes sup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}

    .bin{animation:bin .38s cubic-bezier(.34,1.4,.64,1) both}
    .sup{animation:sup .35s ease both}
    .bbtn{transition:transform .18s,box-shadow .18s}
    .bbtn:active{transform:scale(.96)}
    .tchip{transition:all .18s cubic-bezier(.34,1.56,.64,1)}
    .tchip:active{transform:scale(.88)}
    .rbtn{transition:all .18s cubic-bezier(.34,1.56,.64,1)}
    .rbtn:active{transform:scale(.88)}
    .exrow:hover{background:rgba(109,40,217,.1)!important;border-color:rgba(109,40,217,.35)!important}
  `;

  return (
    <>
      <Head>
        <title>Said Different — Conversation Decoder</title>
        <style>{css}</style>
      </Head>

      {/* ── Ambient BG ── */}
      <div aria-hidden style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", top:"-10%", left:"15%", width:500, height:500,
          borderRadius:"50%", background:"radial-gradient(circle,rgba(109,40,217,.18) 0%,transparent 65%)",
          animation:"orb1 14s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", top:"30%", right:"-5%", width:400, height:400,
          borderRadius:"50%", background:"radial-gradient(circle,rgba(219,39,119,.13) 0%,transparent 65%)",
          animation:"orb2 18s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", bottom:"-5%", left:"30%", width:350, height:350,
          borderRadius:"50%", background:"radial-gradient(circle,rgba(59,130,246,.09) 0%,transparent 65%)",
          animation:"orb1 22s ease-in-out infinite reverse" }}/>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
          background:"linear-gradient(90deg,transparent,rgba(109,40,217,.18),transparent)",
          animation:"scan 9s linear infinite" }}/>
      </div>

      {/* ── Emoji burst ── */}
      {floaters.map(f => (
        <div key={f.id} style={{ position:"fixed", bottom:"32%", left:`${f.x}%`,
          fontSize:30, pointerEvents:"none", zIndex:999, animation:"float 1.5s ease-out forwards" }}>
          {f.emoji}
        </div>
      ))}

      {/* ── Shell ── */}
      <div style={{ position:"relative", zIndex:1, maxWidth:480, margin:"0 auto", padding:"0 16px 110px" }}>

        {/* Status bar mock */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          paddingTop:14, paddingBottom:8, opacity:.38 }}>
          <span style={{ fontSize:12, fontWeight:700 }}>9:41</span>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
              <rect x="0"    y="6" width="3"   height="6" rx="1"/>
              <rect x="4.5"  y="3" width="3"   height="9" rx="1"/>
              <rect x="9"    y="0" width="3"   height="12" rx="1"/>
              <rect x="13.5" y="0" width="2.5" height="12" rx="1" opacity=".35"/>
            </svg>
            <svg width="15" height="12" viewBox="0 0 15 12" fill="white">
              <path d="M7.5 2C9.8 2 11.9 3 13.4 4.6L15 3C13 1.1 10.4 0 7.5 0S2 1.1 0 3l1.6 1.6C3.1 3 5.2 2 7.5 2z"/>
              <path d="M7.5 5c1.4 0 2.7.5 3.7 1.4L12.8 5C11.4 3.8 9.5 3 7.5 3S3.6 3.8 2.2 5l1.6 1.4C4.8 5.5 6.1 5 7.5 5z"/>
              <circle cx="7.5" cy="9" r="2"/>
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x=".5" y=".5" width="21" height="11" rx="3.5" stroke="white" strokeOpacity=".35"/>
              <rect x="2"  y="2"  width="16" height="8"  rx="2"   fill="white"/>
              <path d="M23 4v4a2 2 0 000-4z" fill="white" fillOpacity=".38"/>
            </svg>
          </div>
        </div>

        {/* Chat header */}
        <div style={{ display:"flex", alignItems:"center", gap:12,
          padding:"12px 16px", background:"rgba(255,255,255,.04)",
          border:"1px solid rgba(255,255,255,.08)", borderRadius:20,
          marginBottom:24, backdropFilter:"blur(20px)" }}>
          <Avatar size={44}/>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:16, letterSpacing:-.3 }}>Said Different</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e",
                boxShadow:"0 0 6px #22c55e", animation:"pulse 2.2s ease-in-out infinite" }}/>
              reads between the lines
            </div>
          </div>
          <div style={{ padding:"5px 12px",
            background: remaining > 5 ? "rgba(109,40,217,.18)" : "rgba(239,68,68,.18)",
            border:`1px solid ${remaining > 5 ? "rgba(109,40,217,.42)" : "rgba(239,68,68,.42)"}`,
            borderRadius:20, fontSize:11, fontWeight:700,
            color: remaining > 5 ? "#c4b5fd" : "#fca5a5" }}>
            {remaining} left
          </div>
        </div>

        {/* ── INPUT STATE ── */}
        {!result && !loading && (
          <div>
            <div style={{ textAlign:"center", marginBottom:18 }}>
              <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,.22)",
                background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.07)",
                borderRadius:20, padding:"4px 14px" }}>Today</span>
            </div>

            <Bubble from="bot" delay={0}>
              <p style={{ margin:0, fontSize:15, fontWeight:500, color:"rgba(255,255,255,.9)", lineHeight:1.55 }}>
                hey 👋 paste any convo and i&apos;ll tell you what they <em>actually</em> meant
              </p>
            </Bubble>

            <Bubble from="bot" delay={0.12}>
              <p style={{ margin:0, fontSize:14, color:"rgba(255,255,255,.7)", lineHeight:1.5 }}>
                no sugarcoating. no reassurance. just the truth 💀
              </p>
            </Bubble>

            {/* Tone picker */}
            <WideBubble delay={0.24}>
              <Glass>
                <p style={{ margin:"0 0 10px", fontSize:13, fontWeight:600, color:"rgba(255,255,255,.55)" }}>who texted you?</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {TONES.map(t => {
                    const on = tone === t.value;
                    return (
                      <button key={t.value} className="tchip" onClick={() => setTone(t.value)} style={{
                        padding:"8px 14px", borderRadius:20, cursor:"pointer", fontFamily:"inherit",
                        border: on ? "1.5px solid rgba(109,40,217,.75)" : "1px solid rgba(255,255,255,.1)",
                        background: on ? "rgba(109,40,217,.28)" : "rgba(255,255,255,.04)",
                        color: on ? "#c4b5fd" : "rgba(255,255,255,.6)",
                        fontSize:13, fontWeight: on ? 700 : 500,
                        boxShadow: on ? "0 0 14px rgba(109,40,217,.28)" : "none",
                      }}>{t.emoji} {t.label}</button>
                    );
                  })}
                </div>
              </Glass>
            </WideBubble>

            {/* Examples */}
            <WideBubble delay={0.36}>
              <Glass>
                <p style={{ margin:"0 0 10px", fontSize:13, fontWeight:600, color:"rgba(255,255,255,.55)" }}>or try one of these 👇</p>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {EXAMPLES.map(ex => (
                    <button key={ex.label} className="exrow" onClick={() => setConversation(ex.text)} style={{
                      padding:"10px 14px", borderRadius:12, textAlign:"left", cursor:"pointer", fontFamily:"inherit",
                      background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)",
                      color:"rgba(255,255,255,.65)", fontSize:13, fontWeight:500,
                      transition:"background .15s,border-color .15s",
                    }}>{ex.label}</button>
                  ))}
                </div>
              </Glass>
            </WideBubble>

            {conversation && (
              <Bubble from="me" delay={0}>
                <p style={{ margin:0, fontSize:14, fontWeight:500, color:"rgba(255,255,255,.95)",
                  lineHeight:1.65, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                  {conversation}
                </p>
              </Bubble>
            )}

            {error && (
              <Bubble from="bot" delay={0}>
                <p style={{ margin:0, fontSize:14, color:"#fca5a5" }}>
                  {error}{" "}
                  <button onClick={analyze} style={{ color:"#a78bfa", background:"none", border:"none",
                    cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:700 }}>
                    try again
                  </button>
                </p>
              </Bubble>
            )}
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div>
            <Bubble from="me" delay={0}>
              <p style={{ margin:0, fontSize:14, fontWeight:500, color:"rgba(255,255,255,.9)",
                lineHeight:1.65, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                {conversation}
              </p>
            </Bubble>
            <Bubble from="bot" delay={0.2} typing/>
            <Bubble from="bot" delay={0.55} typing/>
          </div>
        )}

        {/* ── RESULTS ── */}
        {result && !loading && (
          <div ref={resultRef}>

            {/* User msg */}
            <Bubble from="me" delay={0}>
              <p style={{ margin:0, fontSize:14, fontWeight:500, color:"rgba(255,255,255,.9)",
                lineHeight:1.65, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                {conversation}
              </p>
            </Bubble>

            {/* Red flag */}
            {result.redFlag && (
              <Bubble from="bot" delay={0.05}>
                <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <span style={{ fontSize:20, lineHeight:1 }}>🚩</span>
                  <div>
                    <div style={{ fontSize:10, fontWeight:800, color:"#fca5a5",
                      letterSpacing:1.5, marginBottom:4, textTransform:"uppercase" }}>Red Flag</div>
                    <p style={{ margin:0, fontSize:14, color:"rgba(255,255,255,.82)", lineHeight:1.6 }}>
                      {result.redFlagReason}
                    </p>
                  </div>
                </div>
              </Bubble>
            )}

            {/* Headline */}
            <div className="bin" style={{ display:"flex", flexDirection:"row", alignItems:"flex-end",
              gap:8, marginBottom:10, animationDelay:".12s" }}>
              <Avatar/>
              <div style={{ flex:1,
                background:"linear-gradient(135deg,rgba(109,40,217,.22),rgba(219,39,119,.18))",
                border:"1.5px solid rgba(109,40,217,.42)",
                borderRadius:"22px 22px 22px 6px", padding:"18px 20px",
                boxShadow:"0 8px 32px rgba(109,40,217,.22)" }}>
                <div style={{ fontSize:10, fontWeight:800, color:"#a78bfa",
                  letterSpacing:2.5, marginBottom:10, textTransform:"uppercase" }}>
                  🔮 the decode
                </div>
                <p style={{ margin:"0 0 14px", fontSize:22, fontWeight:800, color:"#fff",
                  lineHeight:1.28, letterSpacing:-.4 }}>
                  {result.headline}
                </p>
                <div style={{ display:"flex", gap:10 }}>
                  {[
                    { l:"VIBE",  v:result.vibe,            c:"#a78bfa", bg:"rgba(109,40,217,.2)" },
                    { l:"SURE?", v:`${result.confidence}%`, c:"#f472b6", bg:"rgba(219,39,119,.2)" },
                  ].map(({l,v,c,bg}) => (
                    <div key={l} style={{ flex:1, background:bg, borderRadius:10, padding:"8px 10px", textAlign:"center" }}>
                      <div style={{ fontSize:9, fontWeight:800, color:c, letterSpacing:2, marginBottom:3 }}>{l}</div>
                      <div style={{ fontSize:14, fontWeight:800 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3 meanings */}
            {[
              { label:"most likely 👀",   i:0, c:"#c4b5fd", d:.24 },
              { label:"could also be 🤔", i:1, c:"#93c5fd", d:.38 },
              { label:"worst case 😬",    i:2, c:"#fca5a5", d:.52 },
            ].map(({ label,i,c,d }) => (
              <div key={label} className="bin" style={{ display:"flex", flexDirection:"row",
                alignItems:"flex-end", gap:8, marginBottom:8, animationDelay:`${d}s` }}>
                <div style={{ width:32, height:32, flexShrink:0 }}/>
                <div style={{ maxWidth:"88%",
                  background:"rgba(255,255,255,.055)", border:"1px solid rgba(255,255,255,.09)",
                  borderRadius:"18px 18px 18px 6px", padding:"13px 16px",
                  backdropFilter:"blur(10px)" }}>
                  <div style={{ fontSize:10, fontWeight:800, color:c,
                    letterSpacing:1.5, marginBottom:7, textTransform:"uppercase" }}>{label}</div>
                  <p style={{ margin:0, fontSize:14, fontWeight:400,
                    color:"rgba(255,255,255,.87)", lineHeight:1.72 }}>{result.meanings[i]}</p>
                </div>
              </div>
            ))}

            {/* Send / Don't */}
            <div className="bin" style={{ display:"flex", flexDirection:"row", alignItems:"flex-end",
              gap:8, marginBottom:10, animationDelay:".64s" }}>
              <div style={{ width:32, flexShrink:0 }}/>
              <div style={{ flex:1, background:"rgba(255,255,255,.04)",
                border:"1px solid rgba(255,255,255,.08)",
                borderRadius:"18px 18px 18px 6px", padding:"14px 16px" }}>
                {[
                  { h:"✅ send this", t:result.bestReply, a:"#4ade80", bg:"rgba(74,222,128,.08)",   b:"rgba(74,222,128,.2)"   },
                  { h:"❌ not this",  t:result.doNotSay,  a:"#f87171", bg:"rgba(248,113,113,.08)", b:"rgba(248,113,113,.2)" },
                ].map(({ h,t,a,bg,b }, idx) => (
                  <div key={h} style={{ marginBottom: idx===0 ? 12 : 0 }}>
                    <div style={{ fontSize:10, fontWeight:800, color:a,
                      letterSpacing:1.5, marginBottom:7, textTransform:"uppercase" }}>{h}</div>
                    <div style={{ background:bg, border:`1px solid ${b}`, borderRadius:12,
                      padding:"10px 14px", fontSize:14, fontWeight:500,
                      color:"rgba(255,255,255,.85)", lineHeight:1.6, fontStyle:"italic" }}>
                      &ldquo;{t}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reactions */}
            <div className="bin" style={{ marginBottom:16, animationDelay:".76s" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.25)",
                textAlign:"center", margin:"0 0 10px", letterSpacing:1.5 }}>HOW ACCURATE?</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {REACTIONS.map(r => {
                  const on = reaction === r.label;
                  return (
                    <button key={r.label} className="rbtn"
                      onClick={() => { setReaction(r.label); burst(r.emoji); }}
                      style={{ padding:"12px 10px", cursor:"pointer", fontFamily:"inherit",
                        background: on ? "rgba(109,40,217,.25)" : "rgba(255,255,255,.04)",
                        border: on ? "1.5px solid rgba(109,40,217,.6)" : "1.5px solid rgba(255,255,255,.07)",
                        borderRadius:14, display:"flex", alignItems:"center", gap:8,
                        boxShadow: on ? "0 0 18px rgba(109,40,217,.26)" : "none" }}>
                      <span style={{ fontSize:20 }}>{r.emoji}</span>
                      <span style={{ fontSize:12, fontWeight:600, textAlign:"left", lineHeight:1.3,
                        color: on ? "#c4b5fd" : "rgba(255,255,255,.5)" }}>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTAs */}
            <div className="bin" style={{ display:"flex", flexDirection:"column", gap:10, animationDelay:".86s" }}>
              <button className="bbtn" onClick={() => setShowShare(true)} style={{
                width:"100%", padding:"17px",
                background:GRAD, backgroundSize:"200% 200%",
                border:"none", borderRadius:18, color:"#fff",
                fontSize:16, fontWeight:800, cursor:"pointer",
                boxShadow:"0 8px 34px rgba(109,40,217,.42)",
                display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                animation:"gp 4s ease infinite",
              }}>
                <span style={{ fontSize:20 }}>📤</span> Share This Decode
              </button>
              <button className="bbtn" onClick={reset} style={{
                width:"100%", padding:"15px",
                background:"rgba(255,255,255,.05)",
                border:"1px solid rgba(255,255,255,.09)",
                borderRadius:18, color:"rgba(255,255,255,.5)",
                fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
              }}>
                Decode another →
              </button>
            </div>
          </div>
        )}

        {/* ── INPUT BAR ── */}
        {!loading && !result && (
          <div style={{ position:"sticky", bottom:20,
            background:"rgba(8,0,16,.88)", backdropFilter:"blur(22px)",
            border:"1px solid rgba(255,255,255,.09)", borderRadius:26,
            padding:"10px 10px 10px 16px", display:"flex", gap:10, alignItems:"flex-end",
            boxShadow:"0 10px 44px rgba(0,0,0,.55),0 0 0 1px rgba(109,40,217,.16)",
            marginTop:18 }}>
            <textarea ref={taRef} value={conversation}
              onChange={e => setConversation(e.target.value)}
              onKeyDown={e => { if (e.key==="Enter"&&(e.metaKey||e.ctrlKey)) analyze(); }}
              placeholder="paste the convo here..." rows={2}
              style={{ flex:1, background:"transparent", border:"none", color:"#fff",
                fontFamily:"inherit", fontSize:15, lineHeight:1.58, resize:"none",
                maxHeight:140, overflowY:"auto" }}/>
            <button className="bbtn" onClick={analyze}
              disabled={!conversation.trim()||remaining===0} aria-label="Decode"
              style={{ width:48, height:48, flexShrink:0, borderRadius:18, border:"none",
                background: conversation.trim()&&remaining>0 ? GRAD : "rgba(255,255,255,.07)",
                color:"#fff", fontSize:22,
                cursor: conversation.trim()&&remaining>0 ? "pointer" : "not-allowed",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow: conversation.trim()&&remaining>0 ? "0 4px 18px rgba(109,40,217,.52)" : "none" }}>
              {remaining===0 ? "🌙" : "🔮"}
            </button>
          </div>
        )}

        {/* ── HISTORY ── */}
        {history.length>0 && !result && !loading && (
          <div style={{ marginTop:28 }}>
            <button onClick={() => setShowHist(h => !h)} style={{
              width:"100%", padding:"13px 16px",
              background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)",
              borderRadius:16, color:"rgba(255,255,255,.35)",
              fontFamily:"inherit", fontSize:13, fontWeight:600, cursor:"pointer",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span>🕐 Decode history ({history.length})</span>
              <span style={{ fontSize:10 }}>{showHist ? "▲" : "▼"}</span>
            </button>
            {showHist && (
              <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:6 }}>
                {history.map((h,i) => (
                  <div key={i} className="sup" style={{ padding:"12px 16px",
                    background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)",
                    borderRadius:14, animationDelay:`${i*.05}s` }}>
                    <div style={{ fontSize:11, fontWeight:800, color:"#a78bfa", letterSpacing:1, marginBottom:3 }}>{h.vibe}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,.75)", marginBottom:3 }}>{h.headline}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,.25)" }}>{h.convo}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {showShare && result && (
        <ShareModal result={result} convo={conversation} onClose={() => setShowShare(false)}/>
      )}
    </>
  );
}
