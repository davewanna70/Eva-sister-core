"use client";
import { useState, useRef, useEffect } from "react";

export default function Eva() {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("EVA online. Say 'Hello Eva'");
  const [eyeOn, setEyeOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const speak = (t: string) => {
    const u = new SpeechSynthesisUtterance(t);
    u.rate = 1; u.pitch = 1.1; u.volume = 1;
    const voices = speechSynthesis.getVoices();
    const female = voices.find(v => v.name.includes("Google UK English Female") || v.name.includes("Samantha") || v.name.includes("Female"));
    if(female) u.voice = female;
    speechSynthesis.speak(u);
    setText(t);
  };

  const handleCommand = (cmd: string) => {
    const c = cmd.toLowerCase();
    if(c.includes("hello")) speak("Hello Boss Dave. Eva sister core online. Your personal J.A.R.V.I.S is ready.");
    else if(c.includes("eye") || c.includes("see") || c.includes("camera")) { setEyeOn(true); speak("Activating EVA EYE. I can see you now boss."); startCamera(); }
    else if(c.includes("who are you")) speak("I am Eva, your sister core. Built by Davewanna70. I am your J.A.R.V.I.S, with sight and voice.");
    else if(c.includes("time")) speak(`It is ${new Date().toLocaleTimeString()} boss.`);
    else speak(`You said ${cmd}. I'm learning boss. Give me more commands.`);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if(!SpeechRecognition){ alert("Use Chrome browser please boss"); return; }
    const rec = new SpeechRecognition();
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e:any) => handleCommand(e.results[0][0].transcript);
    rec.start();
  };

  const startCamera = async () => {
    try{
      const stream = await navigator.mediaDevices.getUserMedia({video:true});
      if(videoRef.current) videoRef.current.srcObject = stream;
      setEyeOn(true);
    }catch(e){ speak("Camera permission needed boss."); }
  };

  useEffect(()=>{ speechSynthesis.getVoices(); },[]);

  return (
    <div style={{background:"black", color:"cyan", minHeight:"100vh", padding:"20px", textAlign:"center", fontFamily:"monospace"}}>
      <h1 style={{fontSize:"40px", textShadow:"0 0 20px cyan"}}>E V A - SISTER CORE</h1>
      <p style={{border:"1px solid cyan", padding:"15px", minHeight:"60px", margin:"20px 0", boxShadow:"0 0 10px cyan"}}>{text}</p>
      
      <div style={{display:"flex", gap:"10px", justifyContent:"center", flexWrap:"wrap"}}>
        <button onClick={startListening} style={{background: listening?"red":"cyan", color:"black", padding:"15px 30px", border:"none", borderRadius:"30px", fontWeight:"bold", fontSize:"18px"}}>
          {listening?"🎙️ LISTENING...":"🎤 TALK TO EVA"}
        </button>
        <button onClick={startCamera} style={{background:"black", color:"cyan", border:"1px solid cyan", padding:"15px 30px", borderRadius:"30px", fontWeight:"bold"}}>
          👁️ EVA EYE
        </button>
      </div>

      <div style={{marginTop:"30px"}}>
        <video ref={videoRef} autoPlay playsInline muted style={{width:"90%", maxWidth:"400px", border: eyeOn?"2px solid cyan":"none", borderRadius:"20px", boxShadow: eyeOn?"0 0 30px cyan":"none"}} />
        {eyeOn && <p style={{color:"#0ff"}}>EYE ACTIVE — I SEE YOU BOSS</p>}
      </div>

      <p style={{marginTop:"40px", opacity:0.5}}>Built by Davewanna70 | J.A.R.V.I.S Personality v1.0</p>
    </div>
  )
    }
