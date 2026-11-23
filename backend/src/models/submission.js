const mongoose = require('mongoose');
const { Schema } = mongoose;

const submissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    },
    code: { type: String, required: true },
    language: {
        type: String,
        enum: ['javascript', 'c++', 'java'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'wrong_answer', 'time_limit', 'compile_error', 'runtime_error'],
        required: true
    },
    runtime: { type: Number },
    runtimeMs: { type: Number, validate: Number.isInteger },
    memory: { type: Number },
    errorMessage: { type: String },
    testCasesPassed: { type: Number, default: 0 },
    testCasesTotal: { type: Number, required: true }
}, { timestamps: true });

submissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });

module.exports = mongoose.model('submission', submissionSchema);
