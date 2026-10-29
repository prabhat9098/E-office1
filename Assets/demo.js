document.addEventListener('DOMContentLoaded',()=>{
 const badge=document.createElement('div');badge.textContent='CLIENT DEMO  |  SAMPLE DATA  |  NOT AN OFFICIAL LIVE SYSTEM';
 Object.assign(badge.style,{position:'fixed',bottom:'0',left:'0',right:'0',zIndex:'20000',background:'#173450',color:'white',textAlign:'center',fontFamily:'system-ui,sans-serif',fontSize:'11px',letterSpacing:'.6px',padding:'5px 8px',opacity:'.96',pointerEvents:'none'});
 document.body.appendChild(badge);document.body.style.paddingBottom='24px';
 document.getElementById('logoutBtn')?.addEventListener('click',async ev=>{
  ev.preventDefault();ev.stopImmediatePropagation();
  try{await fetch('/api/auth/logout',{method:'POST'});}catch{}
  localStorage.removeItem('user');localStorage.removeItem('usertype');sessionStorage.clear();location.href='index.html';
 },true);
});
