import {makeCookie,cookieHeader} from "./_auth.js";
export async function onRequestPost({request,env}){
  if(!env.ADMIN_PASSWORD||!env.SESSION_SECRET)return new Response("Server setup incomplete",{status:503});
  const data=await request.json().catch(()=>({}));
  if(typeof data.password!=="string"||data.password!==env.ADMIN_PASSWORD)return new Response("Password not accepted",{status:401});
  const token=await makeCookie(env.SESSION_SECRET);
  return new Response(JSON.stringify({ok:true}),{headers:{"Content-Type":"application/json","Set-Cookie":cookieHeader(token)}});
}
