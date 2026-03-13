import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";

const meta = {
  title: "Forms/RichTextEditor",
  component: RichTextEditor,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RichTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledEditor() {
  const [value, setValue] = useState(
    "<p>Start typing or use the toolbar above to format your text.</p>"
  );

  return <RichTextEditor value={value} onChange={setValue} />;
}

export const Default: Story = {
  args: {
    value: "<p>Start typing or use the toolbar above to format your text.</p>",
    onChange: () => {},
  },
};

export const WithContent: Story = {
  args: {
    value: `<h1>Welcome to the Rich Text Editor</h1>
       <p>This editor supports:</p>
       <ul>
         <li><strong>Bold</strong> and <em>italic</em> text</li>
         <li>Multiple heading levels</li>
         <li>Bullet and numbered lists</li>
         <li>Code blocks for sharing code</li>
       </ul>`,
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    value: "<p>This editor is disabled and cannot be edited.</p>",
    onChange: () => {},
    disabled: true,
  },
};
