let allApplications=[];
const stages=['Received','In Progress','Reviewed','Completed'];
const stageClasses={'Received':'stage-received','In Progress':'stage-in-progress','Reviewed':'stage-reviewed','Completed':'stage-completed'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateText=s=>s?esc(s.replace('T',' ').slice(0,16)):'-';
async function fetchApplications(){
 try{const r=await fetch('/api/applications');const x=await r.json();if(!r.ok)throw Error(x.message||'Unable to load');allApplications=x.data||[];renderTable();}
 catch(e){console.error(e);document.getElementById('applicationTableBody').innerHTML='<tr><td colspan="17">Unable to load applications</td></tr>';}
}
function renderTable(){
 const tb=document.getElementById('applicationTableBody');if(!tb)return;
 const search=(document.getElementById('searchInput')?.value||'').toLowerCase();
 const type=(document.getElementById('applicationTypeDropdown')?.value||'').toLowerCase();
 const dept=(document.getElementById('departmentDropdown')?.value||'').toLowerCase();
 const date=document.getElementById('dateFilter')?.value||'';
 const filtered=allApplications.filter(a=>
   [a.application_id,a.applicant_name,a.contact_number].some(v=>String(v||'').toLowerCase().includes(search)) &&
   (!type||String(a.applicant_type_id)===type||String(a.applicant_type_name||'').toLowerCase()===type) &&
   (!dept||String(a.department_id)===dept||String(a.department_name||'').toLowerCase()===dept) &&
   (!date||a.application_date===date));
 tb.innerHTML=filtered.length?filtered.map((a,i)=>`<tr>
 <td>${i+1}</td><td>${esc(a.application_id)}</td><td>${esc(a.applicant_name)}</td><td>${esc(a.dob||'-')}</td>
 <td>${esc(a.contact_number)}</td><td>${esc(a.address)}</td><td>${esc(a.city)}</td><td>${esc(a.state)}</td><td>${esc(a.pincode)}</td><td>${esc(a.subject)}</td>
 <td>${esc(a.category_name)}</td><td>${esc(a.applicant_type_name)}</td><td>${esc(a.department_name)}</td>
 <td>${dateText(a.created_at)}</td><td>${a.attachment?`<a href="${encodeURI(a.attachment)}" target="_blank">View attachment</a>`:'No file'}</td>
 <td><select class="form-select ${stageClasses[a.stage]||''}" onchange="updateStage(${a.id},this.value)">${stages.map(v=>`<option ${v===a.stage?'selected':''}>${v}</option>`).join('')}</select></td><td>${dateText(a.updated_at)}</td>
 </tr>`).join(''):'<tr><td colspan="17" class="text-muted">No applications found</td></tr>';
}
async function updateStage(id,stage){
 try{const r=await fetch('/api/applications?id='+id,{method:'PUT',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({stage})});const x=await r.json();if(!x.success)throw Error(x.message||'Update failed');await fetchApplications();}
 catch(e){alert(e.message);await fetchApplications();}
}
document.addEventListener('DOMContentLoaded',()=>{
 fetchApplications();['searchInput','applicationTypeDropdown','departmentDropdown','dateFilter'].forEach(id=>document.getElementById(id)?.addEventListener('input',renderTable));
});
