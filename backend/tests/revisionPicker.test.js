const test = require('node:test');
const assert = require('node:assert/strict');
const { shuffle, pickForRevision } = require('../src/utils/revisionPicker');

test('shuffle returns every input item once without mutating its input', () => {
    const questions = ['a', 'b', 'c', 'd'];
    const shuffled = shuffle(questions, () => 0);

    assert.deepEqual([...shuffled].sort(), questions);
    assert.deepEqual(questions, ['a', 'b', 'c', 'd']);
    assert.notDeepEqual(shuffled, questions);
});

test('smart picks flagged questions first, then least revised, then oldest', () => {
    const questions = [
        { id: 'recent', revisionCount: 0, lastRevisedAt: '2025-02-01' },
        { id: 'flagged', markedForRevision: true, revisionCount: 8 },
        { id: 'never', revisionCount: 0, lastRevisedAt: null },
        { id: 'older', revisionCount: 0, lastRevisedAt: '2025-01-01' },
        { id: 'more-revised', revisionCount: 1, lastRevisedAt: null },
    ];
    const picked = pickForRevision(questions, 5, 'smart', () => 0.5);

    assert.deepEqual(picked.map((question) => question.id), [
        'flagged',
        'never',
        'older',
        'recent',
        'more-revised',
    ]);
});

test('random mode returns at most the requested number of items', () => {
    const questions = [{ id: 1 }, { id: 2 }, { id: 3 }];

    assert.deepEqual(pickForRevision(questions, 2, 'random', () => 0), [
        { id: 2 },
        { id: 3 },
    ]);
});

test('smart ties use the injected random source as a tie-breaker', () => {
    const questions = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const picked = pickForRevision(questions, 3, 'smart', () => 0.25);

    assert.deepEqual(picked, questions);
});
