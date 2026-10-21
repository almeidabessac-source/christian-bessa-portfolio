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
  await navigator.serviceWorker.register('media-worker.js');
  await navigator.serviceWorker.ready;
  if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
  for(const video of videos){video.src=video.dataset.mediaSrc;video.load();}
 }catch(error){
  for(const video of videos){const note=document.createElement('p');note.textContent='Please reload the page to play this video.';video.parentElement.append(note);}
 }
})();
