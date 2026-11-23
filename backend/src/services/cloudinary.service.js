const cloudinary = require('cloudinary').v2;

const configureCloudinary = () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiBaseUrl = process.env.CLOUDINARY_API_BASE_URL;

    if (!cloudName || !apiKey || !apiSecret || !apiBaseUrl) {
        throw new Error('Cloudinary environment variables are not configured');
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        upload_prefix: apiBaseUrl
    });

    return { cloudName, apiKey, apiSecret, apiBaseUrl };
};

const getVideoUploadUrl = (cloudName, apiBaseUrl) => (
    `${apiBaseUrl.replace(/\/+$/, '')}/v1_1/${encodeURIComponent(cloudName)}/video/upload`
);

module.exports = { cloudinary, configureCloudinary, getVideoUploadUrl };
