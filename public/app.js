import {surfaces, braking, yaw, segments} from './physics.js';
import {longitudinalFormula} from './formulas.js';
const models = [
 ['Frenado recto','Balance de energía en una trayectoria longitudinal.'],
 ['Frenado con ABS','Estimación con fricción efectiva de frenado validada.'],
 ['Derrape lateral · yaw','Velocidad crítica ideal a partir del radio de trayectoria.'],
 ['Frenado y derrape','Dos estimaciones independientes, sin suma de velocidades.'],
 ['Arrastre postimpacto','Velocidad equivalente disipada durante el arrastre.'],
 ['Tramos consecutivos','Balance de energía por etapas longitudinales y superficies.']
];
let mode = 0;
let rowId = 0;
const $ = s => document.querySelector(s);
const input = (name,title,value,min,max,step='any') => `<label>${title}<input name="${name}" type="number" value="${value}" min="${min}" max="${max}" step="${step}" required></label>`;
function road(prefix='') {return `<label>Superficie<select name="${prefix}surface" data-surface="${prefix}">${surfaces.map(([s],i)=>`<option value="${i}">${s}</option>`).join('')}</select></label>${input(prefix+'mu','Coeficiente μ (editable)',.7,.01,2)}<label>Pendiente<select name="${prefix}slope" data-slope="${prefix}"><option value="flat">Plana</option><option value="up">Ascendente</option><option value="down">Descendente</option></select></label><label>Ángulo longitudinal (°)<input name="${prefix}angle" type="number" min="0" max="45" step="any" value="0" disabled required></label>`;}
function longitudinal(prefix='') {return `<div class="grid">${input(prefix+'distance','Distancia recorrida (m)',30,.01,10000)}${road(prefix)}</div>`;}
function lateral() {return `<fieldset><legend>Estimación lateral independiente</legend><div class="grid">${input('radius','Radio de trayectoria (m)',50,.1,10000)}${input('lateralMu','Coeficiente lateral μₗ (editable)',.7,.01,2)}</div><p class="hint">Radio del centro de masa. Solo calzada horizontal sin peralte; no se utiliza la pendiente longitudinal.</p></fieldset>`;}
function resetResult(){ $('#result').innerHTML='<p class="eyebrow">RESULTADO DEL ANÁLISIS</p><p>Datos pendientes de cálculo.</p>'; $('#error').textContent=''; }
function addSegment(){ if ($$('.segment').length>=20) return; const id=++rowId; const box=document.createElement('div');box.className='segment';box.dataset.prefix=`s${id}-`;box.innerHTML=`<div class="segment-head"><b>Tramo ${id}</b><button type="button" data-remove>Eliminar</button></div>${longitudinal(`s${id}-`)}`;$('#segments').append(box);resetResult(); }
function $$(s){return [...document.querySelectorAll(s)];}
function render(){
 $$('#models button').forEach((b,i)=>{b.classList.toggle('active',i===mode);b.setAttribute('aria-pressed',i===mode);});
 $('#model-number').textContent=String(mode+1).padStart(2,'0');$('#model-title').textContent=models[mode][0];$('#model-description').textContent=models[mode][1];
 let html='';
 if(mode===5) html='<div id="segments"></div><button type="button" id="add-segment">+ Añadir tramo</button>';
 else if(mode===2) html=lateral();
 else html=longitudinal();
 if([0,1,3,5].includes(mode)) html+=`<div class="grid" style="margin-top:20px">${input('finalSpeed','Velocidad al final del frenado (km/h)',0,0,500)}</div><p class="hint">0 supone detención. Si hay impacto o velocidad residual, debe determinarse independientemente.</p>`;
 if(mode===3) html+=`<hr>${lateral()}`;
 if(mode===1) html+='<p class="notice">ABS: no se aplica un factor corrector universal. Las huellas visibles pueden ser parciales o discontinuas. Sustituye μ por un valor efectivo obtenido en ensayos representativos; el pavimento seleccionado solo aporta una referencia inicial.</p>';
 if(mode===4) html+='<p class="notice">El resultado expresa energía específica disipada como velocidad equivalente. No permite deducir la velocidad preimpacto ni el Δv de la colisión. Valida el factor de arrastre según daños, orientación y estado de las ruedas.</p>';
 if(mode===3) html+='<p class="notice">El frenado y el yaw se presentan por separado. No sumar sus velocidades ni sus cuadrados: no se ha establecido una secuencia energética compatible. El modelo yaw simple tampoco describe frenado y derrape simultáneos.</p>';
 html+='<p class="hint">Coeficientes orientativos sin certificación. Documenta mediciones y justifica cada valor antes de un uso pericial.</p>';
 $('#fields').innerHTML=html;if(mode===5){rowId=0;addSegment();addSegment();}resetResult();
}
models.forEach(([title],i)=>{const b=document.createElement('button');b.type='button';b.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span>${title}`;b.onclick=()=>{mode=i;render();};$('#models').append(b);});
$('#fields').addEventListener('click',e=>{if(e.target.id==='add-segment')addSegment();if(e.target.hasAttribute('data-remove')){e.target.closest('.segment').remove();resetResult();}});
$('#calculator').addEventListener('input',resetResult);
$('#fields').addEventListener('change',e=>{
 if(e.target.hasAttribute('data-surface')){const p=e.target.dataset.surface;$('#calculator').elements[p+'mu'].value=surfaces[Number(e.target.value)][1];}
 if(e.target.hasAttribute('data-slope')){const p=e.target.dataset.slope,a=$('#calculator').elements[p+'angle'];a.disabled=e.target.value==='flat';if(a.disabled)a.value=0;}
 resetResult();
});
const format=n=>n.toLocaleString('es-HN',{minimumFractionDigits:1,maximumFractionDigits:1});
function card(title,v,explanation){return `<div class="result-card"><p>${title}</p><div class="value">${format(v.kmh)} <small>km/h</small></div><div class="secondary-value">${format(v.mph)} mph</div><p>${explanation}</p></div>`;}
$('#calculator').addEventListener('submit',e=>{e.preventDefault();resetResult();try{
 const form=e.currentTarget; const get=n=>form.elements[n]?.value;
 const data=p=>({distance:get(p+'distance'),mu:get(p+'mu'),slope:get(p+'slope'),angle:get(p+'angle'),finalSpeed:get('finalSpeed')??0});
 let result='';
 if(mode===2||mode===3) result=card('Velocidad crítica ideal · yaw',yaw({radius:get('radius'),mu:get('lateralMu')}),'v = √(gRμₗ). Horizontal, sin peralte y sin frenado simultáneo.');
 if(mode===5) result=card('Velocidad al inicio de los tramos',segments($$('.segment').map(r=>data(r.dataset.prefix)),get('finalSpeed')),'vᵢ = √(v𝒇² + 2g Σ(dᵢ fₑᵢ)). Se combinan trabajos, no velocidades.');
 else if(mode!==2) result=card(mode===4?'Velocidad equivalente disipada':'Velocidad al inicio del frenado',braking(data('')),longitudinalFormula(get('slope'),mode===4)+(mode===4?' Energía del recorrido; no velocidad preimpacto.':' Solo el recorrido y los supuestos introducidos.'))+result;
 $('#result').innerHTML='<p class="eyebrow">ESTIMACIÓN CON LOS DATOS INTRODUCIDOS</p>'+result+'<p>Resultado condicionado al modelo. No incluye incertidumbre ni valida la evidencia.</p>';
 }catch(err){$('#error').textContent=err.message;}});
render();
function connection(){ $('#connection').textContent=navigator.onLine?'En línea':'Sin conexión'; }
window.addEventListener('online',connection);window.addEventListener('offline',connection);connection();
let installPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#install').hidden=false;});$('#install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;$('#install').hidden=true;}};
window.addEventListener('appinstalled',()=>{$('#install').hidden=true;});
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{$('#offline-status').textContent='Disponible sin conexión en este dispositivo';}).catch(()=>{$('#offline-status').textContent='Sin conexión no disponible: recarga con HTTPS o localhost.';});}else $('#offline-status').textContent='Este navegador no admite uso sin conexión.';
