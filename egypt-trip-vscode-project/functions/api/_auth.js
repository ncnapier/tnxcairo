const enc = new TextEncoder();
function b64(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
async function sign(value,secret){
  const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return b64(await crypto.subtle.sign("HMAC",key,enc.encode(value)));
}
export async function makeCookie(secret){
  const payload=b64(enc.encode(JSON.stringify({exp:Date.now()+7*86400000})));
  return payload+"."+await sign(payload,secret);
}
export async function valid(request,secret){
  const raw=request.headers.get("Cookie")||"";
  const token=raw.split(";").map(x=>x.trim()).find(x=>x.startsWith("tdnn_session="))?.slice(13);
  if(!token)return false;
  const [payload,sig]=token.split(".");if(!payload||!sig)return false;
  if(await sign(payload,secret)!==sig)return false;
  try{return JSON.parse(atob(payload.replace(/-/g,"+").replace(/_/g,"/"))).exp>Date.now()}catch{return false}
}
export const cookieHeader=(value)=>`tdnn_session=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`;
export const clearCookie=()=>`tdnn_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
export async function requireAuth(context){
  if(!context.env.SESSION_SECRET||!await valid(context.request,context.env.SESSION_SECRET))
    return new Response("Unauthorized",{status:401});
  return null;
}
