// @ccatto/ui - PhoneInputCatto Component
// Phone number input with automatic formatting
"use client";

import React, { forwardRef, useId, useRef, useState } from "react";
import {
  DEFAULT_PHONE_INPUT_LABELS,
  type PhoneInputLabels,
} from "../../i18n/defaults";
import { formatPhoneAsYouType, parsePhoneInput } from "../../utils/phone";
import type { CountryData } from "./countries";
import CountryCodeSelectCatto from "./CountryCodeSelectCatto";

export interface PhoneInputCattoProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "onChange" | "type" | "value"
  > {
  /** Current phone value (can be raw or formatted) */
  value?: string;

  /** Custom onChange handler - receives (rawValue, formattedValue, event) */
  onChange?: (
    rawValue: string,
    formattedValue: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;

  /** Native onChange handler for React Hook Form register() compatibility */
  onChangeNative?: React.ChangeEventHandler<HTMLInputElement>;

  /** Placeholder text (default: "(555) 123-4567") */
  placeholder?: string;

  /** Input size variant */
  size?: "small" | "medium" | "large";

  /** Additional class name */
  className?: string;

  /** Width class (default: 'w-full') */
  width?: string;

  /** Visual variant */
  variant?: "outlined" | "filled" | "minimal";

  /** Optional label text */
  label?: string;

  /** Label position: 'top' (default) or 'left' (inline) */
  labelPosition?: "top" | "left";

  /** Show required indicator (*) after label */
  required?: boolean;

  /** Error message (string) or error state (boolean) */
  error?: string | boolean;

  /** Helper text displayed below the input */
  helperText?: string;

  /** Additional class names for the wrapper div */
  wrapperClassName?: string;

  /** Default country for formatting (default: 'US') */
  defaultCountry?: string;

  /** Disable live formatting (just use type="tel") */
  disableFormatting?: boolean;

  /** i18n labels for translatable strings */
  labels?: PhoneInputLabels;

  /** Show country code selector inline (default: false) */
  showCountryCode?: boolean;

  /** Selected country code when showCountryCode is enabled (default: 'US') */
  countryCode?: string;

  /** Called when the country code changes */
  onCountryChange?: (countryCode: string, country: CountryData) => void;

  /** i18n label for country search placeholder */
  countrySearchPlaceholder?: string;
}

/**
 * Phone number input with automatic formatting
 *
 * @example
 * // Basic usage
 * <PhoneInputCatto
 *   value={phone}
 *   onChange={(raw, formatted) => setPhone(raw)}
 *   label="Phone number"
 * />
 *
 * @example
 * // With React Hook Form
 * <PhoneInputCatto
 *   {...register('phoneNumber')}
 *   label="Phone number"
 *   error={errors.phoneNumber?.message}
 * />
 */
const PhoneInputCatto = forwardRef<HTMLInputElement, PhoneInputCattoProps>(
  (
    {
      value = "",
      onChange,
      onChangeNative,
      placeholder,
      size = "medium",
      className = "",
      width = "w-full",
      variant = "outlined",
      disabled,
      onFocus,
      onBlur,
      label,
      labelPosition = "top",
      required,
      error,
      helperText,
      wrapperClassName = "",
      defaultCountry = "US",
      disableFormatting = false,
      id: providedId,
      labels,
      showCountryCode = false,
      countryCode = "US",
      onCountryChange,
      countrySearchPlaceholder,
      ...props
    },
    ref
  ) => {
    // Merge provided labels with defaults
    const resolvedLabels = {
      ...DEFAULT_PHONE_INPUT_LABELS,
      ...labels,
    };
    // Use explicit placeholder if provided, otherwise fall back to labels
    const resolvedPlaceholder = placeholder ?? resolvedLabels.placeholder;
    const [isFocused, setIsFocused] = useState(false);
    const [previousValue, setPreviousValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const generatedId = useId();
    const inputId = providedId || generatedId;

    // Size variations (matching InputCatto)
    const sizeClasses = {
      small: "h-8 px-2 text-sm",
      medium: "h-10 px-3 text-base",
      large: "h-12 px-4 text-lg",
    };

    // Error state styling
    const hasError = Boolean(error);
    const errorBorderClasses = hasError
      ? "border-red-500 dark:border-red-400"
      : "";
    const errorFocusClasses = hasError
      ? "ring-red-500/20 dark:ring-red-400/20 shadow-red-500/10 dark:shadow-red-400/10"
      : "ring-theme-secondary shadow-theme-secondary";

    // Variant styles with focus states
    const getVariantClasses = () => {
      const focusBorder = hasError
        ? "border-red-500 dark:border-red-400"
        : "border-theme-secondary";

      const baseBorder = hasError
        ? "border-red-500 dark:border-red-400"
        : "border-theme-border";

      switch (variant) {
        case "outlined":
          return `
            border ${isFocused ? focusBorder : baseBorder}
            bg-theme-surface
            text-theme-text
          `;
        case "filled":
          return `
            border-0 border-b-2 ${isFocused ? focusBorder : baseBorder}
            bg-theme-surface
            text-theme-text
          `;
        case "minimal":
          return `
            border-0 border-b ${isFocused ? focusBorder : baseBorder}
            bg-transparent
            text-theme-text
          `;
        default:
          return "";
      }
    };

    // Focus ring and glow effect (applied to wrapper when showCountryCode, otherwise on input)
    const focusClasses =
      isFocused && !disabled && !showCountryCode
        ? `ring-4 ${errorFocusClasses} shadow-lg`
        : "";
    const wrapperFocusClasses =
      isFocused && !disabled && showCountryCode
        ? `ring-4 ${errorFocusClasses} shadow-lg`
        : "";

    // Base states and interactions
    const stateClasses = {
      default: `
        transition-all duration-300 ease-out
        focus:outline-none
        hover:border-theme-border-strong
        hover:shadow-sm
        placeholder:text-theme-text-subtle
      `,
      disabled: `
        opacity-50 cursor-not-allowed
        hover:border-theme-border
        hover:shadow-none
      `,
    };

    // Handle focus
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
      setIsFocused(true);
      onFocus?.(e);
    };

    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Handle change with formatting
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const inputValue = e.target.value;

      if (disableFormatting) {
        // No formatting - just pass through
        const rawValue = parsePhoneInput(inputValue);
        onChangeNative?.(e);
        onChange?.(rawValue, inputValue, e);
        setPreviousValue(inputValue);
        return;
      }

      // Format the phone number as user types
      const formattedValue = formatPhoneAsYouType(inputValue, previousValue);
      const rawValue = parsePhoneInput(formattedValue);

      // Update the input value to the formatted version
      e.target.value = formattedValue;

      // Call native handler first (for RHF register compatibility)
      onChangeNative?.(e);

      // Then call custom handler with both raw and formatted values
      onChange?.(rawValue, formattedValue, e);

      // Store for next comparison
      setPreviousValue(formattedValue);
    };

    // Label classes based on position
    const labelClasses =
      labelPosition === "left"
        ? "flex items-center text-sm font-medium text-theme-text-muted mr-3 whitespace-nowrap"
        : "block text-sm font-medium text-theme-text-muted mb-1";

    // Input classes - adjust border radius when country code is shown
    const inputRoundingClasses = showCountryCode
      ? "rounded-l-none rounded-r-md"
      : "rounded-md";

    // The raw input element
    const rawInputElement = (
      <input
        ref={(el) => {
          // Handle forwarded ref
          if (typeof ref === "function") {
            ref(el);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLInputElement | null>).current =
              el;
          }
          // Store in local ref
          inputRef.current = el;
        }}
        id={inputId}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        onChange={handleChange}
        placeholder={resolvedPlaceholder}
        className={`
          ${width}
          ${sizeClasses[size]}
          ${getVariantClasses()}
          ${disabled ? stateClasses.disabled : stateClasses.default}
          ${focusClasses}
          ${inputRoundingClasses}
          ${className}
        `
          .trim()
          .replace(/\s+/g, " ")}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-invalid={hasError ? "true" : undefined}
        aria-describedby={
          error && typeof error === "string"
            ? `${inputId}-error`
            : helperText
            ? `${inputId}-helper`
            : undefined
        }
        {...props}
      />
    );

    // The input element (optionally with country code selector)
    const inputElement = showCountryCode ? (
      <div
        className={`flex rounded-md ${wrapperFocusClasses} transition-all duration-300 ease-out`}
      >
        <CountryCodeSelectCatto
          value={countryCode}
          onChange={(code, country) => onCountryChange?.(code, country)}
          size={size}
          disabled={disabled}
          searchPlaceholder={countrySearchPlaceholder}
        />
        {rawInputElement}
      </div>
    ) : (
      rawInputElement
    );

    // If no wrapper features needed, return just the input
    if (!label && !error && !helperText) {
      return inputElement;
    }

    // Wrapper layout classes
    const wrapperLayoutClasses =
      labelPosition === "left" ? "flex items-center" : "flex flex-col";

    return (
      <div className={`${wrapperLayoutClasses} ${wrapperClassName}`}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
            {required && (
              <span className="ml-1 text-red-500 dark:text-red-400">*</span>
            )}
          </label>
        )}

        {/* Input wrapper for left-label layout */}
        {labelPosition === "left" ? (
          <div className="flex-1 flex flex-col">
            {inputElement}
            {/* Error message */}
            {error && typeof error === "string" && (
              <p
                id={`${inputId}-error`}
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}
            {/* Helper text (only shown when no error message) */}
            {helperText && !(error && typeof error === "string") && (
              <p
                id={`${inputId}-helper`}
                className="mt-1 text-sm text-theme-text-muted"
              >
                {helperText}
              </p>
            )}
          </div>
        ) : (
          <>
            {inputElement}
            {/* Error message */}
            {error && typeof error === "string" && (
              <p
                id={`${inputId}-error`}
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}
            {/* Helper text (only shown when no error message) */}
            {helperText && !(error && typeof error === "string") && (
              <p
                id={`${inputId}-helper`}
                className="mt-1 text-sm text-theme-text-muted"
              >
                {helperText}
              </p>
            )}
          </>
        )}
      </div>
    );
  }
);

PhoneInputCatto.displayName = "PhoneInputCatto";

export default PhoneInputCatto;
