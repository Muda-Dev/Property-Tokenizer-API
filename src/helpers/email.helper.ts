import nodemailer from 'nodemailer';
import { Transporter, SendMailOptions } from 'nodemailer';

export default class EmailSender {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
            logger: true
        });
    }

    async sendMail(to: string, subject: string, heading: string, body: string) {
        const html = this.createHtmlEmail(heading, body);

        let mailOptions: SendMailOptions = {
            from: process.env.SMTP_FROM,
            to: to,
            subject: subject,
            html: html
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Message sent: %s', info.messageId);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }

    private createHtmlEmail(heading: string, body: string, footer = "The UNIFID team"): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        color: #333333;
                        margin: 0;
                        padding: 0;
                    }
                    p{
                        font-size:14px;
                    }
                    .container {
                        background-color: #ffffff;
                        width: 80%;
                        max-width: 600px;
                        padding: 20px;
                        border: 1px solid #dddddd;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background-color: #e6f2ff;
                        color: #333333;
                        padding: 10px;
                        text-align: center;
                        border-bottom: 1px solid #dddddd;
                    }
                    .body {
                        padding: 20px;
                        text-align: left;
                    }
                    .footer {
                        background-color: #e6f2ff;
                        color: #333333;
                        text-align: center;
                        padding: 10px;
                        border-top: 1px solid #dddddd;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                 
                    <div class="body">
                        ${body}

                        <p style="font-family: Arial, sans-serif; color: #333333;">
                        <br>
                        <br>
                        Best regards,<br>
                        The UNIFID Team
                    </p>
                    
                    </div>

                </div>
            </body>
            </html>
        `;
    }
}
