import {test} from 'node:test';
import assert from 'node:assert/strict';
import {braking,yaw,segments,effective,units,G} from '../public/physics.js';
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
test('frenado: energía cinética y conversión independiente',()=>{
 const v=braking({distance:30,mu:.7});near(v.kmh,73.0613148526633);near(v.mph,v.kmh/1.609344);
});
test('velocidad residual se combina por energía',()=>{
 const stopped=braking({distance:30,mu:.7}).kmh;
 near(braking({distance:30,mu:.7,finalSpeed:40}).kmh**2,stopped**2+1600);
});
test('pendiente en grados: ascenso y descenso',()=>{
 const a=10*Math.PI/180;near(effective(.7,'up',10),.7*Math.cos(a)+Math.sin(a));
 near(effective(.7,'down',10),.7*Math.cos(a)-Math.sin(a));
 assert.ok(braking({distance:30,mu:.7,slope:'up',angle:10}).kmh>braking({distance:30,mu:.7}).kmh);
});
test('yaw usa aceleración centrípeta, no frenado',()=>{
 near(yaw({radius:50,mu:.7}).kmh,Math.sqrt(50*.7*G)*3.6);
 assert.throws(()=>yaw({radius:50,mu:.7,slope:'up',angle:5}));
});
test('tramos iguales equivalen al recorrido único',()=>{
 near(segments([{distance:10,mu:.7},{distance:20,mu:.7}],20).kmh,braking({distance:30,mu:.7,finalSpeed:20}).kmh);
});
test('tramos heterogéneos suman trabajos con pendientes propias',()=>{
 const rows=[{distance:10,mu:.5,slope:'up',angle:5},{distance:15,mu:.3,slope:'down',angle:4}];
 near(segments(rows).kmh,Math.sqrt(2*G*(10*effective(.5,'up',5)+15*effective(.3,'down',4)))*3.6);
});
test('arrastre con final cero representa energía específica disipada',()=>{
 const v=braking({distance:12,mu:.4});near((v.kmh/3.6)**2/2,G*12*.4);
});
test('entradas no físicas y no finitas se rechazan',()=>{
 for(const distance of ['',-1,0,Infinity,NaN,'abc',10001])assert.throws(()=>braking({distance,mu:.7}));
 for(const mu of [0,-.1,3,'',Infinity])assert.throws(()=>braking({distance:30,mu}));
 assert.throws(()=>braking({distance:30,mu:.1,slope:'down',angle:30}));
 assert.throws(()=>effective(.7,'flat',5));assert.throws(()=>effective(.7,'other',0));
 assert.throws(()=>segments([]));assert.throws(()=>yaw({radius:0,mu:.7}));
 assert.throws(()=>braking({distance:30,mu:.7,finalSpeed:-1}));
});
test('conversiones SI exactas',()=>{near(units(.44704).mph,1);near(units(10).kmh,36);});
