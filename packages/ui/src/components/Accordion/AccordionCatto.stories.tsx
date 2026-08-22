import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { HelpCircle, Package, RotateCcw, ShieldCheck } from "lucide-react";
import AccordionCatto, { AccordionItemCatto } from "./AccordionCatto";

const meta = {
  title: "Components/Accordion",
  component: AccordionCatto,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    type: { control: "select", options: ["single", "multiple"] },
    variant: { control: "select", options: ["default", "bordered", "separated"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    iconPosition: { control: "select", options: ["left", "right"] },
    collapsible: { control: "boolean" },
  },
  args: {
    onValueChange: fn(),
  },
} satisfies Meta<typeof AccordionCatto>;

export default meta;
type Story = StoryObj<typeof meta>;

const faqItems = [
  {
    id: "shipping",
    title: "How long does shipping take?",
    content: "Orders ship within 2 business days and arrive in 3-5 days.",
  },
  {
    id: "returns",
    title: "What is your return policy?",
    content: "Returns are accepted within 30 days of delivery, no questions asked.",
  },
  {
    id: "warranty",
    title: "Is there a warranty?",
    content: "Every product includes a 1 year limited warranty.",
  },
];

export const Default: Story = {
  args: {
    type: "single",
    collapsible: true,
    variant: "default",
    size: "md",
    items: faqItems,
    defaultValue: "shipping",
  },
};

export const Multiple: Story = {
  args: {
    type: "multiple",
    variant: "bordered",
    items: faqItems,
    defaultValue: ["shipping", "warranty"],
  },
};

export const Separated: Story = {
  args: {
    type: "single",
    variant: "separated",
    items: faqItems,
  },
};

export const WithIcons: Story = {
  args: {
    type: "single",
    variant: "bordered",
    items: [
      {
        id: "shipping",
        title: "Shipping",
        icon: <Package className="h-5 w-5" />,
        content: "Fast, tracked delivery.",
      },
      {
        id: "returns",
        title: "Returns",
        icon: <RotateCcw className="h-5 w-5" />,
        content: "30 day free returns.",
      },
      {
        id: "warranty",
        title: "Warranty",
        icon: <ShieldCheck className="h-5 w-5" />,
        content: "1 year coverage.",
      },
      {
        id: "support",
        title: "Support",
        icon: <HelpCircle className="h-5 w-5" />,
        content: "24/7 help center.",
      },
    ],
  },
};

export const IconOnLeft: Story = {
  args: {
    type: "single",
    variant: "default",
    iconPosition: "left",
    items: faqItems,
  },
};

export const WithDisabledItem: Story = {
  args: {
    type: "single",
    variant: "bordered",
    items: [
      ...faqItems.slice(0, 2),
      {
        id: "coming-soon",
        title: "Coming soon (disabled)",
        content: "Not available yet.",
        disabled: true,
      },
    ],
  },
};

export const CompoundAPI: Story = {
  args: { type: "multiple", items: [] },
  render: (args) => (
    <AccordionCatto {...args} items={undefined}>
      <AccordionItemCatto value="one" title="Composed item one">
        Rich <strong>custom</strong> content with any markup.
      </AccordionItemCatto>
      <AccordionItemCatto value="two" title="Composed item two">
        A second panel.
      </AccordionItemCatto>
    </AccordionCatto>
  ),
};
