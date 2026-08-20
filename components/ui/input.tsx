import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        destructive:
          'border-destructive text-destructive-placeholder destructive:focus-visible:border-destructive',
        outline: 'border border-input',
        secondary:
          'border-secondary text-secondary-placeholder secondary:focus-visible:border-secondary',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface InputProps extends VariantProps<typeof inputVariants> {
  className?: string
  [key: string]: any // Allow spreading other props like onChange, value, etc.
}

export const Input = React.forwardRef<
  HTMLInputElement,
  InputProps
>(({ className, variant, size, ...props }, ref) => (
  <input
    className={cn(inputVariants({ variant, size, className}))}
    ref={ref}
    {...props}
  />
))
Input.displayName = 'Input'