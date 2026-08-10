import type { Meta, StoryObj } from "@storybook/react";
import ErrorPageCatto from "./ErrorPageCatto";

const meta = {
  title: "Components/ErrorPage",
  component: ErrorPageCatto,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ErrorPageCatto>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotFound: Story = {
  args: {
    iconType: "notFound",
    errorCode: "404",
    title: "Page not found",
    description:
      "The page you were looking for doesn't exist or may have moved.",
    actionLabel: "Go home",
    actionHref: "/",
    secondaryActionLabel: "Browse paddles",
    secondaryActionHref: "/paddles",
  },
};

export const RuntimeError: Story = {
  args: {
    iconType: "server",
    errorCode: "500",
    title: "Something went wrong",
    subtitle: "We're on it.",
    description: "Please try again in a moment.",
    actionLabel: "Try again",
    actionHref: "/",
  },
};

export const AuthError: Story = {
  args: {
    iconType: "auth",
    title: "You need to sign in",
    description: "Please sign in to view this page.",
    actionLabel: "Sign in",
    actionHref: "/login",
  },
};
