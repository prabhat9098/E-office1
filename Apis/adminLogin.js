function showToast(message, type = "info") {
 const el=document.getElementById("toastMessage"), t=document.getElementById("toastText");
 if (!el || !t) return alert(message);
 t.textContent=message;el.className=`toast align-items-center text-white ${type==='error'?'bg-danger':'bg-success'} border-0`;
 new bootstrap.Toast(el).show();
}
async function adminLogin(){
 const email=document.getElementById('adminEmail').value.trim();
 const password=document.getElementById('adminPassword').value;
 if(!email||!password)return showToast('Enter email and password','error');
 try{
  const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  const result=await r.json();if(!r.ok||!result.success)throw new Error(result.message||'Login failed');
  localStorage.setItem('user',email);localStorage.setItem('usertype','admin');sessionStorage.setItem('admin_id',result.admin_id);
  window.location.href='dashboard.html';
 }catch(err){showToast(err.message,'error');}
}
window.adminLogin=adminLogin;
