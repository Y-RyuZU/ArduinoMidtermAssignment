import { useState, useCallback } from 'react'

interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function toast(props: Toast) {
  // 簡単なtoast実装 - 実際の実装では react-hot-toast などを使用することを推奨
  console.log(`Toast: ${props.title} - ${props.description}`);

  if (typeof window !== 'undefined') {
    alert(`${props.title}: ${props.description}`);
  }
}

export function useToast() {
  return { toast }
}