let userApplications=[];
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderTable(){
 const tb=document.getElementById('applicationTableBody');if(!tb)return;
 const q=(document.getElementById('searchInput')?.value||'').toLowerCase(),type=(document.getElementById('applicationTypeFilter')?.value||'').toLowerCase(),dept=(document.getElementById('departmentFilter')?.value||'').toLowerCase(),date=document.getElementById('dateFilter')?.value||'';
 const rows=userApplications.filter(a=>[a.application_id,a.applicant_name,a.contact_number].some(x=>String(x||'').toLowerCase().includes(q))&&(!type||String(a.applicant_type_name||'').toLowerCase().includes(type))&&(!dept||String(a.department_name||'').toLowerCase().includes(dept))&&(!date||a.application_date===date));
 tb.innerHTML=rows.length?rows.map((a,i)=>`<tr><td>${i+1}</td><td>${e(a.application_id)}</td><td>${e(a.applicant_name)}</td><td>${e(a.dob)}</td><td>${e(a.contact_number)}</td><td>${e(a.address)}</td><td>${e(a.city)}</td><td>${e(a.state)}</td><td>${e(a.pincode)}</td><td>${e(a.subject)}</td><td>${e(a.category_name)}</td><td>${e(a.applicant_type_name)}</td><td>${e(a.department_name)}</td><td>${e(a.created_at)}</td><td>${a.attachment?`<a href="${encodeURI(a.attachment)}">View</a>`:'-'}</td><td>${e(a.stage)}</td><td>${e(a.updated_by||'-')}</td><td>${e(a.updated_at||'-')}</td></tr>`).join(''):'<tr><td colspan="18">No applications found</td></tr>';
}
document.addEventListener('DOMContentLoaded',async()=>{
 try{const r=await fetch('/api/applications');const x=await r.json();if(!x.success)throw Error(x.message);userApplications=x.data||[];renderTable()}catch(err){console.error(err);}
 ['searchInput','applicationTypeFilter','departmentFilter','dateFilter'].forEach(id=>document.getElementById(id)?.addEventListener('input',renderTable));
});
