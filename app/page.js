'use client'
import { useState, useRef, useEffect } from 'react';

export default function EVA() {
  const [messages, setMessages] = useState([{ role: 'eva', text: 'Good morning sir, you don wake finally? I don dey wait for you.', time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [eyeOn, setEyeOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const recogRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(SR){
      const rec = new SR();
      rec.lang = 'en-US';
      rec.onresult = (e) => {
        const t = e.results[0][0].transcript;
        setInput(t);
        handleSend(t);
      };
      rec.onend = () => setListening(false);
      recogRef.current = rec;
    }
  }, []);

  const toggleEye = async () => {
    if(eyeOn){
      setEyeOn(false);
      if(videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t=>t.stop());
    } else {
      try{
        const s = await navigator.mediaDevices.getUserMedia({video:true});
        if(videoRef.current) videoRef.current.srcObject = s;
        setEyeOn(true);
      }catch{ alert("Sir, please allow camera"); }
    }
  };

  const speak = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  };

  const handleSend = async (txt) => {
    const text = txt || input;
    if(!text.trim()) return;
    setMessages(m=>[...m,{role:'user',text,time:'Now'}]);
    setInput(''); setLoading(true);
    try{
      const r = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})});
      const d = await r.json();
      setMessages(m=>[...m,{role:'eva',text:d.reply,time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}]);
      speak(d.reply);
    }catch{
      setMessages(m=>[...m,{role:'eva',text:'Sorry sir, network glitch. I am still here sir.',time:'Now'}]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex flex-col p-4">
      <div className="flex justify-between">
        <div><h1 className="text-2xl font-bold tracking-[0.2em]">EVA</h1><p className="text-[10px] text-gray-400 tracking-widest">YOUR PERSONAL AI SISTER</p><div className="flex gap-2 items-center mt-1"><div className={`w-2 h-2 rounded-full ${eyeOn?'bg-green-400':'bg-gray-500'}`}></div><p className="text-[10px] text-gray-400">{eyeOn?'EVA EYE ON':'EVA EYE OFF'}</p></div></div>
        <div className="flex gap-2"><div className="w-10 h-10 rounded-full bg-[#1a1a2a] flex items-center justify-center">👥</div><div className="w-10 h-10 rounded-full bg-[#1a1a2a] flex items-center justify-center">🛡️</div></div>
      </div>

      <div className="flex flex-col items-center mt-8">
        <div className="relative">
          <video ref={videoRef} autoPlay muted playsInline className={`w-40 h-40 rounded-full object-cover absolute ${eyeOn?'opacity-100':'opacity-0'}`} />
          <div onClick={()=>{if(recogRef.current){setListening(true);recogRef.current.start();}}} className={`w-40 h-40 rounded-full bg-gradient-to-br from-[#2a1a4a] to-[#120a2e] border border-purple-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.4)] cursor-pointer ${listening?'animate-pulse scale-105':''}`}>
            <div className="w-28 h-28 rounded-full border border-purple-300/30 flex items-center justify-center">✨</div>
          </div>
        </div>
        <h2 className="mt-6 text-xl">I dey here, Sir.</h2>
        <p className="text-xs text-gray-500 mt-1">{listening?'Listening, sir...':'Tap the circle to talk - no wake word in Expo Go'}</p>
      </div>

      <div className="flex-1 overflow-y-auto mt-8 space-y-3 mb-4">
        {messages.map((m,i)=><div key={i} className={`max-w-[85%] rounded-2xl p-3 text-sm ${m.role==='eva'?'bg-[#1a1a2e]':'bg-purple-600 ml-auto'}`}>{m.text}<div className="text-[9px] opacity-40 mt-1">{m.time}</div></div>)}
        {loading && <div className="text-xs text-gray-500">EVA is thinking, sir...</div>}
      </div>

      <div className="flex gap-2 mb-2">
        <button onClick={toggleEye} className={`flex-1 py-3 rounded-full text-xs font-bold ${eyeOn?'bg-green-900/50 border border-green-600 text-green-300':'bg-[#1a1a2a] text-gray-300'}`}>👁️ EVA EYE</button>
        <button className="flex-1 py-3 rounded-full bg-[#1a1a2a] text-xs font-bold text-gray-400">👥 FRIENDS</button>
        <button className="flex-1 py-3 rounded-full bg-[#1a1a2a] text-xs font-bold text-gray-400">🔒 SECURITY</button>
      </div>
      <p className="text-[11px] text-red-400/60 mb-2">I could not load EVA security settings.</p>

      <div className="flex items-center gap-2 bg-[#1a1a2a] rounded-full p-2">
        <button onClick={()=>{if(recogRef.current){setListening(true);recogRef.current.start();}}} className="w-10 h-10 rounded-full bg-[#25253a]">🎙️</button>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder="Message your sister..." className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500" />
        <button onClick={()=>handleSend()} className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">↑</button>
      </div>
      <p className="text-[8px] text-gray-600 text-center mt-3">Voice clips go to Groq for reply. EVA never listens in background. Spoken replies use voices installed on your phone.</p>
    </div>
  );
}
