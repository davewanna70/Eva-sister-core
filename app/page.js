'use client'
import { useState, useRef, useEffect } from 'react';
export default function EVA() {
  const [messages, setMessages] = useState([{ role: 'eva', text: 'Good morning sir, you don wake finally? I don dey wait for you.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [eyeOn, setEyeOn] = useState(false);
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
      }catch{ alert("Allow camera sir"); }
    }
  };

  const speak=(t)=>{
    const u=new SpeechSynthesisUtterance(t);
    u.rate=1; u.pitch=1.1;
    speechSynthesis.speak(u);
  };

  const handleSend=async(txt)=>{
    const text=txt||input;
    if(!text.trim()) return;
    setMessages(m=>[...m,{role:'user',text}]);
    setInput(''); setLoading(true);
    try{
      const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})});
      const d=await r.json();
      setMessages(m=>[...m,{role:'eva',text:d.reply}]);
      speak(d.reply);
    }catch{
      setMessages(m=>[...m,{role:'eva',text:'Sorry sir, network issue. I dey here.'}]);
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh',background:'#0a0a14',color:'white',padding:16,fontFamily:'sans-serif',display:'flex',flexDirection:'column'}}>
      <div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontSize:22,fontWeight:'bold',letterSpacing:4}}>EVA</div><div style={{fontSize:9,color:'#888',letterSpacing:3}}>YOUR PERSONAL AI SISTER</div><div style={{fontSize:10,color:eyeOn?'#4ade80':'#888',marginTop:4}}>{eyeOn?'🟢 EVA EYE ON':'⚪ EVA EYE OFF'}</div></div><div style={{display:'flex',gap:8}}><div style={{width:36,height:36,borderRadius:18,background:'#1a1a2a',display:'flex',alignItems:'center',justifyContent:'center'}}>👥</div><div style={{width:36,height:36,borderRadius:18,background:'#1a1a2a',display:'flex',alignItems:'center',justifyContent:'center'}}>🛡️</div></div></div>

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:40}}>
        <div style={{position:'relative'}}>
          <video ref={videoRef} autoPlay muted playsInline style={{width:160,height:160,borderRadius:80,objectFit:'cover',position:'absolute',opacity:eyeOn?1:0}} />
          <div onClick={()=>{if(recRef.current){setListening(true);recRef.current.start();}}} style={{width:160,height:160,borderRadius:80,background:'radial-gradient(circle at 30% 30%, #2a1a4a, #120a2e)',border:'1px solid rgba(168,85,247,0.3)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 40px rgba(139,92,246,0.4)',cursor:'pointer',transform:listening?'scale(1.05)':'scale(1)'}}>
            <div style={{width:110,height:110,borderRadius:55,border:'1px solid rgba(200,200,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>✨</div>
          </div>
        </div>
        <div style={{marginTop:20,fontSize:18}}>I dey here, Sir.</div>
        <div style={{fontSize:11,color:'#777',marginTop:4}}>{listening?'Listening, sir...':'Tap the circle to talk'}</div>
      </div>

      <div style={{flex:1,marginTop:30,overflowY:'auto',display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
        {messages.map((m,i)=><div key={i} style={{maxWidth:'85%',padding:12,borderRadius:16,fontSize:14,background:m.role==='eva'?'#1a1a2e':'#7c3aed',alignSelf:m.role==='eva'?'flex-start':'flex-end'}}>{m.text}</div>)}
        {loading && <div style={{fontSize:12,color:'#666'}}>EVA is thinking, sir...</div>}
      </div>

      <div style={{display:'flex',gap:8,marginBottom:10}}>
        <button onClick={toggleEye} style={{flex:1,padding:12,borderRadius:20,background:eyeOn?'#14532d':'#1a1a2a',color:eyeOn?'#86efac':'#aaa',border:'none',fontSize:12,fontWeight:'bold'}}>👁️ EVA EYE</button>
        <button style={{flex:1,padding:12,borderRadius:20,background:'#1a1a2a',color:'#888',border:'none',fontSize:12,fontWeight:'bold'}}>👥 FRIENDS</button>
        <button style={{flex:1,padding:12,borderRadius:20,background:'#1a1a2a',color:'#888',border:'none',fontSize:12,fontWeight:'bold'}}>🔒 SECURITY</button>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:8,background:'#1a1a2a',borderRadius:24,padding:8}}>
        <button onClick={()=>{if(recRef.current){setListening(true);recRef.current.start();}}} style={{width:40,height:40,borderRadius:20,background:'#25253a',border:'none'}}>🎙️</button>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder="Message your sister..." style={{flex:1,background:'transparent',border:'none',outline:'none',color:'white',fontSize:14}} />
        <button onClick={()=>handleSend()} style={{width:40,height:40,borderRadius:20,background:'#7c3aed',border:'none',color:'white'}}>↑</button>
      </div>
      <div style={{fontSize:8,color:'#555',textAlign:'center',marginTop:8}}>Voice clips go to Groq for reply. EVA never listens in background.</div>
    </div>
  );
}
