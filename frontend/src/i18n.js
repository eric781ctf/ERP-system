import { createI18n } from "vue-i18n";
import zhTW from "./locales/zh-TW/product.json";
import en from "./locales/en/product.json";
import zhTWAuth from "./locales/zh-TW/auth.json";
import enAuth from "./locales/en/auth.json";
import zhTWContacts from "./locales/zh-TW/contacts.json";
import enContacts from "./locales/en/contacts.json";

const savedLocale = localStorage.getItem("locale") || "zh-TW";

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: "zh-TW",
  messages: {
    "zh-TW": { ...zhTW, ...zhTWAuth, ...zhTWContacts },
    en: { ...en, ...enAuth, ...enContacts },
  },
});

export default i18n;
