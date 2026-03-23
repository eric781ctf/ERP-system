import { createI18n } from "vue-i18n";
import zhTW from "./locales/zh-TW/product.json";
import en from "./locales/en/product.json";
import zhTWAuth from "./locales/zh-TW/auth.json";
import enAuth from "./locales/en/auth.json";
import zhTWContacts from "./locales/zh-TW/contacts.json";
import enContacts from "./locales/en/contacts.json";
import zhTWLayout from "./locales/zh-TW/layout.json";
import enLayout from "./locales/en/layout.json";

const savedLocale = localStorage.getItem("locale") || "zh-TW";

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: "zh-TW",
  messages: {
    "zh-TW": { ...zhTW, ...zhTWAuth, ...zhTWContacts, ...zhTWLayout },
    en: { ...en, ...enAuth, ...enContacts, ...enLayout },
  },
});

export default i18n;
