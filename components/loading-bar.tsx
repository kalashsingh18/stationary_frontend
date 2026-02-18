'use client'

import * as React from 'react'
import { loadingState } from '@/lib/loading-state'

export function LoadingBar() {
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    const unsubscribe = loadingState.subscribe((loading) => {
      setIsLoading(loading)
    })
    return () => unsubscribe()
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/20 overflow-hidden">
      <div className="h-full bg-primary animate-progress-indeterminate origin-left" />
    </div>
  )
}
