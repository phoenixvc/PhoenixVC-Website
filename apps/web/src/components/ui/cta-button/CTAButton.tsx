import { FC, memo } from "react";
import { cn } from "@/lib/utils";
import type { CTAButtonProps } from "./types";
import styles from "./cta-button.module.css";

const CTAButton: FC<CTAButtonProps> = memo(
  ({
    href,
    className,
    children,
    variant = "primary",
    target,
    rel,
    "aria-label": ariaLabel,
    ...props
  }) => {
    const variantClass =
      variant === "secondary" ? styles.secondary : styles.primary;

    return (
      <a
        href={href}
        className={cn(styles.base, variantClass, className)}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : rel}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </a>
    );
  },
);

CTAButton.displayName = "CTAButton";
export default CTAButton;
