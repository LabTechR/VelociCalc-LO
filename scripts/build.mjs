import {cp,mkdir,access,readFile,writeFile} from 'node:fs/promises';
await access('public/icons/icon-192.png'); await access('public/icons/icon-512.png');
await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
const physics=(await readFile('public/physics.js','utf8')).replace(/^export /gm,'');
const app=(await readFile('public/app.js','utf8')).replace(/^import .*?;\r?\n/,'');
await writeFile('dist/app.bundle.js',`(()=>{\n${physics}\n${app}\n})();\n`);
const html=await readFile('public/index.html','utf8');
await writeFile('dist/index.html',html.replace('<script type="module" src="./app.js"></script>','<script defer src="./app.bundle.js"></script>'));
console.log('Sitio estático generado en dist/');
