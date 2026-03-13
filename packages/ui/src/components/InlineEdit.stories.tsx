import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { InlineEdit } from "./InlineEdit";

const meta = {
  title: "Forms/InlineEdit",
  component: InlineEdit,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InlineEdit>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledInlineEdit() {
  const [value, setValue] = useState("Click to edit this text");

  return (
    <InlineEdit
      value={value}
      onSave={(newValue) => {
        setValue(newValue);
      }}
      placeholder="Click to edit"
    />
  );
}

export const Default: Story = {
  args: {
    value: "Click to edit this text",
    onSave: () => {},
    placeholder: "Click to edit",
  },
};

export const Multiline: Story = {
  args: {
    value: "Click to edit this multiline text\nYou can add multiple lines here",
    onSave: () => {},
    multiline: true,
    placeholder: "Click to edit",
  },
};

export const WithMaxLength: Story = {
  args: {
    value: "Edit me",
    onSave: () => {},
    maxLength: 20,
    placeholder: "Max 20 characters",
  },
};

export const Disabled: Story = {
  args: {
    value: "This field is disabled",
    onSave: () => {},
    disabled: true,
  },
};
