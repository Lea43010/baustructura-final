import * as nodemailer from 'nodemailer';
import { storage } from './storage';
import { InsertSupportTicket } from '@shared/schema';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  senderEmail: string;
  senderName: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      senderEmail: process.env.SENDER_EMAIL || 'support@bau-structura.de',
      senderName: process.env.SENDER_NAME || 'Bau-Structura Support'
    };

    // Nodemailer setup with BREVO SMTP
    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: false,
      auth: {
        user: this.config.user,
        pass: this.config.pass,
      },
    });
  }

  async sendSupportTicketEmail(ticketData: {
    to: string;
    subject: string;
    description: string;
    ticketId: number;
    priority: string;
  }) {
    const mailOptions = {
      from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
      to: ticketData.to,
      subject: `Support Ticket #${ticketData.ticketId}: ${ticketData.subject}`,
      html: this.generateTicketEmailHtml(ticketData),
      text: this.generateTicketEmailText(ticketData)
    };

    try {
      const response = await this.transporter.sendMail(mailOptions);
      console.log('E-Mail erfolgreich versendet:', response.messageId);
      return response;
    } catch (error) {
      console.error('Fehler beim E-Mail Versand:', error);
      throw error;
    }
  }

  async sendTicketUpdateEmail(ticketData: {
    to: string;
    ticketId: number;
    subject: string;
    status: string;
    updateMessage: string;
    assignedTo?: string;
  }) {
    const mailOptions = {
      from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
      to: ticketData.to,
      subject: `Support Ticket #${ticketData.ticketId} Update: ${ticketData.status}`,
      html: this.generateUpdateEmailHtml(ticketData),
      text: this.generateUpdateEmailText(ticketData)
    };

    try {
      const response = await this.transporter.sendMail(mailOptions);
      console.log('Update E-Mail erfolgreich versendet:', response.messageId);
      return response;
    } catch (error) {
      console.error('Fehler beim Update E-Mail Versand:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(userData: {
    to: string;
    firstName: string;
    role: string;
  }) {
    const mailOptions = {
      from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
      to: userData.to,
      subject: 'Willkommen bei Bau-Structura!',
      html: this.generateWelcomeEmailHtml(userData),
      text: this.generateWelcomeEmailText(userData)
    };

    try {
      const response = await this.transporter.sendMail(mailOptions);
      console.log('Willkommens-E-Mail erfolgreich versendet:', response.messageId);
      return response;
    } catch (error) {
      console.error('Fehler beim Willkommens-E-Mail Versand:', error);
      throw error;
    }
  }

  private generateTicketEmailHtml(ticketData: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22C55E, #16A34A); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .ticket-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .priority-high { border-left: 4px solid #ef4444; }
            .priority-medium { border-left: 4px solid #f97316; }
            .priority-low { border-left: 4px solid #22c55e; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚧 Bau-Structura Support</h1>
                <p>Neues Support Ticket erstellt</p>
            </div>
            <div class="content">
                <div class="ticket-info priority-${ticketData.priority}">
                    <h3>Ticket #${ticketData.ticketId}</h3>
                    <p><strong>Betreff:</strong> ${ticketData.subject}</p>
                    <p><strong>Priorität:</strong> ${this.getPriorityLabel(ticketData.priority)}</p>
                    <p><strong>Status:</strong> Offen</p>
                </div>
                
                <h4>Beschreibung:</h4>
                <div style="background: white; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${ticketData.description}</div>
                
                <p style="margin-top: 20px;">
                    Unser Support-Team wird sich schnellstmöglich um Ihr Anliegen kümmern. 
                    Sie erhalten automatisch Updates zu diesem Ticket.
                </p>
            </div>
            <div class="footer">
                <p>Bau-Structura - Revolutionäres Projektmanagement für den Bau</p>
                <p>Bei Fragen antworten Sie einfach auf diese E-Mail.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  private generateTicketEmailText(ticketData: any): string {
    return `
BAU-STRUCTURA SUPPORT

Neues Support Ticket erstellt

Ticket #${ticketData.ticketId}
Betreff: ${ticketData.subject}
Priorität: ${this.getPriorityLabel(ticketData.priority)}
Status: Offen

Beschreibung:
${ticketData.description}

Unser Support-Team wird sich schnellstmöglich um Ihr Anliegen kümmern.
Sie erhalten automatisch Updates zu diesem Ticket.

Bau-Structura - Revolutionäres Projektmanagement für den Bau
Bei Fragen antworten Sie einfach auf diese E-Mail.`;
  }

  private generateUpdateEmailHtml(ticketData: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .update-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .status-open { border-left: 4px solid #f97316; }
            .status-in-progress { border-left: 4px solid #3b82f6; }
            .status-resolved { border-left: 4px solid #22c55e; }
            .status-closed { border-left: 4px solid #6b7280; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔄 Ticket Update</h1>
                <p>Status-Änderung für Ihr Support Ticket</p>
            </div>
            <div class="content">
                <div class="update-info status-${ticketData.status}">
                    <h3>Ticket #${ticketData.ticketId}</h3>
                    <p><strong>Betreff:</strong> ${ticketData.subject}</p>
                    <p><strong>Neuer Status:</strong> ${this.getStatusLabel(ticketData.status)}</p>
                    ${ticketData.assignedTo ? `<p><strong>Bearbeitet von:</strong> ${ticketData.assignedTo}</p>` : ''}
                </div>
                
                <h4>Update-Nachricht:</h4>
                <div style="background: white; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${ticketData.updateMessage}</div>
            </div>
        </div>
    </body>
    </html>`;
  }

  private generateUpdateEmailText(ticketData: any): string {
    return `
BAU-STRUCTURA SUPPORT - TICKET UPDATE

Ticket #${ticketData.ticketId}
Betreff: ${ticketData.subject}
Neuer Status: ${this.getStatusLabel(ticketData.status)}
${ticketData.assignedTo ? `Bearbeitet von: ${ticketData.assignedTo}` : ''}

Update-Nachricht:
${ticketData.updateMessage}

Bau-Structura Support Team`;
  }

  private generateWelcomeEmailHtml(userData: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22C55E, #16A34A); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .role-badge { display: inline-block; padding: 8px 16px; background: #3b82f6; color: white; border-radius: 20px; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚧 Willkommen bei Bau-Structura!</h1>
                <p>Ihr Account wurde erfolgreich erstellt</p>
            </div>
            <div class="content">
                <p>Hallo ${userData.firstName},</p>
                
                <p>herzlich willkommen bei Bau-Structura! Ihr Account wurde erfolgreich erstellt.</p>
                
                <p><strong>Ihre Rolle:</strong> <span class="role-badge">${this.getRoleLabel(userData.role)}</span></p>
                
                <h3>🎯 Nächste Schritte:</h3>
                <ol>
                    <li>Loggen Sie sich in Ihr Dashboard ein</li>
                    <li>Vervollständigen Sie Ihr Profil</li>
                    <li>Erstellen Sie Ihr erstes Projekt</li>
                    <li>Entdecken Sie die KI-gestützten Features</li>
                </ol>
                
                <h3>🆘 Benötigen Sie Hilfe?</h3>
                <p>Unser Support-Team steht Ihnen gerne zur Verfügung. Erstellen Sie einfach ein Support-Ticket in der App oder antworten Sie auf diese E-Mail.</p>
                
                <p>Viel Erfolg mit Bau-Structura!</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  private generateWelcomeEmailText(userData: any): string {
    return `
WILLKOMMEN BEI BAU-STRUCTURA!

Hallo ${userData.firstName},

herzlich willkommen bei Bau-Structura! Ihr Account wurde erfolgreich erstellt.

Ihre Rolle: ${this.getRoleLabel(userData.role)}

Nächste Schritte:
1. Loggen Sie sich in Ihr Dashboard ein
2. Vervollständigen Sie Ihr Profil  
3. Erstellen Sie Ihr erstes Projekt
4. Entdecken Sie die KI-gestützten Features

Benötigen Sie Hilfe?
Unser Support-Team steht Ihnen gerne zur Verfügung. Erstellen Sie einfach ein Support-Ticket in der App oder antworten Sie auf diese E-Mail.

Viel Erfolg mit Bau-Structura!`;
  }

  private getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'high': return '🔴 Hoch';
      case 'medium': return '🟡 Mittel';
      case 'low': return '🟢 Niedrig';
      default: return priority;
    }
  }

  private getStatusLabel(status: string): string {
    switch (status) {
      case 'open': return '📋 Offen';
      case 'in-progress': return '⚙️ In Bearbeitung';
      case 'resolved': return '✅ Gelöst';
      case 'closed': return '🔒 Geschlossen';
      default: return status;
    }
  }

  private getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'user': return 'Benutzer';
      default: return role;
    }
  }
}

export const emailService = new EmailService();