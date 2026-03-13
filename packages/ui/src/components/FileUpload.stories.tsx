import type { Meta, StoryObj } from "@storybook/react";
import { FileUpload } from "./FileUpload";

const meta: Meta<typeof FileUpload> = {
  title: "Inputs/FileUpload",
  component: FileUpload,
};
export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Default: Story = { args: { label: "Attachments" } };
export const WithRestrictions: Story = { args: { label: "Images only", accept: "image/*", maxSizeMb: 5, multiple: true } };
export const Disabled: Story = { args: { label: "Upload", disabled: true } };
