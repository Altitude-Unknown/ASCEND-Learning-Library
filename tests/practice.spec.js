import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync('public/assets/practice/questions.json'));
async function begin(page,bank='Airspace',all=false){
 await page.goto('/part107/practice-tests/');
 await expect(page.locator('#practice-setup')).toBeVisible();
 await page.getByLabel('Topic',{exact:true}).selectOption(bank);
 if(all)await page.getByLabel('Questions',{exact:true}).selectOption('all');
 await page.getByRole('button',{name:'Start practice',exact:true}).click();
}
async function checkAxe(page){
 const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 expect(scan.violations,JSON.stringify(scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.failureSummary)})))).toEqual([]);
}
test('Complete a quiz with shuffled choices, correct grading, figure review, and restart',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await begin(page,'Airspace',true);
 const items=page.locator('[data-question-id]');await expect(items).toHaveCount(46);
 await expect(page.locator('[data-question-id="airspace_0044"] summary')).toHaveText('View Figure 71');
 await page.getByRole('button',{name:'Check answers',exact:true}).click();
 await expect(page.locator('#practice-incomplete')).toContainText('46 questions');
 await expect(items.first().locator('legend')).toBeFocused();
 const ids=await items.evaluateAll(nodes=>nodes.map(n=>n.dataset.questionId));
 for(const [i,id] of ids.entries()){
  const q=data.questions.find(q=>q.id===id),answer=i===0?(q.answerIndex+1)%q.choices.length:q.answerIndex;
  await page.locator(`[data-question-id="${id}"] input[value="${answer}"]`).check();
 }
 await expect(page.locator('#practice-progress')).toHaveText('46 of 46 answered');
 await page.getByRole('button',{name:'Check answers',exact:true}).click();
 await expect(page.locator('#practice-results-heading')).toHaveText('Practice results: 45 of 46 correct (98%)');
 await expect(page.locator('#practice-results-heading')).toBeFocused();
 await expect(page.locator('.practice-incorrect')).toHaveCount(1);
 const figure=page.locator('[data-review-id="airspace_0044"] .practice-figure');
 await figure.locator('summary').click();await expect(figure.locator('img')).toBeVisible();
 expect(await figure.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBeTruthy();
 await checkAxe(page);
 await page.getByRole('button',{name:'Choose another practice quiz'}).click();
 await expect(page.locator('#practice-bank')).toBeFocused();await expect(page.locator('#practice-results')).toBeHidden();
 expect(errors).toEqual([]);
});
test('Mixed quiz has 50 unique questions and changing topics restores count choices',async({page})=>{
 await begin(page,'mixed');
 await expect(page.locator('[data-question-id]')).toHaveCount(50);
 const ids=await page.locator('[data-question-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.questionId));
 expect(new Set(ids).size).toBe(50);
 for(const bank of data.banks)expect(ids.filter(id=>data.questions.find(q=>q.id===id).bank===bank)).toHaveLength(10);
 await page.getByRole('button',{name:'Start over',exact:true}).click();
 await page.getByLabel('Topic',{exact:true}).selectOption('Weather');await expect(page.getByLabel('Questions',{exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'Start practice',exact:true}).click();
 await expect(page.locator('[data-question-id]')).toHaveCount(10);await expect(page.locator('#practice-progress')).toHaveText('0 of 10 answered');
});
for(const width of [320,768,1440])test(`Practice controls and figures accessible at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await begin(page,'Operations',true);
 const q=page.locator('[data-question-id="operations_0016"]');
 await expect(q.locator('summary')).toHaveText(['View Figure 22','View Figure 31']);
 for(const summary of await q.locator('summary').all()){await summary.focus();await page.keyboard.press('Enter');}
 for(const img of await q.locator('img').all())await expect.poll(()=>img.evaluate(i=>i.complete&&i.naturalWidth>0)).toBeTruthy();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 await checkAxe(page);
});
test('Failed bank fetch offers retry, and no-JavaScript users retain study links',async({page,browser})=>{
 await page.route('**/assets/practice/questions.json',route=>route.abort());await page.goto('/part107/practice-tests/');
 await expect(page.getByRole('button',{name:'Retry loading questions'})).toBeVisible();
 await page.unroute('**/assets/practice/questions.json');await page.getByRole('button',{name:'Retry loading questions'}).click();
 await expect(page.locator('#practice-setup')).toBeVisible();
 const context=await browser.newContext({javaScriptEnabled:false});const nojs=await context.newPage();
 await nojs.goto('http://127.0.0.1:8081/part107/practice-tests/');await expect(nojs.getByText('Enable JavaScript to use the practice quiz.')).toBeVisible();
 await expect(nojs.getByRole('link',{name:'read the study guide',exact:true})).toHaveAttribute('href','/part107/study-guide/');await context.close();
});
