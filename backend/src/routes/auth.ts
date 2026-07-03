import { Router } from 'express';
import { auth } from '../config/firebase';

const router = Router();

// Example route: Set custom user claims (Role Assignment)
// In a real app, you MUST secure this endpoint to only allow existing admins to call it!
router.post('/set-role', async (req, res) => {
  try {
    const { uid, role } = req.body;

    if (!uid || !role) {
      return res.status(400).json({ error: 'Missing uid or role' });
    }

    if (!auth) {
      return res.status(500).json({ error: 'Firebase Admin Auth is not initialized' });
    }

    // Set custom user claims on this user
    await auth.setCustomUserClaims(uid, { role });

    return res.status(200).json({ message: `Successfully assigned role ${role} to user ${uid}` });
  } catch (error) {
    console.error('Error setting role:', error);
    return res.status(500).json({ error: 'Failed to set user role' });
  }
});

export default router;
