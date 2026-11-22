// Keep the visitor-facing URL clean when the page is opened from ChatGPT.
try {
  const current = new URL(window.location.href);
  if (current.searchParams.get('utm_source') === 'chatgpt.com') {
    current.searchParams.delete('utm_source');
    window.history.replaceState(window.history.state, '', current.pathname + current.search + current.hash);
  }
} catch (_) {}
document.addEventListener('DOMContentLoaded',()=>{const url=document.querySelector('link[rel="canonical"]').href,status=document.getElementById('share-status');function msg(s){status.textContent=s}document.getElementById('share-card').addEventListener('click',async()=>{if(navigator.share){try{await navigator.share({title:document.title,text:'My Chronicle Property Group contact card',url});return}catch(e){if(e.name==='AbortError')return}}try{await navigator.clipboard.writeText(url);msg('Link copied.')}catch{msg('Copy this page address to share.')}});document.getElementById('copy-card').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(url);msg('Link copied.')}catch{msg('Copy the address from your browser.')}})});
