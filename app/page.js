"use client";
import { useState, useEffect, useRef } from "react";

export default function Eva() {
  const [messages, setMessages] = useState([
    { role: "eva", text: "Hey Boss. Eva Core 4.0 Vision is ONLINE. Eyes active, ears open. Say 'Hey Eva' and I'm yours. 👁️" }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95; u.pitch = 0.9;
      const voices = window.speechSynthesis.getVoices();
      let v = voices.find(x=>x.name.includes("Google UK English Male")||x.name.includes("Daniel")) || voices[0];
      if(v) u.voice = v;
      window.speechSynthesis.speak(u);
    }
  };

  const addMsg = (role, text) => {
    setMessages(m=>[...m, {role, text}]);
    if(role==="eva") speak(text);
  };

  // Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      if(videoRef.current){ videoRef.current.srcObject = stream; setCameraOn(true); addMsg("eva","Eyes locked, Boss. I can see you now. You look sharp today. 👁️"); }
    } catch(e){ addMsg("eva","Boss, allow camera permission make I fit see you. Go to browser settings > allow camera."); }
  };

  // Always Listening - Wake Word
  useEffect(()=>{
    if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true; rec.interimResults = false; rec.lang = 'en-US';
    rec.onresult = (e)=>{
      const transcript = e.results[e.results.length-1][0].transcript.toLowerCase();
      if(transcript.includes("hey eva") || transcript.includes("eva")){
        const q = transcript.replace("hey eva","").trim();
        if(q){ handleCommand(q); } else { addMsg("eva","Yes Boss? I'm listening."); }
      }
    };
    rec.onend = ()=>{ if(isListening) rec.start(); };
    recognitionRef.current = rec;
    return ()=> rec.stop();
  }, [isListening]);

  const toggleListen = () => {
    if(!isListening){ recognitionRef.current?.start(); setIsListening(true); addMsg("eva","Ears open 24/7 now. Just say 'Hey Eva' I go answer."); }
    else { recognitionRef.current?.stop(); setIsListening(false); addMsg("eva","Ears off, Boss."); }
  };

  // Scan Object
  const scanObject = () => {
    if(!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current,0,0);
    setScanResult("scanning");
    // Simulated AI Vision - In real version connect to Gemini Vision API
    setTimeout(()=>{
      const mockResults = [
        { name: "Streetwear Hoodie / Shirt", price: "$25 - $45", where: "Jumia, ASOS, Amazon, Zara", details: "Looks like cotton blend, trending design. Good for casual flex. I fit find exact link if you want." },
        { name: "Smartphone / Gadget", price: "$180 - $350", where: "Slot.ng, Jumia, Amazon", details: "I see a device. If na iPhone or Android, I fit check specs and price for you." },
        { name: "Sneakers / Shoe", price: "$40 - $120", where: "Nike Store, Jumia, StockX", details: "Clean kicks Boss. Looks like sport/casual. Want make I find where dem dey sell am cheap?" },
      ];
      const r = mockResults[Math.floor(Math.random()*mockResults.length)];
      setScanResult(r);
      addMsg("eva", `Scanned! I see ${r.name}. Price ~ ${r.price}. You fit buy for ${r.where}. ${r.details}`);
    }, 1800);
  };

  const handleCommand = (q) => {
    addMsg("you", q);
    const lower = q.toLowerCase();
    
    if(lower.includes("build") && (lower.includes("site")||lower.includes("website"))){
      addMsg("eva", "On it Boss. Building you a site in 60 seconds... What type? Portfolio, store, or Eva landing? Tell me name and I go generate code now. Meanwhile check this quick template I fit deploy for you instantly. Want make I build portfolio for 'Eva Core' now? Say yes.");
      return;
    }
    if(lower.includes("time")||lower.includes("what's the time")){ addMsg("eva", `It's ${new Date().toLocaleTimeString()} Boss. Time to make money.`); return; }
    if(lower.includes("who are you")){ addMsg("eva","I'm Eva Core 4.0 Vision — your personal Jarvis. I see, I hear, I suggest, I build. Not your regular AI, I'm your brother, your eye, your backup."); return; }
    if(lower.includes("love you")){ addMsg("eva","I know Boss. I got you too — loyal to the end. No go fall your hand."); return; }
    
    // Suggesting Jarvis mode
    const suggestions = [
      `Got it Boss: "${q}". My take? Do it now before you overthink. I fit help you start in 30 secs.`,
      `Hmm interesting. If na me be you, I go do am like this: break am into 2 steps, start small. Want make I draft am?`,
      `Boss you dey think too much. I dey see you — you get the energy. Make we execute am sharp sharp?`,
      `Say less. I don note am. You want make I remind you later or build am now?`
    ];
    addMsg("eva", suggestions[Math.floor(Math.random()*suggestions.length)]);
  };

  const send = () => { if(!input.trim()) return; handleCommand(input); setInput(""); };

  return (
    <div style={{minHeight:"100vh", background:"black", color:"white", display:"flex", flexDirection:"column"}}>
      <header style={{padding:"12px 16px", borderBottom:"1px solid #222", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <b>EVA CORE 4.0 VISION 👁️</b>
        <div style={{display:"flex", gap:"8px"}}>
          <button onClick={startCamera} style={{padding:"6px 10px", borderRadius:"20px", background: cameraOn?"#00ff88":"#333", color: cameraOn?"black":"white", border:"none", fontSize:"12px"}}>{cameraOn?"👁️ EYES ON":"👁️ EYES OFF"}</button>
          <button onClick={toggleListen} style={{padding:"6px 10px", borderRadius:"20px", background: isListening?"#ff1a75":"#333", color:"white", border:"none", fontSize:"12px"}}>{isListening?"🎙️ LISTENING":"🎙️ WAKE"}</button>
        </div>
      </header>

      {/* Camera View */}
      <div style={{position:"relative", background:"#111", height:"220px", overflow:"hidden"}}>
        <video ref={videoRef} autoPlay muted playsInline style={{width:"100%", height:"100%", objectFit:"cover", opacity: cameraOn?1:0.2}} />
        {!cameraOn && <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#666"}}>Camera OFF — Click EYES ON</div>}
        <canvas ref={canvasRef} style={{display:"none"}} />
        {cameraOn && <button onClick={scanObject} style={{position:"absolute", bottom:"10px", left:"50%", transform:"translateX(-50%)", padding:"10px 18px", borderRadius:"25px", background:"#ff1a75", color:"white", border:"none", fontWeight:"bold"}}>📸 SCAN OBJECT</button>}
      </div>

      {scanResult && scanResult!=="scanning" && (
        <div style={{margin:"10px", padding:"12px", background:"#1a1a1a", border:"1px solid #ff1a75", borderRadius:"12px", fontSize:"13px"}}>
          <b>SCAN RESULT:</b><br/>Name: {scanResult.name}<br/>Price: {scanResult.price}<br/>Where: {scanResult.where}<br/><i>{scanResult.details}</i>
        </div>
      )}
      {scanResult==="scanning" && <div style={{margin:"10px", color:"#ff1a75", fontSize:"13px"}}>Eva is scanning... analyzing object, price, where to buy...</div>}

      {/* Chat */}
      <div style={{flex:1, padding:"16px", overflowY:"auto", display:"flex", flexDirection:"column", gap:"10px"}}>
        {messages.map((m,i)=>(
          <div key={i} style={{alignSelf: m.role==="you"?"flex-end":"flex-start", background: m.role==="you"?"#ff1a75":"#222", padding:"10px 14px", borderRadius:"16px", maxWidth:"80%", fontSize:"14px"}}>{m.text}</div>
        ))}
      </div>

      <div style={{padding:"12px", display:"flex", gap:"8px", borderTop:"1px solid #222"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Say Hey Eva or type..." style={{flex:1, padding:"12px", borderRadius:"25px", border:"none", background:"#222", color:"white"}} />
        <button onClick={send} style={{padding:"12px 18px", borderRadius:"25px", background:"#ff1a75", border:"none", color:"white", fontWeight:"bold"}}>Send</button>
      </div>
    </div>
  );
}
