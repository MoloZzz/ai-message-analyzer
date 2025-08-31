import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup } from 'telegraf';
import { FeedbackService } from '../../feedback/feedback.service';

type State = 'WAIT_ROLE' | 'WAIT_BRANCH' | 'READY';
interface UserState {
  state: State;
  role?: string;
  branch?: string;
}

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramBotService.name);
  private bot?: Telegraf;
  private users = new Map<number, UserState>();

  private ROLES = ['Механік', 'Електрик', 'Менеджер']; // can be moved to .env

  constructor(
    private readonly config: ConfigService,
    private readonly feedbackService: FeedbackService,
  ) {}

  async onModuleInit() {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');

    this.bot = new Telegraf(token);

    this.bot.start(async (ctx) => {
      const st = this.ensureState(ctx.from.id);
      if (st.state === 'READY') {
        await ctx.reply('Вітаю! Надсилайте ваш фідбек одним повідомленням.');
      } else {
        await ctx.reply('Привіт! Давай налаштуємось 😉');
        await this.askRole(ctx);
      }
    });

    // command for changing role
    this.bot.command('role', async (ctx) => {
      const st = this.ensureState(ctx.from.id);
      st.state = 'WAIT_ROLE';
      await this.askRole(ctx);
    });

    this.bot.command('branch', async (ctx) => {
      const st = this.ensureState(ctx.from.id);
      st.state = 'WAIT_BRANCH';
      await this.askBranch(ctx);
    });

    this.bot.on('text', async (ctx) => this.onText(ctx));

    await this.bot.launch();
    this.logger.log('Telegram bot launched');
    // small break
    process.once('SIGINT', () => this.bot?.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot?.stop('SIGTERM'));
  }

  async onModuleDestroy() {
    await this.bot?.stop();
  }

  // -------- conversation logic --------

  private ensureState(userId: number): UserState {
    if (!this.users.has(userId)) {
      this.users.set(userId, { state: 'WAIT_ROLE' });
    }
    return this.users.get(userId)!;
  }

  private async onText(ctx: any) {
    const text: string = (ctx.message?.text || '').trim();
    const userId = ctx.from.id;
    const st = this.ensureState(userId);

    if (st.state === 'WAIT_ROLE') {
      const picked = this.ROLES.find(r => r.toLowerCase() === text.toLowerCase());
      if (!picked) {
        await ctx.reply('Будь ласка, оберіть посаду кнопкою нижче.', this.roleKeyboard());
        return;
      }
      st.role = picked;
      st.state = 'WAIT_BRANCH';
      await this.askBranch(ctx);
      return;
    }

    if (st.state === 'WAIT_BRANCH') {
      const branches = this.getBranches();
      if (branches.length) {
        const picked = branches.find(b => b.toLowerCase() === text.toLowerCase());
        if (!picked) {
          await ctx.reply('Оберіть філію з кнопок нижче.', this.branchKeyboard(branches));
          return;
        }
        st.branch = picked;
      } else {
        st.branch = text;
      }
      st.state = 'READY';
      await ctx.reply(
        `Готово! Посада: ${st.role}; Філія: ${st.branch}.\nТепер просто надсилайте свої відгуки повідомленням.`
      );
      return;
    }

    if (st.state === 'READY' && st.role && st.branch) {
      try {
        const res = await this.feedbackService.processFeedback({
          role: st.role,
          branch: st.branch,
          message: text,
        });

        await ctx.reply(
          `Дякую! Відгук збережено.\nТональність: ${res.analysis?.tone}\nКритичність: ${res.analysis?.criticality}\nПорада: ${res.analysis?.solution}`
        );
      } catch (e) {
        this.logger.error(e);
        await ctx.reply('Сталася помилка під час обробки. Спробуйте ще раз трохи пізніше 🙏');
      }
    }
  }

  // -------- UI helpers --------

  private roleKeyboard() {
    return Markup.keyboard([this.ROLES]).oneTime().resize();
  }

  private branchKeyboard(branches: string[]) {
    // rows with 3 buttons
    const rows: string[][] = [];
    for (let i = 0; i < branches.length; i += 3) rows.push(branches.slice(i, i + 3));
    return Markup.keyboard(rows).oneTime().resize();
  }

  private async askRole(ctx: any) {
    await ctx.reply('Оберіть вашу посаду:', this.roleKeyboard());
  }

  private async askBranch(ctx: any) {
    const branches = this.getBranches();
    if (branches.length) {
      await ctx.reply('Оберіть вашу філію:', this.branchKeyboard(branches));
    } else {
      await ctx.reply('Введіть назву вашої філії текстом:');
    }
  }

  private getBranches(): string[] {
    const raw = this.config.get<string>('TELEGRAM_BRANCHES') || '';
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
}
