import {test,expect} from '@playwright/test';
async function setup(page,{signedIn=true,enrollmentStatus='active',moderator=false,administrator=false}={}){
 const calls=[];
 await page.route('**/community/',async route=>{const response=await route.fetch();const html=(await response.text()).replace(/data-api="[^"]*"/,'data-api="https://community-api.example.test"').replace(/data-clerk-key="[^"]*"/,'data-clerk-key="pk_test_Zml4dHVyZS5jbGVyay5hY2NvdW50cy5kZXYk"').replace(/data-clerk-domain="[^"]*"/,'data-clerk-domain="fixture.clerk.accounts.dev"');await route.fulfill({response,body:html});});
 await page.route('https://fixture.clerk.accounts.dev/**',route=>route.fulfill({contentType:'text/javascript',body:`window.Clerk={load:async()=>{},session:${signedIn?'{getToken:async()=>"test-session"}':'null'},mountUserButton:()=>{},mountSignIn:el=>{el.textContent="Sign-in form";}};`}));
 await page.route('https://community-api.example.test/**',async route=>{
 const request=route.request();if(request.method()==='OPTIONS')return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'GET,POST'}});
 calls.push(request);const path=new URL(request.url()).pathname;let data;
 if(path.endsWith('/enrollment'))data={status:request.method()==='POST'?'pending':enrollmentStatus};
 else if(path.endsWith('/groups'))data={data:[{id:'group',name:'Introductions',description:'Meet members'}],moderator,administrator};
 else if(path.endsWith('/membership'))data={data:[]};
 else if(path.endsWith('/topics'))data={data:[{id:'topic',title:'Hello from another team',author:'Member B',post_count:1,pinned:false,locked:false}],nextOffset:null};
 else if(request.method()==='POST')data={id:'new-reply'};
 else data={topic:{id:'topic',title:'Hello from another team',group_id:'group',locked:false,pinned:false},data:[{id:'post',author:'Member B',team:'Team B',institution:'College',created_at:'2026-10-13T12:00:00Z',body:'<img src=x onerror=alert(1)>'}],nextOffset:null};
 await route.fulfill({json:data,headers:{'Access-Control-Allow-Origin':'*'}});
 });return calls;
}
test('signed-out visitors cannot fetch or see discussions',async({page})=>{const calls=await setup(page,{signedIn:false});await page.goto('/community/');await expect(page.getByText('Sign-in form')).toBeVisible();await expect(page.locator('#community-board')).toBeHidden();expect(calls.length).toBe(0);});
test('members read cross-team discussions and reply without moderator controls',async({page})=>{const calls=await setup(page);await page.goto('/community/');await page.getByRole('button',{name:'Introductions',exact:true}).click();await page.getByRole('button',{name:'Hello from another team',exact:true}).click();await expect(page.locator('#community-posts')).toContainText('Member B');await expect(page.locator('#community-posts img')).toHaveCount(0);await expect(page.getByRole('button',{name:'Hide this post'})).toHaveCount(0);await page.getByLabel('Reply',{exact:true}).fill('Welcome!');await page.getByRole('button',{name:'Post reply',exact:true}).click();await expect(page.locator('#community-status')).toHaveText('Ready.');expect(calls.some(r=>r.method()==='POST'&&r.postDataJSON().body==='Welcome!')).toBe(true);});

test("new signup requests access without fetching discussions",async({page})=>{const calls=await setup(page,{enrollmentStatus:"unregistered"});await page.goto("/community/");await page.getByLabel("Your name",{exact:true}).fill("New member");await page.getByRole("button",{name:"Request membership"}).click();await expect(page.locator("#enrollment-form")).toBeHidden();await expect(page.locator("#community-status")).toContainText("waiting for moderator approval");await expect(page.locator("#community-board")).toBeHidden();expect(calls.some(r=>new URL(r.url()).pathname.endsWith("/groups"))).toBe(false);});

test("administrator can confirm group deletion",async({page})=>{const calls=await setup(page,{moderator:true,administrator:true});await page.goto("/community/");await page.getByRole("button",{name:"Introductions",exact:true}).click();page.on("dialog",dialog=>dialog.accept());await page.getByRole("button",{name:"Delete group",exact:true}).click();await expect(page.locator("#group-heading")).toHaveText("Choose a group");expect(calls.some(r=>r.method()==="POST"&&r.postDataJSON().action==="delete_group")).toBe(true);});
