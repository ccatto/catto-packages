// @ccatto/ui - EventTimeCatto Component
"use client";

import React, { useMemo } from "react";
import { cn } from "../../utils";

export interface EventTimeCattoProps {
  /** ISO 8601 start time string */
  startTime: string;
  /** ISO 8601 end time string (optional) */
  endTime?: string;
  /** IANA timezone of the event, e.g. "America/New_York" */
  eventTimezone: string;
  /** IANA timezone of the user (auto-detected if omitted) */
  userTimezone?: string;
  /** Display format variant */
  format?: "short" | "medium" | "long";
  /** Whether to show the timezone abbreviation badge */
  showTimezoneBadge?: boolean;
  /** Additional CSS classes */
  className?: string;
  /**
   * Formatter function to format a date string in a specific timezone.
   * Signature: (isoDate, timezone, formatString) => formattedString
   * The caller provides this to avoid a dayjs dependency in @ccatto/ui.
   */
  formatInTimezone: (date: string, tz: string, fmt: string) => string;
  /**
   * Optional function to get a timezone abbreviation string, e.g. "EST", "PST".
   * If omitted, no abbreviation is shown.
   */
  getTimezoneAbbr?: (tz: string) => string;
  /** Test ID for testing */
  "data-testid"?: string;
}

/** Format strings for each display format variant */
const FORMAT_STRINGS = {
  short: {
    date: "MMM D",
    time: "h:mm A",
    full: "MMM D, h:mm A",
  },
  medium: {
    date: "ddd, MMM D",
    time: "h:mm A",
    full: "ddd, MMM D [at] h:mm A",
  },
  long: {
    date: "dddd, MMMM D, YYYY",
    time: "h:mm A",
    full: "dddd, MMMM D, YYYY [at] h:mm A",
  },
} as const;

export default function EventTimeCatto({
  startTime,
  endTime,
  eventTimezone,
  userTimezone,
  format = "medium",
  showTimezoneBadge = true,
  className,
  formatInTimezone,
  getTimezoneAbbr,
  "data-testid": dataTestId,
}: EventTimeCattoProps) {
  // Detect the user timezone if not provided
  const resolvedUserTimezone = useMemo(
    () => userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    [userTimezone]
  );

  const isSameTimezone = eventTimezone === resolvedUserTimezone;

  const fmtStrings = FORMAT_STRINGS[format];

  // Format the event start time in the event timezone
  const eventStartFormatted = useMemo(
    () => formatInTimezone(startTime, eventTimezone, fmtStrings.full),
    [startTime, eventTimezone, fmtStrings.full, formatInTimezone]
  );

  // Format the event end time in the event timezone (if provided)
  const eventEndTimeFormatted = useMemo(() => {
    if (!endTime) return null;
    return formatInTimezone(endTime, eventTimezone, fmtStrings.time);
  }, [endTime, eventTimezone, fmtStrings.time, formatInTimezone]);

  // Format the start time in the user timezone (only when different)
  const userStartTimeFormatted = useMemo(() => {
    if (isSameTimezone) return null;
    return formatInTimezone(startTime, resolvedUserTimezone, fmtStrings.time);
  }, [
    startTime,
    resolvedUserTimezone,
    isSameTimezone,
    fmtStrings.time,
    formatInTimezone,
  ]);

  // Format the end time in the user timezone (only when different)
  const userEndTimeFormatted = useMemo(() => {
    if (isSameTimezone || !endTime) return null;
    return formatInTimezone(endTime, resolvedUserTimezone, fmtStrings.time);
  }, [
    endTime,
    resolvedUserTimezone,
    isSameTimezone,
    fmtStrings.time,
    formatInTimezone,
  ]);

  // Get timezone abbreviation for event timezone
  const eventTzAbbr = useMemo(
    () => (getTimezoneAbbr ? getTimezoneAbbr(eventTimezone) : null),
    [getTimezoneAbbr, eventTimezone]
  );

  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}
      data-testid={dataTestId}
    >
      {/* Primary time display in event timezone */}
      <span className="text-gray-900 dark:text-gray-100">
        {eventStartFormatted}
        {eventEndTimeFormatted && (
          <span className="text-gray-600 dark:text-gray-300">
            {" "}
            &ndash; {eventEndTimeFormatted}
          </span>
        )}
      </span>

      {/* Timezone abbreviation badge */}
      {showTimezoneBadge && eventTzAbbr && (
        <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          {eventTzAbbr}
        </span>
      )}

      {/* User timezone conversion badge (only when timezones differ) */}
      {!isSameTimezone && userStartTimeFormatted && (
        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          {userStartTimeFormatted}
          {userEndTimeFormatted && <span> &ndash; {userEndTimeFormatted}</span>}
          <span className="ml-1 opacity-75">your time</span>
        </span>
      )}
    </div>
  );
}
