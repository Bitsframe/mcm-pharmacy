const Joi = require('joi');

// Helper function to normalize phone number
function normalizePhoneNumber(phone) {
  if (!phone) return phone;
  
  console.log('📞 Normalizing phone:', phone);
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If it's 10 digits (US format without country code), add +1
  if (digitsOnly.length === 10) {
    console.log('   → Normalized to:', `+1${digitsOnly}`);
    return `+1${digitsOnly}`;
  }
  
  // If it's 11 digits and starts with 1, add +
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    console.log('   → Normalized to:', `+${digitsOnly}`);
    return `+${digitsOnly}`;
  }
  
  // If it already has digits only and is valid length, add +
  if (digitsOnly.length > 10 && !phone.startsWith('+')) {
    console.log('   → Normalized to:', `+${digitsOnly}`);
    return `+${digitsOnly}`;
  }
  
  console.log('   → No change:', phone);
  return phone;
}

const validatePharmacyRegistration = (req, res, next) => {
  console.log('🔍 Validator: Starting validation');
  console.log('📥 Raw request body:', JSON.stringify(req.body, null, 2));
  
  // Normalize phone number before validation
  if (req.body.phoneNumber) {
    req.body.phoneNumber = normalizePhoneNumber(req.body.phoneNumber);
  }

  const schema = Joi.object({
    name: Joi.string().required().min(2).max(200).trim(),
    phoneNumber: Joi.string()
      .required()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .messages({
        'string.pattern.base': 'Phone number must be in valid format (e.g., +1234567890)',
      }),
    address: Joi.object({
      streetAddress: Joi.string().required().min(5).max(300).trim(),
      zipcode: Joi.string().required().pattern(/^\d{5}(-\d{4})?$/).messages({
        'string.pattern.base': 'Zipcode must be in format 12345 or 12345-6789',
      }),
      state: Joi.string().required().length(2).uppercase().trim(),
    }).required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    console.log('❌ Validation failed:', error.details[0].message);
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details[0].message,
    });
  }

  console.log('✅ Validation passed');
  req.body = value;
  next();
};

module.exports = { validatePharmacyRegistration };
