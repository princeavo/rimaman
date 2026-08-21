import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Order, ContactMessage } from '@prisma/client';
import type { EnvConfig } from '../config/env.validation';

/**
 * Centralise l'envoi des notifications (email + WhatsApp). Un échec d'envoi
 * est toujours capturé et journalisé ici : il ne doit jamais faire échouer
 * la création d'une commande ou d'un message de contact, qui sont déjà
 * enregistrés en base au moment où ces méthodes sont appelées.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('NotificationsService');
  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly config: ConfigService<EnvConfig, true>) {
    const host = this.config.get('SMTP_HOST', { infer: true });

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get('SMTP_PORT', { infer: true }),
        secure: this.config.get('SMTP_SECURE', { infer: true }),
        auth: {
          user: this.config.get('SMTP_USER', { infer: true }),
          pass: this.config.get('SMTP_PASS', { infer: true }),
        },
      });
    } else {
      this.transporter = null;
    }
  }

  private emailWrapper(content: string): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f1e8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#006b32;padding:24px 32px;text-align:center;">
            <div style="display:inline-block;background:#F5B400;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;font-weight:bold;font-family:Georgia,serif;color:#006b32;text-align:center;">R</div>
            <p style="margin:8px 0 0;color:#F5B400;font-size:20px;font-weight:bold;letter-spacing:2px;">RIMAMAN</p>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">Les Farines du Moulin d'Or</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#f5f1e8;padding:16px 32px;text-align:center;border-top:1px solid #e8e0cc;">
            <p style="margin:0;font-size:12px;color:#92867a;">© RIMAMAN – Moulin d'Or &nbsp;|&nbsp; Cotonou, Bénin</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  async notifyNewOrder(order: Order): Promise<void> {
    const items = order.items as Array<{ name: string; quantity: number; price: number }>;
    const itemsList = items
      .map((item) => `<li style="padding:4px 0;">${item.name} × ${item.quantity} — <strong>${item.price} FCFA</strong></li>`)
      .join('');

    await Promise.allSettled([
      this.sendEmail(
        `Nouvelle commande ${order.orderNumber}`,
        this.emailWrapper(`
          <h2 style="margin:0 0 16px;color:#006b32;font-size:20px;">Nouvelle commande</h2>
          <p style="margin:0 0 8px;font-size:22px;font-weight:bold;color:#1b1b16;">${order.orderNumber}</p>
          <hr style="border:none;border-top:1px solid #e8e0cc;margin:16px 0;"/>
          <ul style="padding-left:20px;color:#3d3830;">${itemsList}</ul>
          <hr style="border:none;border-top:1px solid #e8e0cc;margin:16px 0;"/>
          <p style="margin:6px 0;color:#3d3830;"><strong>Total :</strong> ${order.total} FCFA</p>
          <p style="margin:6px 0;color:#3d3830;"><strong>Livraison :</strong> ${order.deliveryMethod}</p>
          <p style="margin:6px 0;color:#3d3830;"><strong>Paiement :</strong> ${order.paymentMethod}</p>
        `),
      ),
      this.sendWhatsApp(
        `Nouvelle commande ${order.orderNumber}\n` +
          items.map((i) => `- ${i.name} x${i.quantity}`).join('\n') +
          `\nTotal : ${order.total} FCFA`,
      ),
    ]);
  }

  async notifyNewContactMessage(contactMessage: ContactMessage): Promise<void> {
    await Promise.allSettled([
      this.sendEmail(
        `Nouveau message de contact — ${contactMessage.subject}`,
        this.emailWrapper(`
          <h2 style="margin:0 0 16px;color:#006b32;font-size:20px;">Nouveau message de contact</h2>
          <p style="margin:6px 0;color:#3d3830;"><strong>De :</strong> ${contactMessage.name} &lt;${contactMessage.email}&gt;</p>
          <p style="margin:6px 0;color:#3d3830;"><strong>Sujet :</strong> ${contactMessage.subject}</p>
          <hr style="border:none;border-top:1px solid #e8e0cc;margin:16px 0;"/>
          <p style="color:#3d3830;line-height:1.6;">${contactMessage.message.replace(/\n/g, '<br/>')}</p>
        `),
      ),
      this.sendWhatsApp(
        `Message de contact\nDe : ${contactMessage.name} (${contactMessage.email})\nSujet : ${contactMessage.subject}\n\n${contactMessage.message}`,
      ),
    ]);
  }

  private async sendEmail(subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('SMTP non configuré (SMTP_HOST vide) : email non envoyé.');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.config.get('NOTIFICATION_EMAIL_FROM', { infer: true }),
        to: this.config.get('NOTIFICATION_EMAIL_TO', { infer: true }),
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        "Échec de l'envoi d'email",
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async sendWhatsApp(message: string): Promise<void> {
    if (!this.config.get('WHATSAPP_ENABLED', { infer: true })) return;

    const phoneNumberId = this.config.get('WHATSAPP_PHONE_NUMBER_ID', { infer: true });
    const accessToken = this.config.get('WHATSAPP_ACCESS_TOKEN', { infer: true });
    const recipient = this.config.get('WHATSAPP_RECIPIENT_NUMBER', { infer: true });

    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: recipient,
            type: 'text',
            text: { body: message },
          }),
        },
      );

      if (!response.ok) {
        this.logger.error(`Échec WhatsApp Business API : ${response.status} ${await response.text()}`);
      }
    } catch (error) {
      this.logger.error(
        "Échec de l'envoi WhatsApp",
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
