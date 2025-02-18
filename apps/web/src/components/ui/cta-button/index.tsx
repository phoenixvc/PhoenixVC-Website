// components/ui/cta-button/index.tsx
import { FC, memo } from 'react';
import { cn } from '@/lib/utils';
import type { CTAButtonProps } from './types';
import { ctaButtonStyles } from './styles';

const CTAButton: FC<CTAButtonProps> = memo(({
  href,
  className,
  children,
  variant = 'primary',
  target,
  rel,
  ...props
}) => (
  <a
    href={href}
    className={cn(
      ctaButtonStyles.base,
      ctaButtonStyles.variants[variant],
      className
    )}
    target={target}
    rel={target === '_blank' ? 'noopener noreferrer' : rel}
    {...props}
  >
    {children}
  </a>
));

CTAButton.displayName = 'CTAButton';

export { CTAButton };
export type { CTAButtonProps, CTAVariant } from './types';
export default CTAButton;
