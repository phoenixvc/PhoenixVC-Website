import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { EmailClient } from "@azure/communication-email";
import * as nodemailer from "nodemailer";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  company?: string;
}

// Define a type for the raw data to avoid using 'any'
interface RawContactData {
  name?: string;
  email?: string;
  message?: string;
  subject?: string;
  company?: string;
  [key: string]: unknown;
}

// Default recipient email
const DEFAULT_RECIPIENT_EMAIL = "eben@phoenixvc.tech";

async function httpTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log("HTTP trigger function processed a request.");

  // Parse the request body
  const rawData = await request.json();

  // Validate and type cast the data
  const formData = validateContactFormData(rawData);

  // If validation fails, return an error
  if (!formData) {
    return {
      status: 400,
      jsonBody: { message: "Invalid form data format" }
    };
  }

  // Check if we have the required data
  if (!formData.name || !formData.email || !formData.message) {
    return {
      status: 400,
      jsonBody: { message: "Please provide name, email, and message" }
    };
  }

  // Get recipient email from environment or use default
  const recipientEmail = process.env.RECIPIENT_EMAIL || DEFAULT_RECIPIENT_EMAIL;

  // Check if ACS connection string is available
  const acsConnectionString = process.env.ACS_CONNECTION_STRING;

  try {
    if (acsConnectionString) {
      // Use Azure Communication Services Email
      await sendWithACS(formData, recipientEmail, acsConnectionString, context);
    } else {
      // Fall back to nodemailer
      await sendWithNodemailer(formData, recipientEmail, context);
    }

    return {
      status: 200,
      jsonBody: { message: "Email sent successfully" }
    };
  } catch (error) {
    context.log(`Error sending email: ${error instanceof Error ? error.message : "Unknown error"}`);

    return {
      status: 500,
      jsonBody: {
        message: "Failed to send email",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
}

// Send email using Azure Communication Services
async function sendWithACS(
  formData: ContactFormData,
  recipientEmail: string,
  connectionString: string,
  context: InvocationContext
): Promise<void> {
  context.log("Sending email via Azure Communication Services...");

  const emailClient = new EmailClient(connectionString);
  const senderAddress = process.env.ACS_SENDER_ADDRESS || "DoNotReply@phoenixvc.tech";

  const emailMessage = {
    senderAddress: senderAddress,
    content: {
      subject: `Contact Form: ${formData.subject || "New message from Phoenix VC Website"}`,
      plainText: `
Name: ${formData.name}
Email: ${formData.email}
${formData.company ? `Company: ${formData.company}` : ""}

Message:
${formData.message}
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #e31bff 0%, #a31bff 100%); padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">Phoenix VC Contact Form</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h3 style="color: #333; margin-top: 0;">New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
            ${formData.company ? `<p><strong>Company:</strong> ${formData.company}</p>` : ""}
            <p><strong>Subject:</strong> ${formData.subject || "Not provided"}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 8px; border: 1px solid #eee;">${formData.message.replace(/\n/g, "<br>")}</p>
          </div>
          <div style="padding: 15px; text-align: center; background: #333; color: #999; font-size: 12px;">
            <p style="margin: 0;">This email was sent from the Phoenix VC website contact form.</p>
          </div>
        </div>
      `
    },
    recipients: {
      to: [{ address: recipientEmail }]
    },
    replyTo: [{ address: formData.email }]
  };

  const poller = await emailClient.beginSend(emailMessage);
  const result = await poller.pollUntilDone();

  if (result.status !== "Succeeded") {
    throw new Error(`Email send failed with status: ${result.status}`);
  }

  context.log("Email sent successfully via ACS");
}

// Send email using nodemailer (fallback)
async function sendWithNodemailer(
  formData: ContactFormData,
  recipientEmail: string,
  context: InvocationContext
): Promise<void> {
  context.log("Sending email via nodemailer...");

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Phoenix VC Contact Form" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    replyTo: formData.email,
    subject: `Contact Form: ${formData.subject || "New message"}`,
    text: `
Name: ${formData.name}
Email: ${formData.email}
${formData.company ? `Company: ${formData.company}` : ""}

Message:
${formData.message}
    `.trim(),
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      ${formData.company ? `<p><strong>Company:</strong> ${formData.company}</p>` : ""}
      <p><strong>Subject:</strong> ${formData.subject || "Not provided"}</p>
      <p><strong>Message:</strong></p>
      <p>${formData.message.replace(/\n/g, "<br>")}</p>
    `
  };

  await transporter.sendMail(mailOptions);
  context.log("Email sent successfully via nodemailer");
}

// Helper function to validate and type cast the data
function validateContactFormData(data: unknown): ContactFormData | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  const contactData = data as RawContactData;

  if (
    typeof contactData.name !== "string" ||
    typeof contactData.email !== "string" ||
    typeof contactData.message !== "string"
  ) {
    return null;
  }

  return {
    name: contactData.name,
    email: contactData.email,
    message: contactData.message,
    subject: typeof contactData.subject === "string" ? contactData.subject : "",
    company: typeof contactData.company === "string" ? contactData.company : undefined
  };
}

// Register the function with Azure Functions
app.http("contactForm", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: httpTrigger
});
