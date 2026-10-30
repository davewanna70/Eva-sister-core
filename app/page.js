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
      const res = await fetch('/api/voice',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ text: t, selectedVoice: voiceType })
      });
      if(res.ok){ const blob = await res.blob(); const audio = new Audio(URL.createObjectURL(blob)); audio.play(); return; }
    }catch(e){}
    const u=new SpeechSynthesisUtterance(t); u.pitch=voiceType
