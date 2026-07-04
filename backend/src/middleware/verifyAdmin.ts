import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

/**
 * Middleware: verifyAdminToken
 * Verifies the Firebase ID token in the Authorization header and ensures
 * the caller has the 'admin' role in Firestore before allowing the request.
 */
export const verifyAdminToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    if (!auth) {
      return res.status(500).json({ error: 'Firebase Auth is not initialized.' });
    }

    const decodedToken = await auth.verifyIdToken(idToken);

    // Check Firestore for the caller's role
    const { getFirestore } = await import('firebase-admin/firestore');
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(403).json({ error: 'Forbidden: User not found.' });
    }

    const userData = userDoc.data();
    if (userData?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required.' });
    }

    // Attach decoded token to request for downstream use
    (req as any).decodedToken = decodedToken;
    next();
  } catch (error: any) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
  }
};
