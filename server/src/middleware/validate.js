export default function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join(', ');
      return res.status(400).json({ message });
    }
    req.validated = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join(', ');
      return res.status(400).json({ message });
    }
    req.validatedQuery = result.data;
    next();
  };
}
