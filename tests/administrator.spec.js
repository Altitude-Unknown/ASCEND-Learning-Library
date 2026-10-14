import { test, expect } from '@playwright/test';
test('administrator review requires acknowledgment and supports private withdrawal',async({page})=>{
  const operations=[];
  let published=false;
  await page.route('**/data/team/',async route=>{
    const response=await route.fetch();
    let html=await response.text();
    html=html.replace(/data-api="[^"]*"/,'data-api="https://portal-api.example.test"').replace(/data-clerk-key="[^"]*"/,'data-clerk-key="pk_test_Zml4dHVyZS5jbGVyay5hY2NvdW50cy5kZXYk"').replace(/data-clerk-domain="[^"]*"/,'data-clerk-domain="fixture.clerk.accounts.dev"');
    await route.fulfill({response,body:html});
  });
  await page.route('https://fixture.clerk.accounts.dev/**',route=>route.fulfill({contentType:'text/javascript',body:'window.Clerk={load:async()=>{},session:{getToken:async()=>"test-session"},mountUserButton:()=>{}};'}));
  await page.route('https://portal-api.example.test/**',async route=>{
    const request=route.request();
    if(request.method()==='OPTIONS') return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'GET,POST'}});
    const path=new URL(request.url()).pathname;
    let body;
    if(path==='/api/team/me') body={account:{role:'administrator',team_id:null},team:null};
    else if(request.method()==='POST') {const input=request.postDataJSON();operations.push(input);if(input.action==='publish')published=true;if(input.action==='withdraw')published=false;body={};}
    else body={teams:[],files:[],missions:[{id:'91000000-0000-4000-8000-000000000006',name:'Review test mission',mission_date:'2026-10-12',team:'Test Team',data_license:'CC0-1.0',synthetic:true,visibility:published?'public':'private',publication_status:published?'approved':'pending',file_count:1,observation_count:5,qc_count:5}],truncated:false};
    await route.fulfill({json:body,headers:{'Access-Control-Allow-Origin':'*'}});
  });
  await page.goto('/data/team/');
  const publish=page.getByRole('button',{name:'Approve and publish mission'});
  await expect(publish).toBeDisabled();
  await page.getByLabel('I reviewed provenance, QC, license and privacy for public release.').check();
  await publish.click();
  await expect(page.getByText('Mission published.',{exact:true})).toBeVisible();
  expect(operations[0]).toEqual({mission_id:'91000000-0000-4000-8000-000000000006',action:'publish',reviewed:true});
  await page.getByRole('button',{name:'Withdraw public access'}).click();
  await expect(page.getByText('Test Team · 2026-10-12 · private/pending · SYNTHETIC')).toBeVisible();
  expect(operations.at(-1).action).toBe('withdraw');
});
