import { createI18n } from "vue-i18n";
import zhTW from "./locales/zh-TW/product.json";
import en from "./locales/en/product.json";

const savedLocale = localStorage.getItem("locale") || "zh-TW";

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: "zh-TW",
  messages: {
    "zh-TW": zhTW,
    en,
  },
});

export default i18n;
