'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:n%1?2:0}).format(n);
const C=window.CHRONICLE_CARE_CATALOGUE;
// One canonical enquiry form (George, 30 Oct): when set, every enquiry button opens the Chronicle OS public form
// instead of this page's dialog. Empty = off: the site behaves exactly as today. Set only after the end-to-end test,
// e.g. 'https://portal.chronicleproperty.com/enquire'.
const OS_ENQUIRE_URL='';
const plans={condo:{},residence:{},estate:{}};
for(const p of C.plans)plans[p.family][p.variant]={name:p.name,weekly:p.weekly_cents/100,fortnight:p.every_14_days_cents/100};
const legacyDestinations={care:'#membership',recurring:'#membership',baseline:'#property-record',record:'#property-record',arrival:'#assistance',vendor:'#assistance',claims:'#assistance',storm:'#assistance'};
const legacyHash=location.hash.slice(1);
const companyRoutes=['aerial','real-estate','construction','mapping','thermal','film','pricing','how-it-works','work','safety','about','faq','contact','legal'];
function routeLegacyHash(){
 const h=location.hash.slice(1);
 if(legacyDestinations[h])location.replace('index.html'+legacyDestinations[h]);
 else if(companyRoutes.includes(h))location.replace('overview.html#'+h);
 else if(h==='quote'&&!dialog.open)openEnquiry();
}
window.addEventListener('hashchange',routeLegacyHash);
let frequency='weekly';
function updatePlans(){
  $$('[data-plan]').forEach(card=>{const p=plans[card.dataset.plan][card.querySelector('select').value];card.querySelector('h3').textContent=p.name;card.querySelector('[data-price]').textContent=p[frequency];card.querySelector('[data-plan-frequency]').textContent=frequency==='weekly'?'With a visit every week':'With a visit every 14 days';});
  $('#frequency-note').textContent=frequency==='weekly'?'Approximately 52 scheduled visits a year. Fifth weekly visits are included.':'Approximately 26 scheduled visits a year, on a rolling 14-day schedule.';
}
$$('[data-frequency]').forEach(b=>b.addEventListener('click',()=>{frequency=b.dataset.frequency;$$('[data-frequency]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});updatePlans();}));
$$('.plan-size').forEach(s=>s.addEventListener('change',updatePlans));
const tasks={
 access:{label:'Vendor access / attendance',kind:'ordinary',minutes:30,note:'One representative. Ordinary access, attendance and a standard record of the work.'},
 arrival:{label:'Arrival / departure preparation',kind:'ordinary',minutes:60,note:'An agreed readiness or departure checklist. Additional purchases or specialist tasks are separate.'},
 shopping:{label:'Shopping & stocking',kind:'ordinary',minutes:90,note:'The job clock includes shopping, travel between stops and stocking. Goods are additional at approved receipt cost.'},
 walkthrough:{label:'One-off walkthrough',kind:'ordinary',minutes:45,note:'Visual observations and a standard report for the agreed accessible scope. Time depends on your property.'},
 mail:{label:'Mail / light household task',kind:'ordinary',minutes:30,note:'One dedicated attendance. If we are already on a scheduled visit, ordinary extras are $20 per additional 15 minutes.'},
 storm:{label:'Pre- / post-storm observations',kind:'ordinary',minutes:60,note:'Agreed light tasks or ground-level observations, subject to crew capacity and safe access. Each separate visit has its own minimum.'},
 practical:{label:'Defined practical setup',kind:'practical',minutes:60,note:'One suitably trained representative for a pre-scoped practical task. This tariff is agreed beforehand; licensed or hazardous work is separate.'},
 crew:{label:'Two-person ordinary crew',kind:'crew',minutes:60,note:'Two representatives, one crew price. A 60-minute minimum applies; specialist or skilled two-person work requires a separate quote.'},
 remote:{label:'Remote coordination',kind:'remote',minutes:30,note:'No attendance fee. Substantive remote coordination is $60/hour, billed in 15-minute units. Ordinary report questions remain included.'}
};
function calculate(kind,minutes,timing='normal'){
 const tariff=C.assistance[kind];
 const blocks=Math.ceil(Math.max(0,minutes-tariff.minimum_minutes)/tariff.increment_minutes);
 const extraCents=blocks*tariff.increment_cents;
 let surchargeCents=0;
 if(kind!=='remote'){
  if(timing==='after')surchargeCents=Math.round((tariff.minimum_cents+extraCents)*(C.modifiers.accepted_after_hours_multiplier-1));
  else if(timing==='urgent')surchargeCents=C.modifiers.accepted_same_day_daytime_cents;
 }
 return {base:tariff.minimum_cents/100,extra:extraCents/100,min:tariff.minimum_minutes,blocks,
 label:kind==='remote'?'First 15 minutes of coordination':kind==='crew'?'Crew attendance & first 60 minutes':'Attendance & first 30 minutes',
 surcharge:surchargeCents/100,total:(tariff.minimum_cents+extraCents+surchargeCents)/100};
}
function updateEstimate(){const task=tasks[$('#task').value],minutes=Number($('#duration').value),timing=$('#timing').value,result=calculate(task.kind,minutes,timing);$('#task-note').textContent=task.note;
 const rows=[[result.label,money(result.base)]];if(result.extra)rows.push([`Additional ${result.blocks*15} minutes`,money(result.extra)]);if(result.surcharge)rows.push([timing==='after'?'After-hours adjustment (50%)':'Accepted same-day dispatch',money(result.surcharge)]);
 const breakdown=$('#estimate-breakdown');breakdown.replaceChildren(...rows.map(([label,value])=>{let r=document.createElement('div'),l=document.createElement('span'),v=document.createElement('strong');l.textContent=label;v.textContent=value;r.append(l,v);return r;}));$('#estimate-total').textContent=money(result.total);
}
function setTask(key){$('#task').value=key;const task=tasks[key],durations=task.kind==='remote'?[15,30,45,60,90,120]:task.kind==='crew'?[60,90,120,180]:[30,45,60,90,120,180];$('#duration').replaceChildren(...durations.map(n=>new Option(`${n} minutes`,n)));$('#duration').value=task.minutes;$('#timing-field').hidden=task.kind==='remote';if(task.kind==='remote')$('#timing').value='normal';$$('[data-service]').forEach(b=>b.classList.toggle('selected',b.dataset.service===key));updateEstimate();}
$('#task').addEventListener('change',()=>setTask($('#task').value));$('#duration').addEventListener('change',updateEstimate);$('#timing').addEventListener('change',updateEstimate);
$$('[data-service]').forEach(b=>b.addEventListener('click',()=>{setTask(b.dataset.service);if(innerWidth<801)$('#estimate-title').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}));
const mobile=$('#mobile-nav'),toggle=$('.menu-toggle');toggle.addEventListener('click',()=>{mobile.hidden=!mobile.hidden;toggle.setAttribute('aria-expanded',String(!mobile.hidden));toggle.setAttribute('aria-label',mobile.hidden?'Open navigation':'Close navigation');});$$('#mobile-nav a').forEach(a=>a.addEventListener('click',()=>{mobile.hidden=true;toggle.setAttribute('aria-expanded','false');}));
const dialog=$('#enquiry-dialog');let enquiryContext='';
function openEnquiry(family,assistance=false){if(OS_ENQUIRE_URL)return openOsEnquiry(family,assistance);enquiryContext='';$('#enquiry-result').hidden=true;$('#enquiry-form-view').hidden=false;$('#copy-status').textContent='';$('#enquiry-interest').value=assistance?'One-off assistance':'Recurring homewatch';
 if(family){const p=plans[family][$(`#${family}-size`).value];$('#enquiry-property').selectedIndex=family==='condo'?0:family==='residence'?1:2;enquiryContext=`${p.name}; ${frequency==='weekly'?'weekly':'every 14 days'}; ${family==='estate'?'from ':''}${money(p[frequency])}/month, subject to agreed scope.`;}
 if(assistance){const t=tasks[$('#task').value];enquiryContext=`${t.label}; ${$('#duration').value} minutes; ${$('#timing-field').hidden?'remote':$('#timing').selectedOptions[0].textContent}; indicative estimate ${$('#estimate-total').textContent}.`;}
 $('#enquiry-details').value=enquiryContext;document.body.classList.add('dialog-open');dialog.showModal();}
function openOsEnquiry(family,assistance){let context='';
 if(family){const p=plans[family][$(`#${family}-size`).value];context=`${p.name}; ${frequency==='weekly'?'weekly':'every 14 days'}; ${family==='estate'?'from ':''}${money(p[frequency])}/month, subject to agreed scope.`;}
 if(assistance){const t=tasks[$('#task').value];context=`${t.label}; ${$('#duration').value} minutes; ${$('#timing-field').hidden?'remote':$('#timing').selectedOptions[0].textContent}; indicative estimate ${$('#estimate-total').textContent}.`;}
 const q=new URLSearchParams({catalogue:C.version});if(family)q.set('family',family);if(assistance)q.set('interest','assistance');if(context)q.set('context',context);
 location.href=`${OS_ENQUIRE_URL}?${q}`;}
$$('[data-enquire]').forEach(b=>b.addEventListener('click',()=>openEnquiry(b.dataset.family)));$('#enquire-assistance').addEventListener('click',()=>openEnquiry(null,true));$('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
$('#enquiry-form').addEventListener('submit',async e=>{
 e.preventDefault();
 const form=e.currentTarget,values=new FormData(form),button=form.querySelector('button[type="submit"]'),status=$('#enquiry-status');
 if(values.get('website'))return;
 if(button.disabled)return;
 button.disabled=true;button.textContent='Sending…';status.textContent='';
 const payload={_subject:'Website enquiry — '+values.get('interest')+' — '+values.get('name'),_replyto:values.get('email'),_template:'table',_captcha:'false',_honey:'',
 Name:values.get('name'),Email:values.get('email'),Phone:values.get('phone')||'—','Property area':values.get('location'),
 'Interested in':values.get('interest'),'Property type':values.get('property'),Message:values.get('details')||'—','Care catalogue version':C.version};
 try{
  const response=await fetch('https://formsubmit.co/ajax/info@chronicleproperty.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)});
  const result=await response.json();if(!response.ok||String(result.success)!=='true')throw new Error('Email submission failed');
  $('#enquiry-summary').textContent=`CHRONICLE — ENQUIRY SUMMARY\n\nName: ${values.get('name')}\nEmail: ${values.get('email')}\nInterest: ${values.get('interest')}\nProperty: ${values.get('property')}\nArea: ${values.get('location')}\n\n${values.get('details')||'Scope and dates to discuss.'}\n\nCatalogue: ${C.version}\nEnquiry accepted by the email service. Scope, price and availability require separate confirmation.`;
  $('#enquiry-form-view').hidden=true;$('#enquiry-result').hidden=false;$('#copy-enquiry').focus();
 }catch{status.replaceChildren(document.createTextNode('We could not send your enquiry. Please email '));const link=document.createElement('a');link.href='mailto:info@chronicleproperty.com';link.textContent='info@chronicleproperty.com';status.append(link,document.createTextNode(' or call (239) 380-9403. Your details remain here to copy.'));}
 finally{button.disabled=false;button.innerHTML='Request my proposal <span aria-hidden="true">↗</span>';}
});
$('#copy-enquiry').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#enquiry-summary').textContent);$('#copy-status').textContent='Summary copied.';}catch{$('#copy-status').textContent='Select the summary above to copy it.';}});$('#edit-enquiry').addEventListener('click',()=>{$('#enquiry-result').hidden=true;$('#enquiry-form-view').hidden=false;$('#enquiry-location').focus();});
setTask('access');updatePlans();

routeLegacyHash();
