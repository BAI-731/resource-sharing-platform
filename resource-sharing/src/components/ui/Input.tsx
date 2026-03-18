import React, { InputHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className={cn(
          'block text-sm font-medium mb-2 transition-colors',
          error ? 'text-red-600' : 'text-text-primary'
        )}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          className={cn(
            'w-full px-4 py-3 rounded-xl border bg-white text-text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-primary transition-all duration-200',
            leftIcon && 'pl-12',
            rightIcon && 'pr-12',
            error
              ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
              : focused
              ? 'border-primary ring-primary/20'
              : 'border-gray-200',
            props.disabled && 'bg-gray-50 cursor-not-allowed',
            className
          )}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1.5">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1.5">{helperText}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({ label, error, helperText, className, ...props }: TextareaProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className={cn(
          'block text-sm font-medium mb-2 transition-colors',
          error ? 'text-red-600' : 'text-text-primary'
        )}>
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-4 py-3 rounded-xl border bg-white text-text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-primary transition-all duration-200 resize-none',
          error
            ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
            : focused
            ? 'border-primary ring-primary/20'
            : 'border-gray-200',
          props.disabled && 'bg-gray-50 cursor-not-allowed',
          className
        )}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1.5">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1.5">{helperText}</p>
      )}
    </div>
  );
}
