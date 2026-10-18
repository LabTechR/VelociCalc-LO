import {test} from 'node:test';
import assert from 'node:assert/strict';
import {longitudinalFormula} from '../public/formulas.js';
test('fórmulas visibles distinguen pendiente y energía de arrastre',()=>{
 assert.equal(longitudinalFormula('flat'),'Plana: vᵢ = √(v𝒇² + 2gdμ).');
 assert.equal(longitudinalFormula('up'),'Ascendente: vᵢ = √(v𝒇² + 2gd(μ cos θ + sen θ)).');
 assert.equal(longitudinalFormula('down'),'Descendente: vᵢ = √(v𝒇² + 2gd(μ cos θ − sen θ)).');
 assert.equal(longitudinalFormula('down',true),'Descendente: vₑ = √(2gd(μ cos θ − sen θ)).');
});
