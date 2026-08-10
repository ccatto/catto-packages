// @ccatto/ui - ErrorPageCatto
// Branded, theme-aware template for "not found" / runtime-error pages, so apps
// stop re-implementing them. Pure + presentational — the app supplies copy (from
// its `errors` i18n namespace) and the action hrefs. Used by an app's
// not-found.tsx / error.tsx / global-error.tsx.
"use client";

import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  Home,
  Search,
  UserX,
} from "lucide-react";
import LinkCatto from "../Link/LinkCatto";
import { cn } from "../../utils";

export type ErrorIconType = "error" | "notFound" | "auth" | "server";

export interface ErrorPageCattoProps {
  /** Main heading text. */
  title: string;
  /** Optional subtitle line shown below the title. */
  subtitle?: string;
  /** Optional supporting description (longer body copy). */
  description?: string;
  /** Optional error code badge ("404", "500", etc.). */
  errorCode?: string;
  /** Icon style — picks one of four lucide icons. Default "error". */
  iconType?: ErrorIconType;
  /** Primary action label. Default "Go home". */
  actionLabel?: string;
  /** Primary action href. Default "/". */
  actionHref?: string;
  /** Optional secondary action label. */
  secondaryActionLabel?: string;
  /** Optional secondary action href. */
  secondaryActionHref?: string;
  /** Additional classes for the outer wrapper. */
  className?: string;
  "data-testid"?: string;
}

const iconMap: Record<ErrorIconType, React.ComponentType<{ className?: string }>> =
  {
    error: AlertCircle,
    notFound: Search,
    auth: UserX,
    server: AlertTriangle,
  };

/**
 * ErrorPageCatto - branded error/not-found template.
 *
 * @example
 * // app/[locale]/not-found.tsx
 * <ErrorPageCatto
 *   iconType="notFound"
 *   errorCode="404"
 *   title={t("notFound")}
 *   description={t("defaultDescription")}
 *   actionHref="/" actionLabel={t("goHome")}
 *   secondaryActionHref="/paddles" secondaryActionLabel={t("browse")}
 * />
 */
const ErrorPageCatto: React.FC<ErrorPageCattoProps> = ({
  title,
  subtitle,
  description,
  errorCode,
  iconType = "error",
  actionLabel = "Go home",
  actionHref = "/",
  secondaryActionLabel,
  secondaryActionHref,
  className,
  "data-testid": testId,
}) => {
  const Icon = iconMap[iconType];

  return (
    <div
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}
      data-testid={testId}
    >
      <Icon className="mb-6 h-16 w-16 text-gray-400 dark:text-gray-500" />
      {errorCode && (
        <p className="mb-2 font-mono text-sm uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {errorCode}
        </p>
      )}
      <h1 className="mb-3 text-3xl font-extrabold text-gray-900 md:text-5xl dark:text-slate-50">
        {title}
      </h1>
      {subtitle && (
        <p className="mb-3 text-xl text-gray-600 dark:text-gray-300">
          {subtitle}
        </p>
      )}
      {description && (
        <p className="mb-8 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <LinkCatto
          href={actionHref}
          variant="button"
          className="inline-flex items-center"
        >
          <Home className="mr-2 h-4 w-4" />
          {actionLabel}
        </LinkCatto>
        {secondaryActionLabel && secondaryActionHref && (
          <LinkCatto
            href={secondaryActionHref}
            variant="outline"
            className="inline-flex items-center"
          >
            {secondaryActionLabel}
          </LinkCatto>
        )}
      </div>
    </div>
  );
};

export default ErrorPageCatto;
