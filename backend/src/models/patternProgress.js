const mongoose = require('mongoose');
const { Schema } = mongoose;

const patternProgressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'patternQuestion',
        required: true,
    },
    solved: {
        type: Boolean,
        default: false,
    },
    solvedAt: {
        type: Date,
        default: null,
    },
    markedForRevision: {
        type: Boolean,
        default: false,
    },
    revisionCount: {
        type: Number,
        default: 0,
    },
    lastRevisedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

patternProgressSchema.index({ userId: 1, questionId: 1 }, { unique: true });
patternProgressSchema.index({ userId: 1, solved: 1 });

module.exports = mongoose.model('patternProgress', patternProgressSchema);
