// This adds req.user to every Express Request after JWT verification
declare namespace Express {
  interface Request {
    user?: {
      _id: string;
      email: string;
      role: 'admin' | 'superadmin';
    };
  }
}