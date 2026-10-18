import {cp,mkdir,access} from 'node:fs/promises';
await access('public/icons/icon-192.png'); await access('public/icons/icon-512.png');
await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
console.log('Sitio estático generado en dist/');
