import {requireAuth} from "./_auth.js";
export async function onRequestPost(context){
  const denied=await requireAuth(context);if(denied)return denied;
  const {request,env}=context;const form=await request.formData();const file=form.get("file");
  if(!file||typeof file==="string"||!file.type.startsWith("image/"))return new Response("Image required",{status:400});
  if(file.size>8*1024*1024)return new Response("Maximum photo size is 8 MB",{status:413});
  const ext=(file.type.split("/")[1]||"jpg").replace(/[^a-z0-9]/gi,"").slice(0,8)||"jpg";
  const key=crypto.randomUUID()+"."+ext;
  await env.PHOTOS.put(key,file.stream(),{httpMetadata:{contentType:file.type,cacheControl:"public, max-age=31536000"}});
  return Response.json({url:"/api/photo/"+key});
}
