require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const PatternQuestion = require('../src/models/patternQuestion');

const seed = async () => {
    if (!process.env.DB_CONNECT_STRING) {
        throw new Error('DB_CONNECT_STRING is required');
    }

    const patterns = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/patternSheet.json'), 'utf8')
    );
    const operations = patterns.flatMap((entry) => entry.questions.map((question, index) => {
        const patternOrder = entry.order;
        const key = `${patternOrder}:${question.slug}`;

        return {
            updateOne: {
                filter: { key },
                update: {
                    $set: {
                        pattern: entry.pattern,
                        patternOrder,
                        order: index + 1,
                        title: question.title,
                        platform: question.platform,
                        url: question.url,
                    },
                    $setOnInsert: { key },
                },
                upsert: true,
            },
        };
    }));

    await mongoose.connect(process.env.DB_CONNECT_STRING, {
        dbName: process.env.DB_NAME || undefined,
    });
    const result = await PatternQuestion.bulkWrite(operations, { ordered: false });
    console.log(`Inserted ${result.upsertedCount}; updated ${result.modifiedCount}.`);
};

seed()
    .catch((error) => {
        console.error('Pattern seed failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });
