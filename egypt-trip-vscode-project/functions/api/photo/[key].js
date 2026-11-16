export async function onRequestGet({params,env}){
  const key=String(params.key||"");
  if(!/^[a-f0-9-]+\.[a-z0-9]{1,8}$/i.test(key))return new Response("Not found",{status:404});
  const obj=await env.PHOTOS.get(key);if(!obj)return new Response("Not found",{status:404});
  const headers=new Headers();obj.writeHttpMetadata(headers);headers.set("Cache-Control","public, max-age=31536000");
  return new Response(obj.body,{headers});
}
