// Shared by the browser and regression checks. No storage or network calls.
export function shuffle(items, random = Math.random) {
 const result = [...items];
 for (let i=result.length-1;i>0;i--) {const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
export function selectQuestions(data, bank, count, random = Math.random) {
 if (bank === 'mixed') return shuffle(data.banks.flatMap(name => shuffle(data.questions.filter(q=>q.bank===name),random).slice(0,10)),random);
 const pool=data.questions.filter(q=>q.bank===bank);
 return shuffle(pool,random).slice(0,count==='all'?pool.length:10);
}
export function gradeAnswers(questions, answers) {
 return questions.map(q=>({question:q,selected:answers[q.id],correct:answers[q.id]===q.answerIndex}));
}
