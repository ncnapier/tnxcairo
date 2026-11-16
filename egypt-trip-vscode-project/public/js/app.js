(() => {
  const cfg = window.TRIP_CONFIG;
  const $ = id => document.getElementById(id);
  const fmt = (d, zone, opts) => new Intl.DateTimeFormat("en-US",{timeZone:zone,...opts}).format(d);
  const dateTime = d => {
    if(!d) return "TIME TBD";
    const x=new Date(d);
    return fmt(x,"UTC",{hour:"numeric",minute:"2-digit",timeZone:"UTC"}).toUpperCase();
  };
  const flights=cfg.flights;
  let currentFlight=null, liveTimer=null, photos=[];

  function phase(){
    const now=Date.now();
    // Prefer the flight whose scheduled window currently contains the clock.
    for(let i=0;i<flights.length;i++){
      const f=flights[i]; if(!f.departure) continue;
      const dep=Date.parse(f.departure), arr=f.arrival?Date.parse(f.arrival):dep+8*3600000;
      if(now>=dep && now<=arr) return {type:"airborne",flight:f,index:i};
    }
    for(let i=0;i<flights.length;i++){
      const f=flights[i]; if(!f.departure) continue;
      if(now<Date.parse(f.departure)) return {type:"waiting",flight:f,index:i};
    }
    return {type:"location",flight:null,index:-1};
  }
  function countdown(target){
    if(!target){$("countdown").classList.add("hidden");return}
    $("countdown").classList.remove("hidden");
    const diff=Math.max(0,Date.parse(target)-Date.now());
    const vals=[Math.floor(diff/86400000),Math.floor(diff/3600000)%24,Math.floor(diff/60000)%60,Math.floor(diff/1000)%60];
    ["days","hours","minutes","seconds"].forEach((id,i)=>$(id).textContent=String(vals[i]).padStart(2,"0"));
  }
  function showFlight(f,type){
    $("flightSectionTitle").textContent=type==="airborne"?"FLIGHT IN PROGRESS":"NEXT FLIGHT";
    $("flightStatus").textContent=type==="airborne"?"AIRBORNE · TRACKING":"SCHEDULED";
    $("originCode").textContent=f.from; $("originName").textContent=f.fromName;
    $("destCode").textContent=f.to; $("destName").textContent=f.toName;
    $("originTime").textContent=dateTime(f.departure)+" · "+new Date(f.departure).toLocaleDateString("en-US",{month:"short",day:"numeric",timeZone:"UTC"}).toUpperCase();
    $("destTime").textContent=f.arrival?new Date(f.arrival).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZone:"UTC"})+" UTC":"ARRIVAL TBD";
    $("flightNumber").textContent=f.number; $("flightDetail").textContent=f.label;
    $("routeDuration").textContent=type==="airborne"?"LIVE ROUTE":"TICKET SCHEDULE";
    $("flightDataSource").textContent="SCHEDULE · LIVE DATA WHEN AVAILABLE";
    let progress=0;
    if(type==="airborne"&&f.arrival) progress=Math.min(99,Math.max(1,(Date.now()-Date.parse(f.departure))/(Date.parse(f.arrival)-Date.parse(f.departure))*100));
    $("trackProgress").style.width=progress+"%"; $("plane").style.left=progress+"%";
  }
  function update(){
    const p=phase(),now=new Date();
    $("whereDate").textContent=fmt(now,"UTC",{month:"short",day:"numeric",year:"numeric"}).toUpperCase();
    if(p.type==="waiting"){
      currentFlight=p.flight; $("heroEyebrow").textContent="NEXT DEPARTURE · "+p.flight.number;
      $("heroTitle").innerHTML="EGYPT<span>.</span>"; $("heroCaption").textContent="UNTIL TAKEOFF";
      $("topState").textContent="PREPARING FOR DEPARTURE"; countdown(p.flight.departure); showFlight(p.flight,"waiting");
      $("whereCity").textContent="Nashville";$("whereSub").textContent="TENNESSEE, USA";$("locationNote").textContent="The countdown is on. Next stop: Cairo.";
    } else if(p.type==="airborne"){
      currentFlight=p.flight; $("heroEyebrow").textContent="CURRENTLY IN THE AIR · "+p.flight.number;
      $("heroTitle").innerHTML="EN ROUTE<span>.</span>";$("heroCaption").textContent="TIME UNTIL SCHEDULED ARRIVAL";
      $("topState").textContent="FLIGHT IN PROGRESS";countdown(p.flight.arrival);showFlight(p.flight,"airborne");
      $("whereCity").textContent="In the air";$("whereSub").textContent=p.flight.from+" → "+p.flight.to;$("locationNote").textContent="Flight progress is shown below. Live position appears when the flight data provider supplies it.";
    } else {
      $("heroEyebrow").textContent="THE JOURNEY CONTINUES";$("heroTitle").innerHTML="EGYPT<span>.</span>";
      $("heroCaption").textContent="NO FLIGHT SCHEDULED RIGHT NOW";$("countdown").classList.add("hidden");
      $("topState").textContent="ON THE GROUND";$("flightSectionTitle").textContent="FLIGHT STATUS";
      const next=flights.find(f=>f.departure&&Date.parse(f.departure)>Date.now());
      if(next) showFlight(next,"waiting");
      const loc=cfg.locations.find(l=>Date.now()>=Date.parse(l.start)&&Date.now()<Date.parse(l.end));
      if(loc){$("whereCity").textContent=loc.city;$("whereSub").textContent=loc.sub;$("locationNote").textContent=loc.note}
      else {$("whereCity").textContent="Cairo";$("whereSub").textContent="EGYPT";$("locationNote").textContent="Enjoying Egypt."}
    }
  }
  async function loadJournal(){
    try{
      const r=await fetch("/api/journal"); if(!r.ok) throw Error();
      const entries=await r.json(); $("journalCount").textContent=entries.length+" ENTR"+(entries.length===1?"Y":"IES");
      $("journalList").innerHTML=entries.length?entries.map(e=>`<article class="entry"><div class="entry-top"><span>${escapeHtml(e.entry_date)}</span><span>TD × NN</span></div><h3>${escapeHtml(e.title)}</h3><p>${escapeHtml(e.body||"")}</p>${(e.photos||[]).length?`<div class="photos">${e.photos.map(p=>`<img loading="lazy" src="${safeUrl(p)}" alt="Trip photo">`).join("")}</div>`:""}</article>`).join(""):'<div class="empty-state">The first story is still waiting to be written.</div>';
    }catch{ $("journalList").innerHTML='<div class="empty-state">The journal will appear here once the site is connected to its database.</div>'}
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function safeUrl(s){return /^\/api\/photo\/[a-zA-Z0-9._-]+$/.test(s)?s:"#"}
  $("ownerButton").onclick=()=> $("ownerDialog").showModal();
  document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>b.closest("dialog").close());
  $("loginForm").onsubmit=async e=>{
    e.preventDefault(); $("loginMessage").textContent="Checking…";
    try{const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:$("password").value})});
      if(!r.ok) throw Error("Password not accepted"); $("ownerDialog").close();$("password").value="";$("entryDate").value=new Date().toISOString().slice(0,10);$("editorDialog").showModal();
    }catch(err){$("loginMessage").textContent=err.message}
  };
  $("entryPhotos").onchange=()=>{
    photos=Array.from($("entryPhotos").files||[]);$("uploadPreview").innerHTML="";
    photos.forEach(f=>{const img=document.createElement("img");img.src=URL.createObjectURL(f);$("uploadPreview").append(img)});
  };
  $("entryForm").onsubmit=async e=>{
    e.preventDefault();$("entryMessage").textContent="Uploading…";
    try{
      const uploaded=[];
      for(const file of photos){
        const fd=new FormData();fd.append("file",file);
        const r=await fetch("/api/upload",{method:"POST",body:fd});if(!r.ok)throw Error("Photo upload failed");uploaded.push((await r.json()).url);
      }
      const r=await fetch("/api/journal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({entry_date:$("entryDate").value,title:$("entryTitle").value,body:$("entryBody").value,photos:uploaded,published:$("entryPublished").checked})});
      if(!r.ok)throw Error("Could not save entry");$("entryMessage").textContent="Published.";photos=[];$("entryForm").reset();$("editorDialog").close();await loadJournal();
    }catch(err){$("entryMessage").textContent=err.message}
  };
  $("logoutButton").onclick=async()=>{await fetch("/api/logout",{method:"POST"});$("editorDialog").close()};
  async function pollLiveFlight(){
    if(!currentFlight)return;
    try{
      const r=await fetch(`/api/flight?flight=${encodeURIComponent(currentFlight.number)}&date=${encodeURIComponent(currentFlight.apiDate||"")}`);
      const d=await r.json();
      if(d.available&&d.live&&Number.isFinite(Number(d.live.latitude))&&Number.isFinite(Number(d.live.longitude))){
        $("flightStatus").textContent=(d.status||"IN FLIGHT").toUpperCase()+" · LIVE";
        $("flightDataSource").textContent="LIVE POSITION · AVIATIONSTACK";
        const airports={BNA:[36.1263,-86.6774],LHR:[51.4700,-0.4543],CAI:[30.1219,31.4056]};
        const a=airports[currentFlight.from],b=airports[currentFlight.to];
        if(a&&b){
          const rad=x=>x*Math.PI/180, lat=rad(Number(d.live.latitude)),lon=rad(Number(d.live.longitude));
          const lat1=rad(a[0]),lon1=rad(a[1]),lat2=rad(b[0]),lon2=rad(b[1]);
          const x=(lon-lon1)*Math.cos((lat1+lat2)/2),y=lat-lat1;
          const dx=(lon2-lon1)*Math.cos((lat1+lat2)/2),dy=lat2-lat1;
          const pct=Math.max(0,Math.min(100,((x*dx+y*dy)/(dx*dx+dy*dy))*100));
          $("trackProgress").style.width=pct+"%";$("plane").style.left=pct+"%";
        }
      }
    }catch{/* Keep the scheduled display if live data is unavailable. */}
  }
  update();setInterval(update,1000);loadJournal();setInterval(loadJournal,60000);
  pollLiveFlight();setInterval(pollLiveFlight,60000);
})();
