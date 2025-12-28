export interface TelegramNotification {
  type: 'email_signup' | 'contact_form' | 'facility_inquiry' | 'admin_action' | 'error';
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

class TelegramService {
  private botToken: string | null = null;
  private chatId: string | null = null;
  private isEnabled: boolean = false;

  constructor() {
    this.initializeConfig();
  }

  private initializeConfig() {
    try {
      // Get Telegram configuration from environment variables
      this.botToken = process.env.REACT_APP_TELEGRAM_BOT_TOKEN || null;
      this.chatId = process.env.REACT_APP_TELEGRAM_CHAT_ID || null;

      if (this.botToken && this.chatId) {
        this.isEnabled = true;
      }
    } catch (error) {
      // Silent initialization failure
    }
  }

  /**
   * Send a notification to Telegram
   */
  async sendNotification(notification: TelegramNotification): Promise<boolean> {
    if (!this.isEnabled || !this.botToken || !this.chatId) {
      return false;
    }

    try {
      const message = this.formatMessage(notification);

      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Format notification message for Telegram
   */
  private formatMessage(notification: TelegramNotification): string {
    const priorityEmojis = {
      low: '🔵',
      normal: '🟢',
      high: '🟡',
      urgent: '🔴'
    };

    const typeEmojis = {
      email_signup: '📧',
      contact_form: '📝',
      facility_inquiry: '🏥',
      admin_action: '👤',
      error: '❌'
    };

    const priority = notification.priority || 'normal';
    const emoji = typeEmojis[notification.type] || '📢';
    const priorityEmoji = priorityEmojis[priority];

    let message = `${priorityEmoji} ${emoji} *${notification.title}*\n\n`;
    message += `${notification.message}\n\n`;

    if (notification.data) {
      message += `*Details:*\n`;
      Object.entries(notification.data).forEach(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        message += `• ${formattedKey}: ${value}\n`;
      });
      message += '\n';
    }

    message += `*Time:* ${new Date().toLocaleString()}\n`;
    message += `*Site:* OASARA.com`;

    return message;
  }

  /**
   * Send email signup notification for OASARA early access
   */
  async notifyEmailSignup(email: string, name?: string, source: string = 'early-access'): Promise<boolean> {
    return this.sendNotification({
      type: 'email_signup',
      title: 'New OASARA Early Access Signup!',
      message: `Someone just joined the OASARA revolution!`,
      data: {
        email,
        name: name || 'Not provided',
        source,
        timestamp: new Date().toISOString(),
      },
      priority: 'normal'
    });
  }

  /**
   * Send facility inquiry notification
   */
  async notifyFacilityInquiry(data: {
    facilityName: string;
    email: string;
    name: string;
    message?: string;
  }): Promise<boolean> {
    return this.sendNotification({
      type: 'facility_inquiry',
      title: 'New Facility Inquiry!',
      message: `Someone is interested in a facility on OASARA!`,
      data: {
        facility: data.facilityName,
        name: data.name,
        email: data.email,
        message: data.message?.substring(0, 100) || 'No message provided',
        timestamp: new Date().toISOString(),
      },
      priority: 'high'
    });
  }

  /**
   * Send contact form notification
   */
  async notifyContactForm(data: {
    name: string;
    email: string;
    message: string;
    type?: string;
  }): Promise<boolean> {
    return this.sendNotification({
      type: 'contact_form',
      title: 'New OASARA Contact Form!',
      message: `Someone sent a message through OASARA!`,
      data: {
        name: data.name,
        email: data.email,
        message: data.message.length > 100
          ? data.message.substring(0, 100) + '...'
          : data.message,
        type: data.type || 'contact',
        timestamp: new Date().toISOString(),
      },
      priority: 'high'
    });
  }

  /**
   * Send bounty board submission notification
   */
  async notifyBountySubmission(data: {
    name: string;
    email: string;
    category: string;
    message: string;
    bountyAmount: number;
  }): Promise<boolean> {
    const categoryEmojis: Record<string, string> = {
      feature: '💡',
      bug: '🐛',
      ux: '✨'
    };

    return this.sendNotification({
      type: 'contact_form',
      title: `${categoryEmojis[data.category] || '📝'} New Bounty Submission!`,
      message: `Someone submitted a ${data.category} idea for $${data.bountyAmount} bounty!`,
      data: {
        name: data.name || 'Anonymous',
        email: data.email || 'Not provided',
        category: data.category,
        bounty: `$${data.bountyAmount} fUSD`,
        message: data.message.length > 150
          ? data.message.substring(0, 150) + '...'
          : data.message,
        timestamp: new Date().toISOString(),
      },
      priority: 'high'
    });
  }

  /**
   * Send error notification
   */
  async notifyError(error: string, context: string, details?: any): Promise<boolean> {
    return this.sendNotification({
      type: 'error',
      title: 'OASARA Website Error',
      message: `An error occurred on OASARA.com`,
      data: {
        error,
        context,
        ...details,
        timestamp: new Date().toISOString(),
      },
      priority: 'urgent'
    });
  }

  /**
   * Test notification system
   */
  async sendTestNotification(): Promise<boolean> {
    return this.sendNotification({
      type: 'admin_action',
      title: 'OASARA Telegram Test',
      message: 'This is a test notification to verify the OASARA Telegram integration is working correctly!',
      data: {
        test: true,
        status: 'active',
        features: 'Early access signups, Facility inquiries, Contact forms',
      },
      priority: 'normal'
    });
  }
}

export const telegramService = new TelegramService();
