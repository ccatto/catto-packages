// @ccatto/ui - InputCatto Component
"use client";

import React, { forwardRef, useId, useRef, useState } from "react";

export interface InputCattoProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "onChange"
  > {
  value?: string;
  /** Custom onChange handler (value, event) - for backwards compatibility */
  onChange?: (
    value: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  /** Native onChange handler for React Hook Form register() compatibility */
  onChangeNative?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  size?: "small" | "medium" | "large";
  className?: string;
  type?: string;
  width?: string;
  variant?: "outlined" | "filled" | "minimal";

  // NEW: Label support
  /** Optional label text displayed above or beside the input */
  label?: string;
  /** Position of the label: 'top' (default) or 'left' (inline) */
  labelPosition?: "top" | "left";
  /** Show required indicator (*) after label */
  required?: boolean;

  // NEW: Error support
  /** Error message (string) or error state (boolean). Shows red styling when truthy. */
  error?: string | boolean;

  // NEW: Helper text
  /** Helper text displayed below the input (hidden when error is shown) */
  helperText?: string;

  /** Additional class names for the wrapper div (only applies when label/error/helperText is used) */
  wrapperClassName?: string;

  /**
   * Hide the show/hide-password eye toggle that's rendered by default for
   * `type="password"` inputs. Has no effect for other input types.
   */
  hidePasswordToggle?: boolean;
}

const InputCatto = forwardRef<HTMLInputElement, InputCattoProps>(
  (
    {
      value,
      onChange,
      onChangeNative,
      placeholder = "",
      size = "medium",
      className = "",
      type = "text",
      width = "w-full",
      variant = "outlined",
      disabled,
      onFocus,
      onBlur,
      // New props
      label,
      labelPosition = "top",
      required,
      error,
      helperText,
      wrapperClassName = "",
      hidePasswordToggle = false,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const generatedId = useId();
    const inputId = providedId || generatedId;

    // Show eye toggle only on password fields, unless explicitly opted out.
    const showPasswordToggle = type === "password" && !hidePasswordToggle;
    const effectiveType =
      showPasswordToggle && showPassword ? "text" : type;

    // Size variations
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
    // Focus ring - uses theme secondary (accent) for focus states
    const errorFocusClasses = hasError
      ? "ring-red-500/20 dark:ring-red-400/20 shadow-red-500/10 dark:shadow-red-400/10"
      : "ring-theme-accent shadow-theme-accent";

    // Variant styles with focus states - explicit colors
    const getVariantClasses = () => {
      // Focus border uses theme secondary (accent color)
      const focusBorder = hasError
        ? "border-red-500 dark:border-red-400"
        : "border-theme-secondary";

      const baseBorder = hasError
        ? "border-red-500 dark:border-red-400"
        : "border-slate-300 dark:border-slate-700";

      switch (variant) {
        case "outlined":
          return `
            border ${isFocused ? focusBorder : baseBorder}
            bg-theme-surface text-theme-text
          `;
        case "filled":
          return `
            border-0 border-b-2 ${isFocused ? focusBorder : baseBorder}
            bg-theme-surface-sunken text-theme-text
          `;
        case "minimal":
          return `
            border-0 border-b ${isFocused ? focusBorder : baseBorder}
            bg-transparent text-theme-text
          `;
        default:
          return "";
      }
    };

    // Focus ring and glow effect
    const focusClasses =
      isFocused && !disabled ? `ring-4 ${errorFocusClasses} shadow-lg` : "";

    // Base states and interactions - explicit colors
    const stateClasses = {
      default: `
        transition-all duration-300 ease-out
        focus:outline-none
        hover:border-slate-400 dark:hover:border-slate-500
        hover:shadow-sm
        placeholder:text-slate-400 dark:placeholder:text-slate-500
      `,
      disabled: `
        opacity-50 cursor-not-allowed
        hover:border-slate-300 dark:hover:border-slate-700
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

    // Handle change - call both native and custom handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      onChangeNative?.(e);
      onChange?.(e.target.value, e);
    };

    // Combine all classes for input. When the password toggle is shown, leave
    // room on the right so the text doesn't run under the eye button.
    const inputClasses = `
      ${width}
      max-w-full min-w-0
      ${sizeClasses[size]}
      ${getVariantClasses()}
      ${disabled ? stateClasses.disabled : stateClasses.default}
      ${focusClasses}
      ${showPasswordToggle ? "pr-10" : ""}
      rounded-md
      ${className}
    `
      .trim()
      .replace(/\s+/g, " ");

    // Label classes based on position
    const labelClasses =
      labelPosition === "left"
        ? "flex items-center text-sm font-medium text-theme-text-muted mr-3 whitespace-nowrap"
        : "block text-sm font-medium text-theme-text-muted mb-1";

    // The input element
    // Only pass value prop if explicitly provided (allows uncontrolled mode for RHF)
    const valueProps = value !== undefined ? { value } : {};

    const baseInput = (
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
        type={effectiveType}
        {...valueProps}
        onChange={handleChange}
        placeholder={placeholder}
        className={inputClasses}
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

    const inputElement = showPasswordToggle ? (
      <div className="relative w-full">
        {baseInput}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((v) => !v)}
          disabled={disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {showPassword ? (
            // eye-off
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          ) : (
            // eye
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          )}
        </button>
      </div>
    ) : (
      baseInput
    );

    // If no wrapper features needed, return just the input (backwards compatible)
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
                className="mt-1 text-sm text-theme-text-subtle"
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
                className="mt-1 text-sm text-theme-text-subtle"
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

InputCatto.displayName = "InputCatto";

export default InputCatto;
