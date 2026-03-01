const Joi = require('joi');

const validateCheckRequest = (req, res, next) => {
  const schema = Joi.object({
    value: Joi.string().required().min(1).max(500).trim(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details[0].message,
    });
  }

  req.body = value;
  next();
};

module.exports = { validateCheckRequest };
