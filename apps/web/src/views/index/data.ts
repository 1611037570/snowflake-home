import { $t } from "@/locales";
export const userInfo = computed(() => {
  return {
    name: $t("core.user.name"),
    location: $t("core.user.location"),
    job: $t("core.user.job"),
    devYears: "2019-11-22",
    shootYears: "2023-06-02",
  };
});
