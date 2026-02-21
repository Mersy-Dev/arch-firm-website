// This adds req.user to every Express Request after JWT verification
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: 'superadmin' | 'editor';
    };
  }
}