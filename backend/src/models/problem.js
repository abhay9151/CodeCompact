const mongoose = require('mongoose');
const { Schema } = mongoose;

const testCaseSchema = new Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, required: true }
}, { _id: false });

const hiddenTestCaseSchema = new Schema({
    input: { type: String, required: true },
    output: { type: String, required: true }
}, { _id: false });

const problemSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    tags: {
        type: String,
        enum: ['array', 'linkedList', 'graph', 'dp', 'string', 'tree', 'math', 'binarySearch', 'stack', 'greedy'],
        required: true
    },
    visibleTestCases: { type: [testCaseSchema], required: true },
    hiddenTestCases: { type: [hiddenTestCaseSchema], required: true },
    startCode: {
        type: [{
            language: {
                type: String,
                enum: ['C++', 'Java', 'JavaScript'],
                required: true
            },
            initialCode: { type: String, required: true }
        }],
        required: true
    },
    referenceSolution: {
        type: [{
            language: {
                type: String,
                enum: ['C++', 'Java', 'JavaScript'],
                required: true
            },
            completeCode: { type: String, required: true }
        }],
        required: true
    },
    problemCreator: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, { timestamps: true });

problemSchema.index({ difficulty: 1, tags: 1 });

module.exports = mongoose.model('problem', problemSchema);
