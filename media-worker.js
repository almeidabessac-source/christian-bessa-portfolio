const media = {"/media/01-Austin.mp4":{"size":102778748,"chunkSize":8388608,"chunks":["01-Austin.mp4.000.bin","01-Austin.mp4.001.bin","01-Austin.mp4.002.bin","01-Austin.mp4.003.bin","01-Austin.mp4.004.bin","01-Austin.mp4.005.bin","01-Austin.mp4.006.bin","01-Austin.mp4.007.bin","01-Austin.mp4.008.bin","01-Austin.mp4.009.bin","01-Austin.mp4.010.bin","01-Austin.mp4.011.bin","01-Austin.mp4.012.bin"]},"/media/02-Bali.mp4":{"size":61901466,"chunkSize":8388608,"chunks":["02-Bali.mp4.000.bin","02-Bali.mp4.001.bin","02-Bali.mp4.002.bin","02-Bali.mp4.003.bin","02-Bali.mp4.004.bin","02-Bali.mp4.005.bin","02-Bali.mp4.006.bin","02-Bali.mp4.007.bin"]},"/media/03-Santorini-HELIOS.mp4":{"size":45931502,"chunkSize":8388608,"chunks":["03-Santorini-HELIOS.mp4.000.bin","03-Santorini-HELIOS.mp4.001.bin","03-Santorini-HELIOS.mp4.002.bin","03-Santorini-HELIOS.mp4.003.bin","03-Santorini-HELIOS.mp4.004.bin","03-Santorini-HELIOS.mp4.005.bin"]}};
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 const scope=new URL(self.registration.scope);
 const key=url.origin===scope.origin&&url.pathname.startsWith(scope.pathname)
  ?'/'+url.pathname.slice(scope.pathname.length)
  :null;
 const file=key?media[key]:null;
 if(file && ['GET','HEAD'].includes(event.request.method))event.respondWith(serve(event.request,file));
});
async function serve(request,file){
 let start=0,end=file.size-1;
 const range=request.headers.get('Range');
 if(range){
  const match=/^bytes=(\d*)-(\d*)$/.exec(range);
  if(!match || (!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${file.size}`}});
  if(match[1]){start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),end);}
  else start=Math.max(0,file.size-Number(match[2]));
  if(start>end||start>=file.size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${file.size}`}});
 }
 const headers={'Content-Type':'video/mp4','Accept-Ranges':'bytes','Content-Length':String(end-start+1)};
 if(range)headers['Content-Range']=`bytes ${start}-${end}/${file.size}`;
 let cursor=start;
 const abort=new AbortController();
 const stream=request.method==='HEAD'?null:new ReadableStream({
  async pull(controller){
   try{
    if(cursor>end){controller.close();return;}
    const index=Math.floor(cursor/file.chunkSize),chunkStart=index*file.chunkSize;
    const response=await fetch(new URL(file.chunks[index],self.registration.scope),{signal:abort.signal,cache:'no-store'});
    if(!response.ok)throw Error('Unable to load video');
    const bytes=new Uint8Array(await response.arrayBuffer());
    const until=Math.min(end+1,chunkStart+bytes.length);
    if(until<=cursor)throw Error('Incomplete video data');
    controller.enqueue(bytes.subarray(cursor-chunkStart,until-chunkStart));cursor=until;
    if(cursor>end)controller.close();
   }catch(error){controller.error(error);}
  },cancel(){abort.abort();}
 });
 return new Response(stream,{status:range?206:200,headers});
}
