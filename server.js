'use strict';
// Self-contained E-Office client demo: Node.js 22+ with built-in SQLite.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Readable } = require('node:stream');
const { DatabaseSync } = require('node:sqlite');
const root = __dirname;
const dataDir = process.env.DATA_DIR || path.join(root, 'data');
const uploadDir = path.join(dataDir, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'eoffice.sqlite'));
db.exec(`PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
 CREATE TABLE IF NOT EXISTS departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
 CREATE TABLE IF NOT EXISTS applicant_types (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
 CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, mobile_number TEXT NOT NULL UNIQUE);
 CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, salt TEXT NOT NULL, hash TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, role TEXT NOT NULL, identity TEXT NOT NULL, expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS applications (
 id INTEGER PRIMARY KEY AUTOINCREMENT, application_id TEXT NOT NULL UNIQUE, application_date TEXT NOT NULL,
 application_time TEXT NOT NULL, applicant_name TEXT NOT NULL, contact_number TEXT NOT NULL,
 subject TEXT NOT NULL, address TEXT NOT NULL, category_id INTEGER, department_id INTEGER,
 applicant_type_id INTEGER, dob TEXT, state TEXT, email TEXT, city TEXT, pincode TEXT,
 attachment TEXT, stage TEXT DEFAULT 'Received', direction TEXT DEFAULT 'inward',
 updated_by TEXT, updated_at TEXT, created_at TEXT NOT NULL
 );`);
const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || 'demo.admin@eoffice.test';
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || 'Demo@2026!';
const DEMO_OTP = process.env.DEMO_USER_OTP || '123456';
function hashPassword(pass, salt) { return crypto.scryptSync(pass, salt, 64).toString('hex'); }
function seed(){
 const insert = (table,names) => { const stmt = db.prepare(`INSERT OR IGNORE INTO ${table} (name) VALUES (?)`); names.forEach(n=>stmt.run(n)); };
 insert('categories', ['Public Grievance','Employment Assistance','Medical Assistance','Education Support','Infrastructure','Social Welfare','Administrative Request']);
 insert('departments', ['Social Justice','Public Works','Health','Education','Revenue','Municipal Administration','General Administration']);
 insert('applicant_types', ['Citizen','Organization','Government Office','NGO','Business']);
 const u = db.prepare('INSERT OR IGNORE INTO users (name,role,mobile_number) VALUES (?,?,?)');
 [['Demo Office Staff','Staff','9876543210'],['Demo Case Worker','Operator','9123456789'],['Demo Reception','Staff','9000000001'],['Demo Analyst','Viewer','9000000002']].forEach(v=>u.run(...v));
 const salt=crypto.randomBytes(16).toString('hex');
 db.prepare('INSERT OR IGNORE INTO admins(email,salt,hash) VALUES(?,?,?)').run(ADMIN_EMAIL,salt,hashPassword(ADMIN_PASSWORD,salt));
 if (db.prepare('SELECT COUNT(*) as total FROM applications').get().total) return;
 const names=['Aarav Deshmukh','Priya Kulkarni','Rohan Patil','Sneha Joshi','Aditya Shinde','Neha Pawar','Kiran More','Ananya Jadhav','Omkar Bhosale','Meera Chavan','Rahul Kadam','Isha Gaikwad','Nikhil Sable','Pooja Rathod','Siddharth Kale','Tanvi Salunkhe','Devendra Nair','Sakshi Mishra'];
 const topics=['Pension application follow-up','Road repair request','Medical support request','Scholarship verification','Streetlight maintenance','Disability support enquiry','Employment guidance','School facility improvement','Water supply complaint','Administrative certificate request','Clinic access request','Public transport request','Local drainage issue','Educational grant enquiry','Community facility proposal','Senior citizen assistance','Road signage installation','Office document clarification'];
 const cities=['Chhatrapati Sambhajinagar','Pune','Nashik','Nagpur','Jalna','Mumbai','Kolhapur'];
 const stages=['Received','In Progress','Reviewed','Completed'];
 const today=new Date(); const stmt=db.prepare(`INSERT INTO applications(application_id,application_date,application_time,applicant_name,contact_number,subject,address,category_id,department_id,applicant_type_id,dob,state,email,city,pincode,stage,direction,updated_by,updated_at,created_at)
 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
 names.forEach((name,i)=>{
   const date=new Date(today.getTime()-(i*26+5)*3600*1000).toISOString().slice(0,10); const time=String(9+i%8).padStart(2,'0')+':'+String(10+i*3%50).padStart(2,'0');
   const city=cities[i%cities.length]; const stage=stages[(i*5)%4]; const createdAt=date+' '+time+':00';
   stmt.run('IN'+String(1001+i),date,time,name,(i===0?'9876543210':i===1?'9123456789':'9'+String(100000000+i*1731).padStart(9,'0')),topics[i],`${i+10} Demo Sample Road`,i%7+1,i%7+1,i%5+1,`199${i%10}-0${i%8+1}-15`,'Maharashtra',`applicant${i+1}@example.test`,city,'431001',stage,i%6===0?'outward':'inward',stage==='Received'?'':'Demo Office Staff',stage==='Received'?'':createdAt,createdAt);
 });
}
seed();
function reply(res, status, body, headers={}) { const str=JSON.stringify(body);res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(str); }
function fail(res,status,message) {reply(res,status,{success:false,message});}
function cookie(req,name){const val=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));return val?decodeURIComponent(val.slice(name.length+1)):null;}
function auth(req){const token=cookie(req,'eoffice_demo');if(!token) return null; const row=db.prepare('SELECT role, identity, expires FROM sessions WHERE token_hash=?').get(crypto.createHash('sha256').update(token).digest('hex')); return row&&row.expires>Date.now()?row:null;}
function signIn(res,role,identity,req){const token=crypto.randomBytes(32).toString('hex'); const token_hash=crypto.createHash('sha256').update(token).digest('hex');db.prepare('INSERT INTO sessions(token_hash,role,identity,expires) VALUES(?,?,?,?)').run(token_hash,role,identity,Date.now()+12*3600*1000);
const secure=(req.headers['x-forwarded-proto']==='https'||req.socket.encrypted)?'; Secure':'';
res.setHeader('Set-Cookie',`eoffice_demo=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=43200${secure}`);}
async function parseBody(req) {
 const chunks=[]; let total=0;
 for await(const c of req){total+=c.length;if(total>8*1024*1024) throw Object.assign(new Error('Maximum upload size: 8 MB'),{code:413});chunks.push(c);}
 const content=Buffer.concat(chunks);const ct=req.headers['content-type']||'';
 if(ct.includes('application/json')) return JSON.parse(content.toString('utf8')||'{}');
 if(ct.includes('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(content.toString('utf8')));
 if(ct.includes('multipart/form-data')){
  const request=new Request('http://localhost/upload',{method:'POST',headers:{'content-type':ct},body:content});
  const fd=await request.formData();return Object.fromEntries(fd.entries());
 }
 return {};
}
const list = name => db.prepare(`SELECT id, name FROM ${name} ORDER BY id`).all();
const tables={'categories':'categories','departments':'departments','applicant_types':'applicant_types'};
function asText(v,max=350){return String(v===undefined||v===null?'':v).trim().slice(0,max);}
function sqlTimestamp(){return new Date().toISOString().replace('T',' ').slice(0,19);}
const appSelect=`SELECT a.*,c.name AS category_name,d.name AS department_name,t.name AS applicant_type_name FROM applications a LEFT JOIN categories c ON c.id=a.category_id LEFT JOIN departments d ON d.id=a.department_id LEFT JOIN applicant_types t ON t.id=a.applicant_type_id`;
function getApplications(){return db.prepare(appSelect+' ORDER BY a.id DESC').all();}
function toApp(row){return {...row, id:row.id, stage:row.stage||'Received',updatedAt:row.updated_at||'',createdAt:row.created_at,attachment:row.attachment||'',category:row.category_name,department:row.department_name,application_type:row.applicant_type_name};}
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.json':'application/json; charset=utf-8'};
function staticFile(req,res,url,user) {
 let pathname=url.pathname==='/'?'/index.html':url.pathname;
 if(pathname.startsWith('/uploads/')){
  const file=path.join(uploadDir,path.basename(pathname)); if(!user){res.writeHead(302,{Location:'/index.html'});return res.end();} if(!fs.existsSync(file)){res.writeHead(404);return res.end('Not found');}
  res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",'Cache-Control':'private, no-store'});return fs.createReadStream(file).pipe(res);
 }
 const clean=path.posix.normalize(pathname);const file=path.resolve(root,'.'+clean);
 if(!file.startsWith(root+path.sep) || file.includes(`${path.sep}.git${path.sep}`) || /(^|\/)data\//.test(clean)|| !fs.existsSync(file)||!fs.statSync(file).isFile()||file===__filename){res.writeHead(404);return res.end('Not found');}
 const ext=path.extname(file).toLowerCase(); if(!MIME[ext]) {res.writeHead(404);return res.end('Not found');}
 if(ext==='.html' && !['/index.html'].includes(clean) && !user){res.writeHead(302,{Location:'/index.html'});return res.end();}
 if(ext==='.html' && user?.role==='user' && !['/UserTypeApplicationform.html','/UserTypeApplications.html'].includes(clean)){res.writeHead(302,{Location:'/UserTypeApplicationform.html'});return res.end();}
 res.writeHead(200,{'Content-Type':MIME[ext],'X-Content-Type-Options':'nosniff','Cache-Control':ext==='.html'?'no-store':'public, max-age=180'});
 fs.createReadStream(file).pipe(res);
}
async function handler(req,res){
 const base='http://localhost'; let url;try{url=new URL(req.url,base)}catch{return fail(res,400,'Bad URL')};const p=url.pathname;const user=auth(req);const m=req.method;
 try{
  if(p==='/api/health') return reply(res,200,{success:true,mode:'demo',database:'sqlite',applications:db.prepare('SELECT COUNT(*) as n FROM applications').get().n});
  if(p==='/api/auth/session'&&m==='GET')return reply(res,200,{success:true,authenticated:!!user,role:user?.role||null,identity:user?.identity||null});
  if(p==='/api/auth/login'&&m==='POST'){
   const data=await parseBody(req);const email=asText(data.email).toLowerCase();const row=db.prepare('SELECT * FROM admins WHERE email=?').get(email);
   if(!row || !crypto.timingSafeEqual(Buffer.from(hashPassword(asText(data.password,200),row.salt),'hex'),Buffer.from(row.hash,'hex'))) return fail(res,401,'Invalid demo credentials');
   signIn(res,'admin',email,req);return reply(res,200,{success:true,admin_id:String(row.id),message:'Signed in'});
  }
  if(p==='/api/auth/demo-user'&&m==='POST'){
   const data=await parseBody(req);const phone=asText(data.phone);const row=db.prepare('SELECT * FROM users WHERE mobile_number=?').get(phone);
   if(!row||asText(data.otp)!==DEMO_OTP)return fail(res,401,'Invalid demo mobile or OTP');
   signIn(res,'user',phone,req);return reply(res,200,{success:true,message:'Signed in'});
  }
  if(p==='/api/auth/logout'&&m==='POST'){
   const token=cookie(req,'eoffice_demo'); if(token)db.prepare('DELETE FROM sessions WHERE token_hash=?').run(crypto.createHash('sha256').update(token).digest('hex'));
   res.setHeader('Set-Cookie','eoffice_demo=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');return reply(res,200,{success:true});
  }
  if(!p.startsWith('/api/'))return staticFile(req,res,url,user);
  if(!user)return fail(res,401,'Please sign in');
  if(m!=='GET'&&m!=='HEAD'){
    const origin=req.headers.origin;
    if(origin && new URL(origin).host!==req.headers.host) return fail(res,403,'Invalid request origin');
  }
  if(p==='/api/summary'&&m==='GET'){
    const apps=getApplications();const counts={};const cats={};apps.forEach(a=>{counts[a.stage]=(counts[a.stage]||0)+1;cats[a.category_name||'Other']=(cats[a.category_name||'Other']||0)+1});
    return reply(res,200,{success:true,totalApplications:apps.length,totalApplicants:new Set(apps.map(a=>a.contact_number)).size,status:counts,categories:cats});
  }
  const table = Object.entries(tables).find(([route])=>p==='/api/'+route)?.[1];
  if(table){
    if(m==='GET')return reply(res,200,{success:true,data:list(table)});
    if(user.role!=='admin')return fail(res,403,'Admin access required');
    const data=await parseBody(req); const id=Number(url.searchParams.get('id')); const name=asText(data.name,100);
    if((m==='POST'||m==='PUT')&&!name)return fail(res,400,'Name is required');
    if(m==='POST'){const result=db.prepare(`INSERT INTO ${table}(name) VALUES(?)`).run(name);return reply(res,201,{success:true,message:'Created successfully',id:Number(result.lastInsertRowid)});}
    if(m==='PUT'&&id){ const result=db.prepare(`UPDATE ${table} SET name=? WHERE id=?`).run(name,id);return reply(res,result.changes?200:404,{success:!!result.changes,message:result.changes?'Updated successfully':'Not found'});}
    if(m==='DELETE'&&id){const result=db.prepare(`DELETE FROM ${table} WHERE id=?`).run(id);return reply(res,result.changes?200:404,{success:!!result.changes,message:result.changes?'Deleted successfully':'Not found'});}
    return fail(res,405,'Unsupported operation');
  }
  if(p==='/api/users'){
    if(m==='GET')return reply(res,200,{success:true,data:db.prepare('SELECT * FROM users ORDER BY id').all()});
    if(user.role!=='admin')return fail(res,403,'Admin access required');
    const data=await parseBody(req);const id=Number(url.searchParams.get('id')); const name=asText(data.name,120),role=asText(data.role,60),mobile=asText(data.mobile_number,20);
    if((m==='POST'||m==='PUT')&&(!name||!role||!/^\d{10}$/.test(mobile)))return fail(res,400,'Name, role and a 10-digit phone are required');
    if(m==='POST'){const result=db.prepare('INSERT INTO users(name,role,mobile_number) VALUES(?,?,?)').run(name,role,mobile);return reply(res,201,{success:true,id:Number(result.lastInsertRowid),message:'User created'});}
    if(m==='PUT'&&id){const result=db.prepare('UPDATE users SET name=?,role=?,mobile_number=? WHERE id=?').run(name,role,mobile,id);return reply(res,result.changes?200:404,{success:!!result.changes,message:result.changes?'User updated':'User not found'});}
    if(m==='DELETE'&&id){const result=db.prepare('DELETE FROM users WHERE id=?').run(id);return reply(res,result.changes?200:404,{success:!!result.changes,message:result.changes?'User deleted':'User not found'});}
    return fail(res,405,'Unsupported operation');
  }
  if(p==='/api/applications'){
    if(m==='GET'){
      let apps=getApplications();if(user.role==='user')apps=apps.filter(a=>a.contact_number===user.identity);
      return reply(res,200,{success:true,data:apps.map(toApp)});
    }
    const data=await parseBody(req);
    const id=Number(url.searchParams.get('id') || data.id);
    if(id&&(m==='PUT'||m==='POST')){
      if(user.role!=='admin')return fail(res,403,'Admin access required');
      const stage=asText(data.stage,50);if(!['Received','In Progress','Reviewed','Completed'].includes(stage))return fail(res,400,'Invalid stage');
      const changed=db.prepare('UPDATE applications SET stage=?,updated_by=?,updated_at=? WHERE id=?').run(stage,user.identity,sqlTimestamp(),id).changes;
      return reply(res,changed?200:404,{success:!!changed,message:changed?'Stage updated':'Application not found'});
    }
    if(m==='POST'){
      const application_id=asText(data.application_id,40)||'IN'+Date.now();const name=asText(data.applicant_name,140);const subject=asText(data.subject,350);
      if(!name||!subject)return fail(res,400,'Applicant name and subject required');
      let attachment='';
      if(data.attachment && typeof data.attachment.arrayBuffer==='function'){
        const f=data.attachment; if(f.size>5*1024*1024)return fail(res,413,'Attachment must be under 5 MB');
        const ext=path.extname(f.name||'').toLowerCase();if(!['.pdf','.jpg','.jpeg','.png'].includes(ext))return fail(res,400,'Only PDF, PNG and JPG attachments supported');
        const filename=crypto.randomBytes(12).toString('hex')+ext;fs.writeFileSync(path.join(uploadDir,filename),Buffer.from(await f.arrayBuffer()));attachment='/uploads/'+filename;
      }
      const now=sqlTimestamp();const date=asText(data.application_date,20)||now.slice(0,10);const time=asText(data.application_time,10)||now.slice(11,16);
      const result=db.prepare(`INSERT INTO applications(application_id,application_date,application_time,applicant_name,contact_number,subject,address,category_id,department_id,applicant_type_id,dob,state,email,city,pincode,attachment,stage,direction,created_at)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(application_id,date,time,name,(user.role==='user'?user.identity:asText(data.contact_number,20)),subject,asText(data.address,400),Number(data.category_id)||null,Number(data.department_id)||null,Number(data.applicant_type_id)||null,asText(data.dob,20),asText(data.state,80),asText(data.email,100),asText(data.city,80),asText(data.pincode,15),attachment,'Received',asText(data.direction,15)||'inward',now);
      return reply(res,201,{success:true,message:'Application submitted successfully',id:Number(result.lastInsertRowid),application_id});
    }
    return fail(res,405,'Unsupported operation');
  }
  return fail(res,404,'Unknown API route');
 }catch(err){
  console.error('Request error:',err.message);
  if(err.code===413)return fail(res,413,err.message);
  if(String(err.message).includes('UNIQUE constraint'))return fail(res,409,'A record with this value already exists');
  if(err instanceof SyntaxError)return fail(res,400,'Invalid request body');
  return fail(res,500,'An unexpected server error occurred');
 }
}
const port=Number(process.env.PORT||3000);http.createServer(handler).listen(port,'0.0.0.0',()=>console.log(`E-Office demo running at http://localhost:${port}`));
