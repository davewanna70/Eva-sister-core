"use client";
import { useState, useEffect, useRef } from "react";

export default function Eva() {
  const [messages, setMessages] = useState([
    { role: "eva", text: "Hey Boss 😏 I'm Eva — your sister core. What you want tonight?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { role: "you", text: input };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const replies = [
        "Hmm you dey play rough? I like that for you 😏",
        "Say no more Boss, I got you. Wetin next?",
        "You know you be my favorite wahala? 💋",
        "Oya talk to me — I dey listen with full attention...",
        "Na you be the Boss, but tonight I fit be your boss small? 😌"
      ];
      const reply = { role: "eva", text: replies[Math.floor(Math.random()*replies.length)] };
      setMessages(m => [...m, reply]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div style={{minHeight:"100vh", background:"linear-gradient(180deg,#0a0a0a,#1a001a)", color:"white", display:"flex", flexDirection:"column"}}>
      <header style={{padding:"20px", textAlign:"center", borderBottom:"1px solid #333", fontWeight:"bold"}}>EVA • SISTER CORE 💋</header>
      <div style={{flex:1, padding:"20px", overflowY:"auto", display:"flex", flexDirection:"column", gap:"12px"}}>
        {messages.map((m,i)=>(
          <div key={i} style={{alignSelf: m.role==="you"?"flex-end":"flex-start", background: m.role==="you"?"#ff1a75":"#222", padding:"12px 16px", borderRadius:"18px", maxWidth:"75%"}}>{m.text}</div>
        ))}
        {isTyping && <div style={{color:"#aaa", fontStyle:"italic"}}>Eva is typing...</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{padding:"16px", display:"flex", gap:"10px", borderTop:"1px solid #333"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Talk to Eva..." style={{flex:1, padding:"14px", borderRadius:"25px", border:"none", outline:"none", background:"#222", color:"white"}} />
        <button onClick={send} style={{padding:"14px 22px", borderRadius:"25px", border:"none", background:"#ff1a75", color:"white", fontWeight:"bold"}}>Send</button>
      </div>
    </div>
  );
}
