export async function administratorWorkspace(root,clerk) {
  const status=document.getElementById('administrator-status');
  async function request(path,body) {
    if(!clerk.session) throw new Error('Sign in again.');
    const token=await clerk.session.getToken();
    const response=await fetch(root.dataset.api+'/api/team/administration'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
    const result=await response.json();
    if(!response.ok) throw new Error(result.error||'Administrator request failed.');
    return result;
  }
  const element=(tag,text)=>{const node=document.createElement(tag);node.textContent=text;return node;};
  function action(parent,label,operation) {
    const button=element('button',label);button.type='button';button.className='button outline';
    button.addEventListener('click',async()=>{button.disabled=true;status.textContent='Saving…';try{await operation();await refresh();status.textContent='Saved.';}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
    parent.append(button);
  }
  async function refresh() {
    const data=await request('');
    const teams=document.getElementById('administrator-teams'),missions=document.getElementById('administrator-missions'),files=document.getElementById('administrator-files');
    teams.replaceChildren();missions.replaceChildren();files.replaceChildren();
    teams.append(element('p',`${data.teams.length} teams listed.`));
    for(const row of data.teams){
      const card=document.createElement('article');card.append(element('h3',row.name),element('p',`${row.institution} · ${row.subject?(row.active?'Active login':'Login disabled'):'No login assigned'} · ${row.mission_count} missions`));
      if(row.subject) action(card,row.active?'Disable team login':'Enable team login',()=>request('/access',{subject:row.subject,active:!row.active}));
      teams.append(card);
    }
    for(const row of data.missions){
      const card=document.createElement('article');card.append(element('h3',row.name),element('p',`${row.team} · ${String(row.mission_date).slice(0,10)} · ${row.visibility}/${row.publication_status}${row.synthetic?' · SYNTHETIC':''}`),element('p',`License: ${row.data_license} · ${row.file_count} committed files · ${row.observation_count} observations · ${row.qc_count} QC entries`),element('p',row.description||'No description supplied.'));
      if(!row.synthetic) action(card,'Mark as synthetic test',()=>request('/review',{mission_id:row.id,action:'mark_synthetic'}));
      const label=document.createElement('label');label.className='data-checkbox';const checkbox=document.createElement('input');checkbox.type='checkbox';label.append(checkbox,document.createTextNode('I reviewed provenance, QC, license and privacy for public release.'));card.append(label);
      const publish=element('button','Approve and publish mission');publish.type='button';publish.className='button';publish.disabled=true;
      checkbox.addEventListener('change',()=>{publish.disabled=!checkbox.checked;});
      publish.addEventListener('click',async()=>{publish.disabled=true;status.textContent='Publishing mission…';try{await request('/review',{mission_id:row.id,action:'publish',reviewed:checkbox.checked});await refresh();status.textContent='Mission published.';}catch(error){status.textContent=error.message;publish.disabled=!checkbox.checked;}});card.append(publish);
      if(row.visibility==='public') action(card,'Withdraw public access',()=>request('/review',{mission_id:row.id,action:'withdraw'}));
      missions.append(card);
    }
    if(!data.missions.length) missions.textContent='No missions yet.';
    for(const row of data.files){const card=document.createElement('article');card.append(element('h3',row.original_filename),element('p',`${row.team} / ${row.mission} · ${row.import_status} · expected ${row.row_count} rows / stored ${row.stored_observations} · ${row.audited?'Import audit present':'Legacy import or missing audit'}`),element('p','Uploaded by: '+(row.uploaded_by||'Legacy administrator token')),element('p','SHA-256: '+row.sha256));files.append(card);}
    if(!data.files.length) files.textContent='No imports yet.';
    if(data.truncated) status.textContent='Showing at most 1,000 records per list.';
  }
  await refresh();document.getElementById('administrator-workspace').hidden=false;
  const form=document.getElementById('team-create-form');
  form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('button');button.disabled=true;status.textContent='Creating team…';try{await request('/teams',Object.fromEntries(new FormData(form)));form.reset();await refresh();status.textContent='Team created and login assigned. No invitation sent.';}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
}
