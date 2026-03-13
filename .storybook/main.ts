import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../packages/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "storybook-dark-mode",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default config;
