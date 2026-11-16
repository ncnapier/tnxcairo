import {clearCookie} from "./_auth.js";
export async function onRequestPost(){return new Response("OK",{headers:{"Set-Cookie":clearCookie()}})}
