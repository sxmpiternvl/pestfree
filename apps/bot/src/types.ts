import { Scenes } from 'telegraf';

export interface LeadData {
  service?: string;
  serviceLabel?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  comment?: string;
}

export interface LeadWizardSession extends Scenes.WizardSessionData {
  lead: LeadData;
}

export type BotContext = Scenes.WizardContext<LeadWizardSession>;
