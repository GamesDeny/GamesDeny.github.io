import I18nClient from "./I18nClient";
import { availableLocales } from "@/i18n";

export default function I18nPage() {
  return <I18nClient locales={availableLocales} />;
}
