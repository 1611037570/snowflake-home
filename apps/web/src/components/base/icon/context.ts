import type { Component, InjectionKey } from "vue";

export type SfIconList = Record<string, Component>;

export const SF_ICON_LIST_KEY: InjectionKey<SfIconList> = Symbol("sf-icon-list");
