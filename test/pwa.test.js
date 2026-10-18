import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
test('manifest e iconos instalables presentes',async()=>{
 const m=JSON.parse(await readFile('public/manifest.webmanifest','utf8'));
 assert.equal(m.display,'standalone');assert.equal(m.scope,'./');
 for(const icon of m.icons){const b=await readFile('public/'+icon.src);assert.equal(b.readUInt32BE(16),parseInt(icon.sizes));assert.equal(b.readUInt32BE(20),parseInt(icon.sizes));}
});
test('todos los recursos precacheados existen',async()=>{
 const sw=await readFile('public/sw.js','utf8');
 const assets=sw.match(/const ASSETS=\[(.*?)\]/s)[1].matchAll(/'([^']+)'/g);
 for(const [,file] of assets)await access('public/'+(file==='./'?'index.html':file));
});
