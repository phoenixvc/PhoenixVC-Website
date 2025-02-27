import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as nodemailer from "nodemailer";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Define a type for the raw data to avoid using 'any'
interface RawContactData {
  name?: string;
  email?: string;
  message?: string;
  subject?: string;
  [key: string]: unknown;
}

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

  try {
    // Create a transporter with your email service credentials
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail", // e.g., "gmail", "outlook", etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Set up email data
    const mailOptions = {
      from: `"Phoenix VC Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      replyTo: formData.email,
      subject: `Contact Form: ${formData.subject || "New message"}`,
      text: `
        Name: ${formData.name}
        Email: ${formData.email}

        Message:
        ${formData.message}
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Subject:</strong> ${formData.subject || "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message.replace(/\n/g, "<br>")}</p>
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return {
      status: 200,
      jsonBody: { message: "Email sent successfully" }
    };
  } catch (error) {
    // Use context.log instead of context.log.error
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

// Helper function to validate and type cast the data
function validateContactFormData(data: unknown): ContactFormData | null {
  // First check if data is an object
  if (typeof data !== "object" || data === null) {
    return null;
  }

  // Cast to our intermediate type for property checking
  const contactData = data as RawContactData;

  // Check required properties and their types
  if (
    typeof contactData.name !== "string" ||
    typeof contactData.email !== "string" ||
    typeof contactData.message !== "string"
  ) {
    return null;
  }

  // Return properly typed data
  return {
    name: contactData.name,
    email: contactData.email,
    message: contactData.message,
    subject: typeof contactData.subject === "string" ? contactData.subject : ""
  };
}

// Register the function with Azure Functions
app.http("contactForm", {
  methods: ["POST"],
  authLevel: "anonymous", // Change this according to your security requirements
  handler: httpTrigger
});
