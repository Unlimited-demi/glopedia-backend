// ocrUtils.js
const Tesseract = require('tesseract.js');

const extractTextFromImage = async (imagePath) => {
    try {
      const { data } = await Tesseract.recognize(
         imagePath,
         'eng',
      );
      return data.text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Error during OCR processing');
    }
  };

module.exports = { extractTextFromImage };