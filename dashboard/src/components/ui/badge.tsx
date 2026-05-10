/* eslint-disable react-refresh/only-export-components -- shadcn-style CVA + component */
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-zinc-800 text-zinc-100',
        spam: 'border-transparent bg-red-950 text-red-200',
        ham: 'border-transparent bg-emerald-950 text-emerald-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeProps = React.ComponentProps<'div'> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
