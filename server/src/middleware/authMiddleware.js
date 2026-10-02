import { supabase, isSupabaseConfigured } from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access denied. Valid Bearer token required in Authorization header.'
      });
    }

    const token = authHeader.split(' ')[1]?.trim();

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is missing.'
      });
    }

    if (!isSupabaseConfigured || !supabase) {
      return res.status(500).json({
        error: 'Configuration Error',
        message: 'Supabase authentication is not configured on the server.'
      });
    }

    // Validate Supabase access token directly with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: error?.message || 'Invalid or expired authentication session.'
      });
    }

    // Prevent browser and proxy caching of any user-authenticated data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    // Attach user and verified token to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      metadata: user.user_metadata,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
    req.token = token;

    next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication verification failed.'
    });
  }
};
