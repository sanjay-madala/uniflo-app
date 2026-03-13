import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    darkMode: {
      current: "dark",
    },
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0D1117" },
        { name: "light", value: "#FFFFFF" },
      ],
    },
  },
};

export default preview;
