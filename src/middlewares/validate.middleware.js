export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.slice(1).join('.'),
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Assign validated and transformed data back to request
    if (result.data.body !== undefined) {
      req.body = result.data.body;
    }
    if (result.data.query !== undefined) {
      req.query = result.data.query;
    }
    if (result.data.params !== undefined) {
      req.params = result.data.params;
    }

    next();
  };
};
