import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readOpenAIKey} from '../lib/server-config-core.ts';

test('server configuration normalizes empty and whitespace-only credentials',()=>{
 for(const value of [undefined,'','   ','\n\t'])assert.equal(readOpenAIKey({OPENAI_API_KEY:value}),undefined);
 const fixture=randomUUID();
 assert.equal(readOpenAIKey({OPENAI_API_KEY:` ${fixture}\n`}),fixture);
});

test('server configuration reads each supplied environment without retaining the previous credential',()=>{
 const fixture=randomUUID();
 const environment={OPENAI_API_KEY:fixture};
 assert.equal(readOpenAIKey(environment),fixture);
 environment.OPENAI_API_KEY='';
 assert.equal(readOpenAIKey(environment),undefined);
});
