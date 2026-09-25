import {shuffle, selectQuestions, gradeAnswers} from './engine.js';
const root=document.querySelector('#practice-app');
const find=id=>root.querySelector('#'+id);
const status=find('practice-status');
find('practice-fallback').hidden=true;
let data, questions=[];
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function figureMarkup(q) {
 return q.figures.map(number=>{
  const figure=data.figures[number];
  return `<details class="practice-figure"><summary>View Figure ${esc(number)}</summary><figure><a href="${esc(figure.url)}" target="_blank" rel="noopener">Open Figure ${esc(number)} full size (new tab)</a><img src="${esc(figure.url)}" alt="${esc(figure.alt)}" loading="lazy"><figcaption>Figure ${esc(number)} · FAA testing supplement</figcaption></figure>${figure.transcript?`<details><summary>Read the report text</summary><pre>${esc(figure.transcript)}</pre></details>`:''}<p class="practice-image-error" hidden>The figure could not load. Try its full-size link before answering.</p></details>`;
 }).join('');
}
function watchImages() {
 root.querySelectorAll('.practice-figure img').forEach(img=>img.addEventListener('error',()=>{img.closest('.practice-figure').querySelector('.practice-image-error').hidden=false;}));
}
async function load() {
 find('practice-retry').hidden=true;status.textContent='Loading question banks…';
 try {
  const response=await fetch('/assets/practice/questions.json');
  if(!response.ok)throw new Error('Question bank unavailable');
  data=await response.json();
  if(!Array.isArray(data.questions)||!data.questions.length||!Array.isArray(data.banks)||!data.figures)throw new Error('Invalid question bank');
  if(data.questions.some(q=>!Number.isInteger(q.answerIndex)||q.answerIndex<0||q.answerIndex>=q.choices.length||q.figures.some(n=>!data.figures[n])))throw new Error('Invalid question');
  find('practice-bank').innerHTML='<option value="mixed">Mixed — 10 from each topic</option>'+data.banks.map(bank=>`<option value="${esc(bank)}">${esc(bank)} (${data.questions.filter(q=>q.bank===bank).length} available)</option>`).join('');
  find('practice-setup').hidden=false;setCount();
  status.textContent=`${data.questions.length} questions available across five topics.`;
 } catch {
  status.textContent='The practice questions could not load. Check your connection and try again.';
  find('practice-retry').hidden=false;
 }
}
function setCount(){
 const mixed=find('practice-bank').value==='mixed';
 find('practice-count').disabled=mixed;
 find('practice-count').options[0].textContent=mixed?'50 questions — 10 per topic':'10 questions';
 if(mixed)find('practice-count').value='10';
}
function focusHeading(node){node.focus();node.scrollIntoView({block:'start',behavior:'instant'});}
function start(event){
 event.preventDefault();
 questions=selectQuestions(data,find('practice-bank').value,find('practice-count').value);
 find('practice-questions').innerHTML=questions.map((q,i)=>`<fieldset class="practice-question" data-question-id="${esc(q.id)}"><legend tabindex="-1">${i+1}. ${esc(q.prompt)}</legend><p class="practice-question-meta">${esc(q.bank)} · Reference ${esc(q.sourceCode)}</p>${figureMarkup(q)}<div class="practice-choices">${shuffle(q.choices.map((text,index)=>({text,index}))).map(c=>`<label><input type="radio" name="${esc(q.id)}" value="${c.index}"><span>${esc(c.text)}</span></label>`).join('')}</div></fieldset>`).join('');
 find('practice-setup').hidden=true;find('practice-results').hidden=true;find('practice-results').replaceChildren();
 find('practice-session').hidden=false;find('practice-quiz').hidden=false;find('practice-incomplete').textContent='';
 status.textContent='Practice in progress. Select one answer for each question.';
 updateProgress();watchImages();focusHeading(root.querySelector('legend'));
}
function updateProgress(){
 const answered=find('practice-quiz').querySelectorAll('input:checked').length;
 find('practice-progress').textContent=`${answered} of ${questions.length} answered`;
}
function grade(event){
 event.preventDefault();
 const answers=Object.fromEntries([...new FormData(find('practice-quiz'))].map(([id,value])=>[id,Number(value)]));
 const missing=questions.filter(q=>answers[q.id]===undefined);
 if(missing.length){
  find('practice-incomplete').textContent=`Answer the remaining ${missing.length} question${missing.length===1?'':'s'} before checking.`;
  focusHeading(root.querySelector(`[data-question-id="${missing[0].id}"] legend`));return;
 }
 const graded=gradeAnswers(questions,answers), correct=graded.filter(r=>r.correct).length;
 find('practice-results').innerHTML=`<h2 id="practice-results-heading" tabindex="-1">Practice results: ${correct} of ${questions.length} correct (${Math.round(100*correct/questions.length)}%)</h2><p>Review your answers below. This practice score is not an FAA test result.</p><button type="button" class="button" id="practice-again">Choose another practice quiz</button>`+graded.map(({question:q,selected,correct},i)=>`<section class="practice-review ${correct?'practice-correct':'practice-incorrect'}" data-review-id="${esc(q.id)}"><h3>${i+1}. ${esc(q.prompt)}</h3><p><strong>${correct?'Correct':'Incorrect'}</strong> · ${esc(q.bank)} · Reference ${esc(q.sourceCode)}</p><p>Your answer: ${esc(q.choices[selected])}</p>${correct?'':`<p>Correct answer: <strong>${esc(q.choices[q.answerIndex])}</strong></p>`}${figureMarkup(q)}</section>`).join('');
 find('practice-session').hidden=true;find('practice-results').hidden=false;status.textContent='Practice complete. Review your answers or choose another quiz.';
 find('practice-again').addEventListener('click',reset);watchImages();focusHeading(find('practice-results-heading'));
}
function reset(){
 questions=[];find('practice-session').hidden=true;find('practice-results').hidden=true;
 find('practice-questions').replaceChildren();find('practice-results').replaceChildren();
 find('practice-setup').hidden=false;status.textContent='Ready for a new practice quiz.';focusHeading(find('practice-bank'));
}
find('practice-bank').addEventListener('change',setCount);
find('practice-setup').addEventListener('submit',start);
find('practice-quiz').addEventListener('change',updateProgress);
find('practice-quiz').addEventListener('submit',grade);
find('practice-reset').addEventListener('click',reset);
find('practice-retry').addEventListener('click',load);
load();
