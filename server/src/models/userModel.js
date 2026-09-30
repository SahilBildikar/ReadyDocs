import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

// Development in-memory fallback store when Supabase keys are not yet configured
const inMemoryUsers = new Map();

export const UserModel = {
  /**
   * Find a user by email (case-insensitive)
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, password_hash, created_at, updated_at')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (error) {
          console.error('[Database Error] Failed to find user by email in Supabase:', error.message);
          throw new Error('Database query error: ' + error.message);
        }

        return data;
      } catch (err) {
        console.error('[Database Error] Supabase connection error:', err.message);
        throw err;
      }
    }

    // In-memory fallback for local development testing
    for (const user of inMemoryUsers.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return { ...user };
      }
    }
    return null;
  },

  /**
   * Find a user by primary key ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, created_at, updated_at')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('[Database Error] Failed to find user by id in Supabase:', error.message);
          throw new Error('Database query error: ' + error.message);
        }

        return data;
      } catch (err) {
        console.error('[Database Error] Supabase connection error:', err.message);
        throw err;
      }
    }

    // In-memory fallback
    const user = inMemoryUsers.get(id);
    if (!user) return null;

    // Return without password_hash
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  /**
   * Create a new user record
   * @param {Object} userData - { name, email, passwordHash }
   * @returns {Promise<Object>}
   */
  async create({ name, email, passwordHash }) {
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([
            {
              name: name.trim(),
              email: normalizedEmail,
              password_hash: passwordHash
            }
          ])
          .select('id, name, email, created_at, updated_at')
          .single();

        if (error) {
          // Check for unique constraint violation from PostgreSQL
          if (error.code === '23505' || error.message.includes('unique')) {
            const conflictErr = new Error('A user with this email address already exists.');
            conflictErr.status = 409;
            throw conflictErr;
          }
          console.error('[Database Error] Failed to insert user in Supabase:', error.message);
          throw new Error('Database error during user registration: ' + error.message);
        }

        return data;
      } catch (err) {
        console.error('[Database Error] Supabase create user error:', err.message);
        throw err;
      }
    }

    // In-memory fallback for local development testing
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newUser = {
      id,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      created_at: now,
      updated_at: now
    };

    inMemoryUsers.set(id, newUser);

    // Return safe user object (no password_hash)
    const { password_hash, ...safeUser } = newUser;
    return safeUser;
  }
};
