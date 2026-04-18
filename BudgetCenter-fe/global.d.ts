import { IStaticMethods } from "flyonui/flyonui";

declare global {
  interface Window {
    noUiSlider: typeof import("nouislider");
    _: typeof import("lodash");
    HSStaticMethods: IStaticMethods;
  }
}

export {};