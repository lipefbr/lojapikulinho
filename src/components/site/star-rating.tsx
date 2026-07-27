import { StarIcon } from './doodles'
import { cn } from '@/lib/utils'

export function StarRating({
  rating,
  size = 'sm',
  showValue = false,
  count,
  className,
}: {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  count?: number
  className?: string
}) {
  const sizeCls = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5 text-sun">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon
            key={i}
            className={cn(sizeCls, rating >= i ? 'opacity-100' : 'opacity-30')}
            filled={rating >= i}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-bold text-foreground/70">
          {rating.toFixed(1)}
        </span>
      )}
      {typeof count === 'number' && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  )
}
