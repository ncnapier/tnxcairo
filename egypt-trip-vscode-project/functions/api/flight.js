// Server-side Aviationstack proxy. API keys never reach the browser.
export async function onRequestGet({request,env}){
  if(!env.AVIATIONSTACK_API_KEY)return Response.json({available:false,reason:"Flight API key not configured"});
  const url=new URL(request.url),flight=(url.searchParams.get("flight")||"").replace(/\s/g,"").toUpperCase();
  if(!/^BA\d{1,4}$/.test(flight))return new Response("Invalid flight number",{status:400});
  const endpoint=new URL("https://api.aviationstack.com/v1/flights");
  endpoint.searchParams.set("access_key",env.AVIATIONSTACK_API_KEY);
  endpoint.searchParams.set("flight_iata",flight);
  const date=url.searchParams.get("date");if(date)endpoint.searchParams.set("flight_date",date);
  const upstream=await fetch(endpoint.toString());
  if(!upstream.ok)return Response.json({available:false,reason:"Flight provider unavailable"},{status:200});
  const data=await upstream.json(),item=data.data?.[0];
  if(!item)return Response.json({available:false,reason:"No live flight record returned"});
  return Response.json({available:true,flight:item.flight?.iata||flight,status:item.flight_status,
    departure:item.departure,arrival:item.arrival,live:item.live||null});
}
