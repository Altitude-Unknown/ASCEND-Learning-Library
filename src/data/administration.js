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
      const card=document.createElement('article');card.append(element('h3',row.name),element('p',`${row.institution} · ${row.member_count || 0} active members · ${row.mission_count} missions`));
      if(row.subject) action(card,row.active?'Disable team login':'Enable team login',()=>request('/access',{subject:row.subject,active:!row.active}));
      teams.append(card);
    }
    for(const row of data.missions){
      const card=document.createElement('article');card.append(element('h3',row.name),element('p',`${row.team} · ${String(row.mission_date).slice(0,10)} · ${row.visibility}/${row.publication_status}${row.synthetic?' · SYNTHETIC':''}`),element('p',`License: ${row.data_license} · ${row.file_count} committed files · ${row.observation_count} observations · ${row.qc_count} QC entries`),element('p',row.description||'No description supplied.'));
      if(!row.synthetic) action(card,'Mark as synthetic test',()=>request('/review',{mission_id:row.id,action:'mark_synthetic'}));
      if(row.visibility!=='public') action(card,'Restore public access',()=>request('/review',{mission_id:row.id,action:'publish',reviewed:true}));
      if(row.visibility==='public') action(card,'Withdraw public access',()=>request('/review',{mission_id:row.id,action:'withdraw'}));
      missions.append(card);
    }
    if(!data.missions.length) missions.textContent='No missions yet.';
    for(const row of data.files){const card=document.createElement('article');card.append(element('h3',row.original_filename),element('p',`${row.team} / ${row.mission} · ${row.import_status} · expected ${row.row_count} rows / stored ${row.stored_observations} · ${row.audited?'Import audit present':'Legacy import or missing audit'}`),element('p','Uploaded by: '+(row.uploaded_by||'Legacy administrator token')),element('p','SHA-256: '+row.sha256));files.append(card);}
    if(!data.files.length) files.textContent='No imports yet.';
    const memberForm=document.getElementById('member-form');
    const select=document.getElementById('member-team');
    if(select){const selected=select.value;select.replaceChildren();const blank=element('option','No team (staff only)');blank.value='';select.append(blank);for(const team of data.teams){const option=element('option',team.name);option.value=team.id;select.append(option);}select.value=selected;}
    const members=document.getElementById('administrator-members');
    if(members){members.replaceChildren();for(const row of data.members||[]){const card=element('article','');card.append(element('h3',row.display_name||'ASCEND member'),element('p',`${row.role} · ${row.team||'Project staff'} · ${row.active?'Active':'Disabled'}${row.owner?' · Project owner':''}`));if(!row.owner&&(data.owner||row.role!=='administrator'))action(card,'Edit member',async()=>{for(const field of ['subject','display_name','team_id','role'])memberForm.elements[field].value=row[field]||'';memberForm.elements.active.checked=row.active;memberForm.scrollIntoView({block:'start'});});members.append(card);}}
    if(memberForm) memberForm.querySelector('option[value="administrator"]').disabled=!data.owner;
    if(data.truncated) status.textContent='Showing at most 1,000 records per list.';
  }
  await refresh();document.getElementById('administrator-workspace').hidden=false;
  const form=document.getElementById('team-create-form');
  form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('button');button.disabled=true;status.textContent='Creating team…';try{await request('/teams',Object.fromEntries(new FormData(form)));form.reset();await refresh();status.textContent='Team created and login assigned. No invitation sent.';}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
  const memberForm=document.getElementById('member-form');
  if(memberForm)memberForm.addEventListener('submit',async event=>{event.preventDefault();const button=memberForm.querySelector('button');button.disabled=true;try{const input=Object.fromEntries(new FormData(memberForm));input.active=memberForm.elements.active.checked;await request('/members',input);memberForm.reset();await refresh();status.textContent='Member assignment saved.';}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
}
