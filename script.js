let POSTS=[],CATS=[];
const el=s=>document.querySelector(s);
const app=el("#app");
let cat="Alle";
let S={likes:{},cm:{},mine:0,game:{won:0,best:0}};
try{const r=localStorage.getItem("rejseblog");if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
function save(){try{localStorage.setItem("rejseblog",JSON.stringify(S))}catch(e){}}

function art(h,seed,v){
  let s=seed*7919+v*104729;
  const r=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
  const hu=130+(h%60);
  let o=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260"><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04080c"/><stop offset=".7" stop-color="hsl(${200+(h%30)},45%,16%)"/></linearGradient><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3e6" stop-opacity="0"/><stop offset="1" stop-color="#cfe3e6" stop-opacity=".4"/></linearGradient><filter id="b" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter></defs><rect width="400" height="260" fill="url(#a)"/>`;
  for(let i=0;i<34;i++)o+=`<circle cx="${r()*400}" cy="${r()*120}" r="${.4+r()*.9}" fill="#fff" opacity="${.3+r()*.6}"/>`;
  for(let i=0;i<2;i++){const y=40+r()*60;o+=`<path d="M-20 ${y+30} C 90 ${y-30} 200 ${y+50} 420 ${y-10}" stroke="hsl(${hu+i*25},80%,62%)" stroke-width="${16+r()*14}" fill="none" opacity=".45" filter="url(#b)"/>`}
  o+=`<rect y="165" width="400" height="95" fill="#05090c"/>`;
  let d="M0 175";for(let x=0;x<=400;x+=25)d+=` L${x} ${150+r()*30-(x>120&&x<280?r()*25:0)}`;o+=`<path d="${d} L400 175Z" fill="#070d11"/>`;
  const n=3+Math.floor(r()*3);
  for(let i=0;i<n;i++){const x=20+r()*340,w=30+r()*60,t=120+r()*40;o+=`<path d="M${x} 190 L${x+w*.3} ${t+20} L${x+w*.5} ${t} L${x+w*.8} ${t+25} L${x+w} 190Z" fill="hsl(195,28%,${62+r()*14}%)" opacity=".8"/><path d="M${x+w*.5} ${t} L${x+w*.8} ${t+25} L${x+w} 190 L${x+w*.55} 190Z" fill="#0b1a20" opacity=".35"/>`}
  o+=`<rect y="130" width="400" height="75" fill="url(#m)"/></svg>`;
  return "data:image/svg+xml;utf8,"+encodeURIComponent(o);
}
const fmt=d=>new Date(d).toLocaleDateString("da-DK",{day:"numeric",month:"long",year:"numeric"});
const likes=p=>p.l+(S.likes[p.id]?1:0);
const comments=p=>p.k+(S.cm[p.id]||[]).length;
const esc=t=>t.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function home(){
  const list=POSTS.filter(p=>cat==="Alle"||p.c===cat);
  app.innerHTML=`<div class="chips" role="group" aria-label="Filtrer efter kategori">${["Alle",...CATS].map(c=>`<button class="chip" aria-pressed="${c===cat}" data-c="${c}">${c} (${c==="Alle"?POSTS.length:POSTS.filter(p=>p.c===c).length})</button>`).join("")}</div>
  <div class="grid">${list.map(p=>`<div class="card"><img src="${art(p.h,p.id,0)}" alt="Illustration fra ${p.p}"><div class="b"><div class="meta"><span class="badge">${p.c}</span><time>${fmt(p.d)}</time></div><h2>${p.t}</h2><p>${p.s}</p><div class="meta">♥ ${likes(p)} &nbsp; ${comments(p)} kommentarer</div><a class="btn" href="#p${p.id}">Læs mere</a></div></div>`).join("")}</div>`;
  app.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{cat=b.dataset.c;home()});
}

function post(p){
  const cms=S.cm[p.id]||[];
  app.innerHTML=`<article><a class="btn ghost" href="#">← Alle indlæg</a>
  <div class="meta"><span class="badge">${p.c}</span><time>${fmt(p.d)}</time><span>${p.p}</span></div>
  <h1>${p.t}</h1>
  <img class="hero" src="${art(p.h,p.id,0)}" alt="Illustration fra ${p.p}">
  <div class="txt"><p><strong>${p.s}</strong></p>${p.x.map(t=>`<p>${t}</p>`).join("")}</div>
  <div class="gal">${[1,2,3,4].map(v=>`<button data-v="${v}" aria-label="Forstør billede ${v}"><img src="${art(p.h,p.id,v)}" alt="Galleri ${v} fra ${p.p}"></button>`).join("")}</div>
  <div class="act"><button class="like" id="like" aria-pressed="${!!S.likes[p.id]}"><span>♥</span> <span id="lc">${likes(p)}</span> likes</button><span id="cc">${comments(p)} kommentarer</span></div>
  <h2 class="sm">Skriv en kommentar</h2>
  <form id="f"><input id="n" placeholder="Dit navn" required maxlength="30"><textarea id="m" rows="3" placeholder="Din kommentar" required maxlength="300"></textarea><button class="btn" type="submit">Send</button></form>
  <div id="cl">${cms.map(c=>`<div class="cm"><b>${esc(c.n)}</b><br>${esc(c.m)}</div>`).join("")}</div></article>`;
  el("#like").onclick=e=>{S.likes[p.id]=!S.likes[p.id];save();e.currentTarget.setAttribute("aria-pressed",!!S.likes[p.id]);el("#lc").textContent=likes(p);stats()};
  el("#f").onsubmit=e=>{e.preventDefault();(S.cm[p.id]=S.cm[p.id]||[]).push({n:el("#n").value,m:el("#m").value});save();post(p);stats()};
  app.querySelectorAll(".gal button").forEach(b=>b.onclick=()=>{el("#big").src=art(p.h,p.id,+b.dataset.v);el("#dlg").showModal()});
}

function game(n=6){
  let first=null,lock=false,moves=0,found=0;
  app.innerHTML=`<a class="btn ghost" href="#">← Til bloggen</a><h1 class="gh">Rejse-memory</h1><p class="tag">Find de to billeder fra samme rejsemål. Hvert par åbner et indlæg fra bloggen.</p><div class="chips">${[[4,"Let"],[6,"Mellem"],[8,"Svær"]].map(([k,t])=>`<button class="chip" data-n="${k}" aria-pressed="${k===n}">${t}</button>`).join("")}</div><div class="meta"><b id="gm">0 træk</b></div><div class="mg" id="mg"></div><p id="found" aria-live="polite"></p>`;
  app.querySelectorAll(".chip").forEach(b=>b.onclick=()=>game(+b.dataset.n));
  const picks=POSTS.slice().sort(()=>Math.random()-.5).slice(0,n);
  const deck=[...picks,...picks].sort(()=>Math.random()-.5);
  const mg=el("#mg");
  deck.forEach(p=>{
    const b=document.createElement("button");
    b.className="mc";b.dataset.id=p.id;b.setAttribute("aria-label","Skjult kort");
    b.innerHTML=`<span class="in"><span class="f bk">✦</span><span class="f fr"><img src="${art(p.h,p.id,0)}" alt=""><em>${p.p.split(",")[0]}</em></span></span>`;
    b.onclick=()=>{
      if(lock||b.classList.contains("open")||b.classList.contains("done"))return;
      b.classList.add("open");b.setAttribute("aria-label",p.p);
      if(!first){first=b;return}
      moves++;el("#gm").textContent=moves+" træk";
      const a=first;first=null;
      if(a.dataset.id===b.dataset.id){
        [a,b].forEach(c=>{c.classList.remove("open");c.classList.add("done")});found++;
        el("#found").innerHTML=`Fundet: ${p.p}. <a href="#p${p.id}">Læs indlægget: ${p.t}</a>`;
        if(found===n){
          S.game.won++;
          if(!S.game.best||moves<S.game.best)S.game.best=moves;
          save();stats();
          el("#found").innerHTML=`<strong>Alle par fundet på ${moves} træk!</strong> Din rekord er ${S.game.best} træk. <a href="#spil" id="again">Spil igen</a>`;
          el("#again").onclick=e=>{e.preventDefault();game(n)};
        }
      }else{
        lock=true;
        setTimeout(()=>{[a,b].forEach(c=>{c.classList.remove("open");c.setAttribute("aria-label","Skjult kort")});lock=false},900);
      }
    };
    mg.appendChild(b);
  });
}

function stats(){
  const L=POSTS.reduce((a,p)=>a+likes(p),0), C=POSTS.reduce((a,p)=>a+comments(p),0);
  const lat=Math.max(...POSTS.map(p=>p.lat));
  const n=27+(S.mine?1:0), avg=((116+S.mine)/n).toFixed(1);
  el("#stats").innerHTML=`<div><b>${POSTS.length}</b><span>blogindlæg</span></div><div><b>${lat}°N</b><span>nordligste punkt</span></div><div><b>${L}</b><span>likes</span></div><div><b>${C}</b><span>kommentarer</span></div><div><b>${S.game.won}</b><span>memory-spil vundet${S.game.best?` (rekord ${S.game.best} træk)`:""}</span></div>
  <div><b>${avg} / 5</b><span>hvor brugbar er siden? (${n} stemmer)</span><div class="stars" role="group" aria-label="Giv din bedømmelse">${[1,2,3,4,5].map(i=>`<button data-i="${i}" aria-label="${i} stjerner">${i<=S.mine?"★":"☆"}</button>`).join("")}</div></div>`;
  document.querySelectorAll(".stars button").forEach(b=>b.onclick=()=>{S.mine=+b.dataset.i;save();stats()});
}

function route(){
  const m=location.hash.match(/^#p(\d+)$/), p=m&&POSTS.find(x=>x.id===+m[1]);
  p?post(p):location.hash==="#spil"?game():home();
  document.title=p?p.t+" – Sila":"Sila – rejseblog";
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);
el("#dlg").onclick=()=>el("#dlg").close();
fetch("posts.json").then(r=>r.json()).then(d=>{
  POSTS=d;CATS=[...new Set(POSTS.map(p=>p.c))].sort();
  stats();route();
}).catch(()=>{app.innerHTML="<p>Kunne ikke hente posts.json. Åbn siden via en lokal server (fx Live Server i VS Code) eller GitHub Pages.</p>"});
