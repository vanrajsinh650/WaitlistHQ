// Direct test: send email using Nodemailer + Gmail
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vanarajsinhs17@gmail.com',
    pass: 'yfnseednwldtzjjx'
  }
});

try {
  console.log('Sending email via Gmail...');
  const info = await transporter.sendMail({
    from: 'WaitlistHQ <vanarajsinhs17@gmail.com>',
    to: 'vanrajsinhsolanki650@gmail.com',
    subject: 'Welcome to WaitlistHQ! 🎉',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 16px;">
        <div style="background: rgba(255,255,255,0.95); border-radius: 12px; padding: 40px; text-align: center;">
          <h1 style="color: #1a1a2e; margin-bottom: 10px;">🎉 You're on the Waitlist!</h1>
          <p style="color: #4a4a6a; font-size: 16px; line-height: 1.6;">
            Hey there! Thanks for joining <strong>WaitlistHQ</strong>.
          </p>
          <p style="color: #4a4a6a; font-size: 16px; line-height: 1.6;">
            You're now in line. We'll notify you as soon as it's your turn.
          </p>
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; display: inline-block; padding: 12px 32px; border-radius: 8px; font-weight: bold; margin-top: 20px;">
            Your Position: #482
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Sent from WaitlistHQ • Built with Node.js + Gmail
          </p>
        </div>
      </div>
    `
  });
  
  console.log('✅ EMAIL SENT SUCCESSFULLY!');
  console.log('Message ID:', info.messageId);
  console.log('To:', 'vanrajsinhsolanki650@gmail.com');
  console.log('From:', 'vanarajsinhs17@gmail.com');
} catch (error) {
  console.error('❌ FAILED:', error.message);
}
