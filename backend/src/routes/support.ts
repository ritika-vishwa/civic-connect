import express from 'express';

const router = express.Router();

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // In a production application with SMTP credentials, 
    // you would send an email here using nodemailer, SendGrid, etc.
    
    console.log('\n======================================');
    console.log('📬 NEW SUPPORT TICKET RECEIVED');
    console.log('======================================');
    console.log(`From    : ${name} <${email}>`);
    console.log(`Subject : ${subject}`);
    console.log(`Message :\n${message}`);
    console.log('======================================\n');
    
    res.status(200).json({ success: true, message: 'Support ticket received' });
  } catch (error) {
    console.error('Error handling support ticket:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
