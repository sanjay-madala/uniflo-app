import type { Meta, StoryObj } from "@storybook/react";
import { SearchBar } from "./SearchBar";

const meta: Meta<typeof SearchBar> = {
  title: "Inputs/SearchBar",
  component: SearchBar,
};
export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = { args: { placeholder: "Search projects…" } };
export const WithShortcut: Story = { args: { placeholder: "Search…", shortcut: "⌘K" } };
export const WithValue: Story = { args: { value: "react components", shortcut: "⌘K" } };
