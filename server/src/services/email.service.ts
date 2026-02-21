import { createTransporter } from '../config/email';
import { ContactInput } from '../validators/contact.schema';

export const EmailService = {
  // Send notification to admin when new enquiry arrives
  sendAdminNotification: async (contact: ContactInput) => {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Arch Firm Website" <${process.env.EMAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New enquiry from ${contact.name}`,
      html: `
        <h2>New Website Enquiry</h2>
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
        <p><strong>Project Type:</strong> ${contact.projectType || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${contact.message}</p>
      `,
    });
  },

  // Send auto-reply to the person who submitted the form
  sendAutoReply: async (name: string, email: string) => {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Architecture Firm" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Thank you for your enquiry, ${name}`,
      html: `
        <h2>We've received your message</h2>
        <p>Hi ${name}, thank you for reaching out.
        We'll get back to you within 2 business days.</p>
      `,
    });
  },
};