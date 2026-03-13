import React, { ReactNode } from "react";
import clsx from "clsx";

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <fieldset
      className={clsx(
        "space-y-6 rounded-lg border border-gray-700 bg-gray-900/50 p-6",
        className
      )}
    >
      {(title || description) && (
        <div className="space-y-2">
          {title && <legend className="text-lg font-semibold">{title}</legend>}
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-6">{children}</div>
    </fieldset>
  );
}
