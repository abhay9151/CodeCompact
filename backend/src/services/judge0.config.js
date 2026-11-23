const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const configurationError = (message) => {
    const error = new Error(message);
    error.statusCode = 503;
    error.expose = true;
    return error;
};

const getJudge0Options = (env = process.env) => {
    const baseUrl = env.JUDGEO_BASE_URL;
    const configuredHost = env.JUDGEO_HOST || env.JUDGE0_HOST;
    const key = env.JUDGEO_KEY || env.JUDGE0_KEY;

    if (!baseUrl && !configuredHost) {
        throw configurationError('Judge0 is not configured. Set JUDGEO_BASE_URL or JUDGEO_HOST.');
    }

    let parsedHost;
    try {
        const configuredAddress = baseUrl || configuredHost;
        parsedHost = configuredAddress.includes('://')
            ? new URL(configuredAddress)
            : new URL(`https://${configuredAddress}`);
    } catch {
        throw configurationError('JUDGEO_BASE_URL or JUDGEO_HOST must be a valid Judge0 host or URL.');
    }

    if (!['http:', 'https:'].includes(parsedHost.protocol)) {
        throw configurationError('JUDGEO_BASE_URL or JUDGEO_HOST must use HTTP or HTTPS.');
    }

    const isRapidApiHost = parsedHost.hostname.endsWith('.rapidapi.com');
    const legacyRapidApiHost = !baseUrl && !configuredHost.includes('://');
    if ((isRapidApiHost || legacyRapidApiHost) && !key) {
        throw configurationError('Judge0 hosted access requires JUDGEO_HOST and JUDGEO_KEY.');
    }

    const headers = { 'Content-Type': 'application/json' };
    if (key && (isRapidApiHost || legacyRapidApiHost)) {
        headers['x-rapidapi-key'] = key;
        headers['x-rapidapi-host'] = parsedHost.hostname;
    }

    return {
        baseURL: (baseUrl || (configuredHost.includes('://') ? configuredHost : parsedHost.origin))
            .replace(/\/+$/, ''),
        headers
    };
};

module.exports = { getJudge0Options };
