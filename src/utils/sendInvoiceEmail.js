const nodemailer = require("nodemailer");

const sendInvoiceEmail = async ({ to, plan, amount, orderId }) => {
  console.log("SMTP HOST:", process.env.EMAIL_HOST);
  console.log("SMTP PORT:", process.env.EMAIL_PORT);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT), // ✅ FIX
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"ElevanceSkills" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Payment Successful - Subscription Activated",
    html: `
      <h2>Payment Successful ✅</h2>
      <p><strong>Plan:</strong> ${plan}</p>
      <p><strong>Amount:</strong> ₹${amount}</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      <hr/>
      <p>Thank you for subscribing.</p>
    `
  });
};

module.exports = sendInvoiceEmail;
