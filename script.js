const config = window.PORTFOLIO_CONFIG || {};
const updateBottomFade = () => {
  const remaining = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
  document.body.classList.toggle('at-page-end', remaining <= 12);
};
window.addEventListener('scroll', updateBottomFade, { passive: true });
window.addEventListener('resize', updateBottomFade);
window.addEventListener('load', updateBottomFade);
updateBottomFade();
const contactButton = document.querySelector('#contact-button');
const dialog = document.querySelector('#contact-dialog');
const contactUrl = /^(https:\/\/|mailto:)/i.test(config.contactUrl || '') ? config.contactUrl : '';
document.querySelector('#year').textContent = new Date().getFullYear();
contactButton.addEventListener('click', () => {
  if (contactUrl) window.location.assign(contactUrl);
  else dialog.showModal();
});
document.querySelectorAll('.close, .close-dialog').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => { if(event.target === dialog) { const r = dialog.getBoundingClientRect(); if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });

(async()=>{
 const videos=[...document.querySelectorAll('video[data-media-src]')];
 if(!videos.length)return;
 try{
  if(!('serviceWorker' in navigator))throw Error('Video playback unavailable');
  const controlled=new Promise(resolve=>{
   if(navigator.serviceWorker.controller){resolve(true);return;}
   const timer=setTimeout(()=>resolve(Boolean(navigator.serviceWorker.controller)),10000);
   const check=()=>{
    if(!navigator.serviceWorker.controller)return;
    clearTimeout(timer);
    navigator.serviceWorker.removeEventListener('controllerchange',check);
    resolve(true);
   };
   navigator.serviceWorker.addEventListener('controllerchange',check);
   check();
  });
  await navigator.serviceWorker.register('media-worker.js',{updateViaCache:'none'});
  await navigator.serviceWorker.ready;
  if(!await controlled)throw Error('Video playback controller did not become ready');
  for(const video of videos){video.src=new URL(video.dataset.mediaSrc,document.baseURI).href;video.load();}
 }catch(error){
  for(const video of videos){const note=document.createElement('p');note.textContent='This video could not be loaded. Please refresh the page and try again.';video.parentElement.append(note);}
 }
})();
