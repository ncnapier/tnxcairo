import {requireAuth} from "./_auth.js";
export async function onRequestGet({env}){
  const {results=[]}=await env.DB.prepare("SELECT id,entry_date,title,body,photos FROM journal WHERE published=1 ORDER BY entry_date DESC, created_at DESC").all();
  return Response.json(results.map(r=>({...r,photos:JSON.parse(r.photos||"[]")})));
}
export async function onRequestPost(context){
  const denied=await requireAuth(context);if(denied)return denied;
  const {env,request}=context;const d=await request.json();
  if(!d.entry_date||!d.title||d.title.length>90)return new Response("Invalid entry",{status:400});
  const id=crypto.randomUUID(),photos=JSON.stringify(Array.isArray(d.photos)?d.photos.slice(0,12):[]);
  await env.DB.prepare("INSERT INTO journal(id,entry_date,title,body,photos,published,created_at) VALUES(?,?,?,?,?,?,?)")
    .bind(id,d.entry_date,d.title,String(d.body||"").slice(0,5000),photos,d.published?1:0,new Date().toISOString()).run();
  return Response.json({ok:true,id});
}
