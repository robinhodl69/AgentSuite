import { Button as AntButton } from 'antd'
import type { ButtonProps as AntButtonProps } from 'antd'
import type { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface AppButtonProps
  extends Omit<
    AntButtonProps,
    'children' | 'danger' | 'htmlType' | 'loading' | 'size' | 'type' | 'variant'
  > {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  isLoading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const sizeMap: Record<ButtonSize, 'small' | 'middle' | 'large'> = {
  sm: 'small',
  md: 'middle',
  lg: 'large',
}

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    'border-0 bg-gradient-to-r from-[#1d4ed8] via-[#3b82f6] to-[#06b6d4] shadow-[0_12px_32px_rgba(59,130,246,0.22)] hover:shadow-[0_16px_40px_rgba(59,130,246,0.30)]',
  secondary:
    'border-[var(--as-border-strong)] bg-transparent text-[var(--as-text-secondary)] hover:border-[var(--as-text-muted)] hover:text-[var(--as-text-primary)] hover:bg-[var(--as-bg-hover)]',
  ghost:
    'border-transparent bg-transparent text-[var(--as-text-secondary)] hover:bg-[var(--as-bg-hover)] hover:text-[var(--as-text-primary)]',
  danger:
    'border-[var(--as-error)]/20 bg-[var(--as-error)]/10 text-[var(--as-error)] hover:border-[var(--as-error)]/30 hover:bg-[var(--as-error)]/15',
}

export function AppButton({
  variant = 'primary',
  size = 'md',
  children,
  isLoading,
  disabled,
  className = '',
  type = 'button',
  ...props
}: AppButtonProps) {
  const buttonType =
    variant === 'primary' ? 'primary' : variant === 'ghost' ? 'text' : 'default'

  return (
    <AntButton
      htmlType={type}
      type={buttonType}
      danger={variant === 'danger'}
      size={sizeMap[size]}
      loading={isLoading}
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center rounded-[var(--as-radius-md)] font-mono text-[11px] font-semibold uppercase tracking-[0.12em]',
        variantClassName[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </AntButton>
  )
}
