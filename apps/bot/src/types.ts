import { Scenes, Context } from 'telegraf';
import type { Lang } from './i18n';

export interface LeadData {
  service?: string;
  serviceLabel?: string;
  fullName?: string;
  phone?: string;
  phoneExtra?: string;
  phoneVerified?: boolean; // true if shared via Telegram contact, not typed
  address?: string;
  comment?: string;
}

export interface LeadWizardSession extends Scenes.WizardSessionData {
  lead: LeadData;
}

export interface AppSession extends Scenes.WizardSession<LeadWizardSession> {
  lang?: Lang;
}

export type BotContext = Context & {
  session: AppSession;
  scene: Scenes.SceneContextScene<BotContext, LeadWizardSession>;
  wizard: Scenes.WizardContextWizard<BotContext>;
};
