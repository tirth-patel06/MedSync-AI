/**
 * Medical terminology dictionary for accurate medical term translations
 * Maps medical terms to their standardized versions across languages
 */

export const MEDICAL_TERMS = {
  // Common medications
  acetaminophen: { es: 'paracetamol', hi: 'एसिटामिनोफेन' },
  ibuprofen: { es: 'ibuprofeno', hi: 'इबुप्रोफेन' },
  aspirin: { es: 'aspirina', hi: 'एस्पिरिन' },
  metformin: { es: 'metformina', hi: 'मेटफॉर्मिन' },
  lisinopril: { es: 'lisinopril', hi: 'लिसिनोप्रिल' },
  atorvastatin: { es: 'atorvastatina', hi: 'एटोरवास्टेटिन' },
  omeprazole: { es: 'omeprazol', hi: 'ओमेप्राजोल' },
  amoxicillin: { es: 'amoxicilina', hi: 'एमोक्सिसिलिन' },
  sertraline: { es: 'sertralina', hi: 'सर्ट्रालाइन' },
  insulin: { es: 'insulina', hi: 'इंसुलिन' },

  // Conditions and diseases
  diabetes: { es: 'diabetes', hi: 'मधुमेह' },
  hypertension: { es: 'hipertensión', hi: 'उच्च रक्तचाप' },
  arthritis: { es: 'artritis', hi: 'गठिया' },
  asthma: { es: 'asma', hi: 'अस्थमा' },
  pneumonia: { es: 'neumonía', hi: 'निमोनिया' },
  'heart disease': { es: 'enfermedad cardíaca', hi: 'हृदय रोग' },
  depression: { es: 'depresión', hi: 'अवसाद' },
  anxiety: { es: 'ansiedad', hi: 'चिंता' },
  infection: { es: 'infección', hi: 'संक्रमण' },
  fever: { es: 'fiebre', hi: 'बुखार' },

  // Medical procedures and tests
  'blood pressure': { es: 'presión arterial', hi: 'रक्त दबाव' },
  'blood sugar': { es: 'glucosa en sangre', hi: 'रक्त शर्करा' },
  'blood test': { es: 'análisis de sangre', hi: 'रक्त परीक्षण' },
  'MRI scan': { es: 'resonancia magnética', hi: 'एमआरआई स्कैन' },
  'CT scan': { es: 'tomografía computarizada', hi: 'सीटी स्कैन' },
  'X-ray': { es: 'radiografía', hi: 'एक्स-रे' },
  biopsy: { es: 'biopsia', hi: 'बायोप्सी' },
  vaccination: { es: 'vacunación', hi: 'टीकाकरण' },
  surgery: { es: 'cirugía', hi: 'सर्जरी' },
  'physical therapy': { es: 'fisioterapia', hi: 'भौतिक चिकित्सा' },

  // Dosage and administration
  tablet: { es: 'tableta', hi: 'गोली' },
  capsule: { es: 'cápsula', hi: 'कैप्सूल' },
  injection: { es: 'inyección', hi: 'इंजेक्शन' },
  'oral medication': { es: 'medicamento oral', hi: 'मौखिक दवा' },
  'topical application': { es: 'aplicación tópica', hi: 'स्थानीय अनुप्रयोग' },
  dosage: { es: 'dosis', hi: 'खुराक' },
  frequency: { es: 'frecuencia', hi: 'आवृत्ति' },
  'every morning': { es: 'cada mañana', hi: 'हर सुबह' },
  'every evening': { es: 'cada noche', hi: 'हर शाम' },
  'twice daily': { es: 'dos veces al día', hi: 'दिन में दो बार' },
  'three times daily': { es: 'tres veces al día', hi: 'दिन में तीन बार' },
  'once daily': { es: 'una vez al día', hi: 'दिन में एक बार' },
  'after meals': { es: 'después de las comidas', hi: 'भोजन के बाद' },
  'before meals': { es: 'antes de las comidas', hi: 'भोजन से पहले' },
  'with food': { es: 'con alimentos', hi: 'भोजन के साथ' },
  'without food': { es: 'sin alimentos', hi: 'भोजन के बिना' },
  'as needed': { es: 'según sea necesario', hi: 'आवश्यकतानुसार' },

  // Side effects and symptoms
  'side effect': { es: 'efecto secundario', hi: 'दुष्प्रभाव' },
  'nausea': { es: 'náuseas', hi: 'मतली' },
  'dizziness': { es: 'mareos', hi: 'चक्कर आना' },
  'headache': { es: 'dolor de cabeza', hi: 'सिरदर्द' },
  'stomach pain': { es: 'dolor de estómago', hi: 'पेट दर्द' },
  'allergic reaction': { es: 'reacción alérgica', hi: 'एलर्जी प्रतिक्रिया' },
  'rash': { es: 'erupción cutánea', hi: 'चकत्ते' },

  // Medical advice
  'consult doctor': { es: 'consultar médico', hi: 'डॉक्टर से परामर्श लें' },
  'emergency': { es: 'emergencia', hi: 'आपातकाल' },
  'contraindication': { es: 'contraindicación', hi: 'contraindication' },
  'interaction': { es: 'interacción', hi: 'अंतःक्रिया' },
  'refill': { es: 'recargar', hi: 'रीफिल' },
  'prescription': { es: 'receta médica', hi: 'पर्चा' },

  // Units and measurements
  'milligrams': { es: 'miligramos', hi: 'मिलीग्राम' },
  'mg': { es: 'mg', hi: 'मिलीग्राम' },
  'milliliters': { es: 'mililitros', hi: 'मिलीलीटर' },
  'ml': { es: 'ml', hi: 'मिलीलीटर' },
  'hours': { es: 'horas', hi: 'घंटे' },
  'days': { es: 'días', hi: 'दिन' },
  'weeks': { es: 'semanas', hi: 'सप्ताह' },
  'months': { es: 'meses', hi: 'महीने' },
};

/**
 * Get medical term translation
 * @param {string} term - English medical term
 * @param {string} targetLanguage - Target language code (es, hi)
 * @returns {string} - Translated term or original if not found
 */
export const getMedicalTermTranslation = (term, targetLanguage) => {
  const termLower = term.toLowerCase();
  const termData = MEDICAL_TERMS[termLower];
  
  if (!termData) {
    return term; // Return original if not in dictionary
  }

  if (targetLanguage === 'es') {
    return termData.es || term;
  }
  if (targetLanguage === 'hi') {
    return termData.hi || term;
  }
  
  return term;
};

/**
 * Get all medical terms for a specific language
 * @param {string} targetLanguage - Target language code
 * @returns {Object} - Dictionary of medical terms in target language
 */
export const getMedicalTermsDictionary = (targetLanguage) => {
  const dictionary = {};
  
  Object.entries(MEDICAL_TERMS).forEach(([engTerm, translations]) => {
    dictionary[engTerm] = translations[targetLanguage] || engTerm;
  });

  return dictionary;
};
