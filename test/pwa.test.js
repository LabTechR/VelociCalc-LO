import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/build.mjs']);
test('manifest e iconos instalables presentes',async()=>{
 const m=JSON.parse(await readFile('public/manifest.webmanifest','utf8'));
 assert.equal(m.display,'standalone');assert.equal(m.scope,'./');
 for(const icon of m.icons){const b=await readFile('public/'+icon.src);assert.equal(b.readUInt32BE(16),parseInt(icon.sizes));assert.equal(b.readUInt32BE(20),parseInt(icon.sizes));}
});
test('todos los recursos precacheados existen',async()=>{
 const sw=await readFile('public/sw.js','utf8');
 const assets=sw.match(/const ASSETS=\[(.*?)\]/s)[1].matchAll(/'([^']+)'/g);
 for(const [,file] of assets)await access('dist/'+(file==='./'?'index.html':file));
});
test('el paquete publicado arranca la interfaz y calcula sin módulos remotos',async()=>{
 const {runInNewContext}=await import('node:vm');
 const elements=new Map();
 const element=()=>({innerHTML:'',textContent:'',dataset:{},children:[],classList:{toggle(){}},setAttribute(){},addEventListener(type,fn){this[type]=fn;},append(b){this.children.push(b);}});
 const document={querySelector(s){if(!elements.has(s))elements.set(s,element());return elements.get(s);},querySelectorAll(s){return s==='#models button'?document.querySelector('#models').children:[];},createElement:element};
 const bundle=await readFile('dist/app.bundle.js','utf8');
 const html=await readFile('dist/index.html','utf8');
 assert.match(html,/<script defer src="\.\/app.bundle.js"><\/script>/);
 runInNewContext(bundle,{document,window:{addEventListener(){}},navigator:{onLine:true}});
 assert.equal(document.querySelector('#models').children.length,6);
 assert.equal(document.querySelector('#model-title').textContent,'Frenado recto');
 assert.match(document.querySelector('#fields').innerHTML,/Distancia recorrida/);
 const values={distance:30,mu:.7,slope:'flat',angle:0,finalSpeed:0};
 document.querySelector('#calculator').submit({preventDefault(){},currentTarget:{elements:Object.fromEntries(Object.entries(values).map(([k,value])=>[k,{value}]))}});
 assert.match(document.querySelector('#result').innerHTML,/73[.,]1/);
 for(const button of document.querySelector('#models').children.slice(0,5))button.onclick();
 assert.equal(document.querySelector('#model-title').textContent,'Arrastre postimpacto');
});
