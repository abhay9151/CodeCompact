const shuffle = (items, random = Math.random) => {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const otherIndex = Math.floor(random() * (index + 1));
        [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
    }

    return shuffled;
};

const timestamp = (value) => {
    if (!value) {
        return Number.NEGATIVE_INFINITY;
    }

    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
};

const pickForRevision = (questions, count, mode = 'smart', random = Math.random) => {
    if (mode === 'random') {
        return shuffle(questions, random).slice(0, count);
    }

    return questions
        .map((question) => ({ question, tieBreaker: random() }))
        .sort((left, right) => {
            const flaggedDifference = Number(Boolean(right.question.markedForRevision))
                - Number(Boolean(left.question.markedForRevision));
            if (flaggedDifference !== 0) {
                return flaggedDifference;
            }

            const countDifference = (left.question.revisionCount || 0)
                - (right.question.revisionCount || 0);
            if (countDifference !== 0) {
                return countDifference;
            }

            const dateDifference = timestamp(left.question.lastRevisedAt)
                - timestamp(right.question.lastRevisedAt);
            return dateDifference || left.tieBreaker - right.tieBreaker;
        })
        .slice(0, count)
        .map(({ question }) => question);
};

module.exports = { shuffle, pickForRevision };
