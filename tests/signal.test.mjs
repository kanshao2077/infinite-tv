import test from 'node:test';
import assert from 'node:assert/strict';
import { signalAnomaly } from '../src/effects/signal.ts';
import { hash } from '../src/core/math.ts';

test('signal anomalies have 20–40 s spacing, brief duration and a smooth bounded envelope', () => {
  let previous = null;
  for (let slot = 0; slot < 100; slot++) {
    const start = slot * 30 + 10 + hash(slot + 113) * 10;
    const duration = 0.12 + hash(slot + 317) * 0.08;
    if (previous !== null) assert.ok(start - previous >= 20 && start - previous <= 40);
    assert.equal(signalAnomaly(start - 0.01, 0), 0);
    assert.equal(signalAnomaly(start + duration + 0.01, 0), 0);
    assert.ok(signalAnomaly(start + duration / 2, 0) > 0.5);
    assert.ok(signalAnomaly(start + duration / 2, 0) <= 1);
    previous = start;
  }
});

test('layer variation is deterministic and does not need persistent layer resources', () => {
  for (const id of [0, 1, 1000, 1000000000]) {
    assert.equal(hash(id), hash(id));
    assert.equal(signalAnomaly(25.1, id), signalAnomaly(25.1, id));
  }
});
