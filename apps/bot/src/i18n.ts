// Bot translations — RU (default), UZ (latin), EN.
// Keep keys structurally identical so the scene code can index without checks.

export type Lang = 'ru' | 'uz' | 'en';

export const LANGS: Lang[] = ['ru', 'uz', 'en'];

export type ServiceKey =
  | 'DISINFECTION'
  | 'DISINSECTION'
  | 'DERATIZATION'
  | 'OUTDOOR'
  | 'CHLORINE'
  | 'SUBSCRIPTION';

export const SERVICES: ServiceKey[] = [
  'DISINFECTION',
  'DISINSECTION',
  'DERATIZATION',
  'OUTDOOR',
  'CHLORINE',
  'SUBSCRIPTION',
];

interface ServiceLabel {
  icon: string;
  label: string;
}

interface Dict {
  // Greeting / menu
  welcomeTitle: string;
  welcomeText: string;
  leadButton: string;
  // Language picker
  chooseLanguage: string;
  languageSaved: string;
  // Lead wizard
  chooseService: string;
  serviceChosen: string;
  askName: string;
  askPhone: string;
  shareContactButton: string;
  notOwnContact: string;
  askPhoneExtra: string;
  pleasePhoneOrSkip: string;
  askAddress: string;
  askComment: string;
  skipButton: string;
  // Validation prompts
  nameTooShort: string;
  phoneInvalid: string;
  addressTooShort: string;
  pleaseText: string;
  pleasePickService: string;
  pleaseCommentOrSkip: string;
  pleasePickConfirm: string;
  // Review
  reviewTitle: string;
  rService: string;
  rName: string;
  rPhone: string;
  rPhoneExtra: string;
  rPhoneVerifiedTag: string;
  rAddress: string;
  rComment: string;
  rNotSet: string;
  submitButton: string;
  cancelButton: string;
  // Result
  cancelled: string;
  accepted: string;
  apiError: string;
  // Services
  services: Record<ServiceKey, ServiceLabel>;
  // Bot-commands menu (shown when user taps the Menu / "/" button)
  cmdStart: string;
  cmdRequest: string;
  cmdLang: string;
  cmdCancel: string;
}

const ru: Dict = {
  welcomeTitle: '👋 Добро пожаловать в *PEST\\-FREE*\\!',
  welcomeText:
    'Профессиональная дезинфекция, дезинсекция и дератизация в Ташкенте\\.\n\nНажмите кнопку ниже, чтобы оставить заявку\\.',
  leadButton: '📋 Оставить заявку',
  chooseLanguage: 'Выберите язык / Tilni tanlang / Choose language',
  languageSaved: '✅ Язык: русский',
  chooseService: 'Выберите тип услуги:',
  serviceChosen: '✅ Выбрано:',
  askName: 'Введите ваше ФИО:',
  askPhone: 'Поделитесь контактом кнопкой ниже — или введите номер вручную:',
  shareContactButton: '📞 Поделиться контактом',
  notOwnContact: 'Пожалуйста, поделитесь своим контактом, а не чужим.',
  askPhoneExtra: 'Есть дополнительный номер? Введите его или нажмите «Пропустить».',
  pleasePhoneOrSkip: 'Введите номер или нажмите «Пропустить».',
  askAddress: 'Введите адрес (город, улица, дом):',
  askComment: 'Добавьте комментарий к заявке:',
  skipButton: 'Пропустить',
  nameTooShort: 'ФИО слишком короткое. Введите полное имя:',
  phoneInvalid:
    'Номер телефона должен содержать не менее 7 цифр. Попробуйте ещё раз:',
  addressTooShort: 'Адрес слишком короткий. Пожалуйста, уточните:',
  pleaseText: 'Пожалуйста, введите текстом.',
  pleasePickService: 'Пожалуйста, выберите услугу из списка выше.',
  pleaseCommentOrSkip: 'Введите комментарий или нажмите «Пропустить».',
  pleasePickConfirm: 'Нажмите «Отправить» или «Отменить».',
  reviewTitle: 'Проверьте данные заявки:',
  rService: '📋 *Услуга:*',
  rName: '👤 *ФИО:*',
  rPhone: '📱 *Телефон:*',
  rPhoneExtra: '📱 *Доп\\. номер:*',
  rPhoneVerifiedTag: '✓ verified',
  rAddress: '📍 *Адрес:*',
  rComment: '💬 *Комментарий:*',
  rNotSet: 'не указан',
  submitButton: '✅ Отправить',
  cancelButton: '❌ Отменить',
  cancelled: 'Заявка отменена. Нажмите /start, чтобы начать заново.',
  accepted:
    '✅ Заявка принята! Мы свяжемся с вами в течение 15 минут.',
  apiError:
    '❌ Ошибка при отправке заявки. Попробуйте позже или свяжитесь с нами напрямую.',
  services: {
    DISINFECTION: { icon: '🦠', label: 'Дезинфекция' },
    DISINSECTION: { icon: '🪲', label: 'Дезинсекция' },
    DERATIZATION: { icon: '🐀', label: 'Дератизация' },
    OUTDOOR: { icon: '🌳', label: 'Обработка участка' },
    CHLORINE: { icon: '🧪', label: 'Обработка хлоркой' },
    SUBSCRIPTION: { icon: '🔁', label: 'Абонентское обслуживание' },
  },
  cmdStart: 'Главное меню',
  cmdRequest: '📋 Оставить заявку',
  cmdLang: '🌐 Сменить язык',
  cmdCancel: 'Отменить заявку',
};

const uz: Dict = {
  welcomeTitle: '👋 *PEST\\-FREE* ga xush kelibsiz\\!',
  welcomeText:
    'Toshkentda professional dezinfeksiya, dezinseksiya va deratizatsiya\\.\n\nSo\'rov qoldirish uchun quyidagi tugmani bosing\\.',
  leadButton: '📋 So\'rov qoldirish',
  chooseLanguage: 'Выберите язык / Tilni tanlang / Choose language',
  languageSaved: '✅ Til: o\'zbek',
  chooseService: 'Xizmat turini tanlang:',
  serviceChosen: '✅ Tanlandi:',
  askName: 'Ism va familiyangizni kiriting:',
  askPhone: 'Quyidagi tugma bilan kontaktingizni ulashing yoki raqamni qoʻlda kiriting:',
  shareContactButton: '📞 Kontaktni ulashish',
  notOwnContact: 'Iltimos, oʻz kontaktingizni ulashing, boshqasini emas.',
  askPhoneExtra: 'Qoʻshimcha raqam bormi? Kiriting yoki «Oʻtkazib yuborish» tugmasini bosing.',
  pleasePhoneOrSkip: 'Raqamni kiriting yoki «Oʻtkazib yuborish» tugmasini bosing.',
  askAddress: 'Manzilni kiriting (shahar, koʻcha, uy):',
  askComment: 'So\'rovga izoh qo\'shing:',
  skipButton: 'O\'tkazib yuborish',
  nameTooShort: 'Ism juda qisqa. To\'liq ism kiriting:',
  phoneInvalid:
    'Telefon raqamida kamida 7 ta raqam bo\'lishi kerak. Qayta urinib ko\'ring:',
  addressTooShort: 'Manzil juda qisqa. Iltimos aniqlashtiring:',
  pleaseText: 'Iltimos, matn ko\'rinishida kiriting.',
  pleasePickService: 'Iltimos, yuqoridagi roʻyxatdan xizmatni tanlang.',
  pleaseCommentOrSkip:
    'Izoh kiriting yoki «O\'tkazib yuborish» tugmasini bosing.',
  pleasePickConfirm: '«Yuborish» yoki «Bekor qilish» tugmasini bosing.',
  reviewTitle: 'So\'rov maʼlumotlarini tekshiring:',
  rService: '📋 *Xizmat:*',
  rName: '👤 *F\\.I\\.SH:*',
  rPhone: '📱 *Telefon:*',
  rPhoneExtra: '📱 *Qoʻshimcha:*',
  rPhoneVerifiedTag: '✓ tasdiqlangan',
  rAddress: '📍 *Manzil:*',
  rComment: '💬 *Izoh:*',
  rNotSet: 'koʻrsatilmagan',
  submitButton: '✅ Yuborish',
  cancelButton: '❌ Bekor qilish',
  cancelled:
    'So\'rov bekor qilindi. Qaytadan boshlash uchun /start ni bosing.',
  accepted:
    '✅ So\'rov qabul qilindi! 15 daqiqa ichida siz bilan bog\'lanamiz.',
  apiError:
    '❌ So\'rovni yuborishda xatolik. Keyinroq urinib koʻring yoki biz bilan toʻgʻridan-toʻgʻri bogʻlaning.',
  services: {
    DISINFECTION: { icon: '🦠', label: 'Dezinfeksiya' },
    DISINSECTION: { icon: '🪲', label: 'Dezinseksiya' },
    DERATIZATION: { icon: '🐀', label: 'Deratizatsiya' },
    OUTDOOR: { icon: '🌳', label: 'Hudud ishlovi' },
    CHLORINE: { icon: '🧪', label: 'Xlor bilan ishlov' },
    SUBSCRIPTION: { icon: '🔁', label: 'Abonement xizmati' },
  },
  cmdStart: 'Bosh menyu',
  cmdRequest: '📋 So\'rov qoldirish',
  cmdLang: '🌐 Tilni o\'zgartirish',
  cmdCancel: 'So\'rovni bekor qilish',
};

const en: Dict = {
  welcomeTitle: '👋 Welcome to *PEST\\-FREE*\\!',
  welcomeText:
    'Professional pest control, disinfection and rodent removal in Tashkent\\.\n\nTap the button below to send a request\\.',
  leadButton: '📋 Send a request',
  chooseLanguage: 'Выберите язык / Tilni tanlang / Choose language',
  languageSaved: '✅ Language: English',
  chooseService: 'Choose a service:',
  serviceChosen: '✅ Chosen:',
  askName: 'Enter your full name:',
  askPhone: 'Share your contact with the button below — or type your number:',
  shareContactButton: '📞 Share contact',
  notOwnContact: 'Please share your own contact, not someone else\'s.',
  askPhoneExtra: 'Do you have a second phone? Type it or tap "Skip".',
  pleasePhoneOrSkip: 'Type a number or tap "Skip".',
  askAddress: 'Enter the address (city, street, building):',
  askComment: 'Add a comment to your request:',
  skipButton: 'Skip',
  nameTooShort: 'Name is too short. Please enter your full name:',
  phoneInvalid:
    'Phone number must contain at least 7 digits. Try again:',
  addressTooShort: 'Address is too short. Please clarify:',
  pleaseText: 'Please send your answer as text.',
  pleasePickService: 'Please pick a service from the list above.',
  pleaseCommentOrSkip: 'Enter a comment or tap "Skip".',
  pleasePickConfirm: 'Tap "Submit" or "Cancel".',
  reviewTitle: 'Please review your request:',
  rService: '📋 *Service:*',
  rName: '👤 *Name:*',
  rPhone: '📱 *Phone:*',
  rPhoneExtra: '📱 *Alt phone:*',
  rPhoneVerifiedTag: '✓ verified',
  rAddress: '📍 *Address:*',
  rComment: '💬 *Comment:*',
  rNotSet: 'not provided',
  submitButton: '✅ Submit',
  cancelButton: '❌ Cancel',
  cancelled: 'Request cancelled. Tap /start to begin again.',
  accepted:
    '✅ Request accepted! We will contact you within 15 minutes.',
  apiError:
    '❌ Could not send the request. Try again later or contact us directly.',
  services: {
    DISINFECTION: { icon: '🦠', label: 'Disinfection' },
    DISINSECTION: { icon: '🪲', label: 'Pest control' },
    DERATIZATION: { icon: '🐀', label: 'Rodent removal' },
    OUTDOOR: { icon: '🌳', label: 'Outdoor treatment' },
    CHLORINE: { icon: '🧪', label: 'Chlorine treatment' },
    SUBSCRIPTION: { icon: '🔁', label: 'Subscription' },
  },
  cmdStart: 'Main menu',
  cmdRequest: '📋 Send a request',
  cmdLang: '🌐 Change language',
  cmdCancel: 'Cancel request',
};

const dicts: Record<Lang, Dict> = { ru, uz, en };

export function dict(lang: Lang | undefined): Dict {
  return dicts[lang ?? 'ru'] ?? dicts.ru;
}

// Maps Telegram's `language_code` (e.g. "ru-RU", "uz", "en-US") to our Lang.
export function detectLang(code: string | undefined): Lang {
  if (!code) return 'ru';
  const base = code.toLowerCase().split(/[-_]/)[0];
  if (base === 'uz') return 'uz';
  if (base === 'en') return 'en';
  return 'ru';
}
