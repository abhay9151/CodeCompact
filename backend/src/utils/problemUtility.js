const getLanguageById = (language) => {
    const languageIds = {
        'c++': 54,
        cpp: 54,
        java: 62,
        javascript: 63
    };

    return languageIds[language.toLowerCase()];
};

module.exports = { getLanguageById };
