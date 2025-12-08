import React from "react"

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-rpg-secondary/30 rounded ${className}`} />
  )
}
