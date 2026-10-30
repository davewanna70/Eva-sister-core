'use client'
import { useState, useRef, useEffect } from 'react';

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Good morning, Boss. I'm here. What do you need?";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon, Boss. I'm here. How can I help?";
  } else if (hour >= 17 && hour < 22) {
    return "Good evening, Boss. I'm here. Need anything?";
  } else {
    return "You're up late, Boss. I'm here if you need me.";
  }
}

export default function EVA() {
  const [messages, setMessages] = useState([{ role: 'eva', text: getTimeGreeting() }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [eyeOn, setEyeOn] = useState(false);
  const [voiceType, setVoiceType] = useState('female');
  const videoRef = useRef(null);
  const recRef = useRef(null);

  useEffect(()=>{
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(SR){
      const r = new SR();
      r.lang='en-US';
      r.onresult=e=>{ setInput(e.results[0][0].transcript); handleSend(e.results[0][0].transcript); };
      r.onend=()=>setListening(false);
      recRef.current=r;
    }
  },[]);

  const toggleEye=async()=>{
    if(eyeOn){
      setEyeOn(false);
      videoRef.current?.srcObject?.getTracks().forEach(t=>t.stop());
    } else {
      try{
        const s=await navigator.mediaDevices.getUserMedia({video:true});
        videoRef.current.srcObject=s;
        setEyeOn(true);
      }catch{ alert("Allow camera access"); }
    }
  };

  const speak=async(t)=>{
    window.speechSynthesis.cancel();
    try{
      const res = await fetch('/api/voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ text: t, selectedVoice: voiceType })});
      if(res.ok){ const blob = await res.blob(); const audio = new Audio(URL.createObjectURL(blob)); audio.play(); return; }
    }catch(e){}
    const u=new SpeechSynthesisUtterance(t); u.pitch=voiceType==='male'?0.8:1.2; speechSynthesis.speak(u);
  };

  const handleSend=async(txt)=>{
    const text=txt||input;
    if(!text.trim()) return;
    setMessages(m=>[...m,{role:'user',text}]); setInput(''); setLoading(true);
    try{
      const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})});
      const d=await r.json();
      const reply = d.reply || "Sorry Boss, I didn't catch that.";
      setMessages(m=>[...m,{role:'eva',text:reply}]); speak(reply);
    }catch{ setMessages(m=>[...m,{role:'eva',text:'Sorry Boss, network issue. I am here.'}]); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh',background:'#0a0a14',color:'white',padding:16,fontFamily:'sans-serif',display:'flex',flexDirection:'column'}}>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:22,fontWeight:'bold',letterSpacing:4}}>EVA</div>
          <div style={{fontSize:9,color:'#666',letterSpacing:3,marginTop:2}}>YOUR PERSONAL AI</div>
          <div style={{fontSize:10,color:eyeOn?'#4ade80':'#666',marginTop:6}}>{eyeOn?'🟢 EVA EYE ON':'⚪ EVA EYE OFF'}</div>
          <div style={{display:'flex',gap:6,marginTop:10}}>
            <button onClick={()=>setVoiceType('female')} style={{padding:'5px 12px',borderRadius:20,background:voiceType==='female'?'#ff4d8d':'#222',color:'white',border:'none',fontSize:10,fontWeight:'bold'}}>FEMALE</button>
            <button onClick={()=>setVoiceType('male')} style={{padding:'5px 12px',borderRadius:20,background:voiceType==='male'?'#4d8dff':'#222',color:'white',border:'none',fontSize:10,fontWeight:'bold'}}>MALE</button>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}><div style={{width:36,height:36,borderRadius:18,background:'#1a1a2a',display:'flex',alignItems:'center',justifyContent:'center'}}>👥</div><div style={{width:36,height:36,borderRadius:18,background:'#1a1a2a',display:'flex',alignItems:'center',justifyContent:'center'}}>🛡️</div></div>
      </div>

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:30}}>
        <div style={{position:'relative'}}>
          <video ref={videoRef} autoPlay muted playsInline style={{width:160,height:160,borderRadius:80,objectFit:'cover',position:'absolute',opacity:eyeOn?1:0}} />
          <div onClick={()=>{if(recRef.current){setListening(true);recRef.current.start();}}} style={{width:160,height:160,borderRadius:80,background:'radial-gradient(circle at 30% 30%, #2a1a4a, #120a2e)',border:'1px solid rgba(168,85,247,0.3)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 40px rgba(139,92,246,0.4)',cursor:'pointer'}}>
            <div style={{width:110,height:110,borderRadius:55,border:'1px solid rgba(200,200,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>✨</div>
          </div>
        </div>
        <div style={{marginTop:20,fontSize:18}}>I'm here, Boss.</div>
        <div style={{fontSize:11,color:'#777',marginTop:4}}>{listening?'Listening...':'Tap the circle to talk'}</div>
      </div>

      <div style={{flex:1,marginTop:24,overflowY:'auto',display:'flex',flexDirection:'column',gap:10,marginBottom:20,maxHeight:'35vh'}}>
        {messages.map((m,i)=><div key={i} style={{maxWidth:'85%',padding:12,borderRadius:16,fontSize:14,background:m.role==='eva'?'#1a1a2e':'#7c3aed',alignSelf:m.role==='eva'?'flex-start':'flex-end'}}>{m.text}</div>)}
        {loading && (
          <div style={{display:'flex',gap:5,padding:'14px 18px',background:'#1a1a2e',borderRadius:18,width:'fit-content'}}>
            <span style={{width:8,height:8,background:'#7c3aed',borderRadius:50,display:'inline-block',animation:'evaBounce 1.4s infinite',animationDelay:'0s'}}></span>
            <span style={{width:8,height:8,background:'#7c3aed',borderRadius:50,display:'inline-block',animation:'evaBounce 1.4s infinite',animationDelay:'0.2s'}}></span>
            <span style={{width:8,height:8,background:'#7c3aed',borderRadius:50,display:'inline-block',animation:'evaBounce 1.4s infinite',animationDelay:'0.4s'}}></span>
            <style>{`@keyframes evaBounce {0%,80%,100%{transform:scale(0.6);opacity:0.5}40%{transform:scale(1);opacity:1}}`}</style>
          </div>
        )}
      </div>

      <div style={{display:'flex',gap:8,marginBottom:10}}>
        <button onClick={toggleEye} style={{flex:1,padding:12,borderRadius:20,background:eyeOn?'#14532d':'#1a1a2a',color:eyeOn?'#86efac':'#aaa',border:'none',fontSize:12,fontWeight:'bold'}}>👁️ EVA EYE</button>
        <button style={{flex:1,padding:12,borderRadius:20,background:'#1a1a2a',color:'#888',border:'none',fontSize:12,fontWeight:'bold'}}>👥 FRIENDS</button>
        <button style={{flex:1,padding:12,borderRadius:20,background:'#1a1a2a',color:'#888',border:'none',fontSize:12,fontWeight:'bold'}}>🔒 SECURITY</button>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:8,background:'#1a1a2a',borderRadius:24,padding:8}}>
        <button onClick={()=>{if(recRef.current){setListening(true);recRef.current.start();}}} style={{width:40,height:40,borderRadius:20,background:'#25253a',border:'none'}}>🎙️</button>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder="Message Eva..." style={{flex:1,background:'transparent',border:'none',outline:'none',color:'white',fontSize:14}} />
        <button onClick={()=>handleSend()} style={{width:40,height:40,borderRadius:20,background:'#7c3aed',border:'none',color:'white'}}>↑</button>
      </div>
    </div>
  );
}
