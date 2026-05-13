import { useRef, useState } from "react"

export function useSearchInputField() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  return { inputRef, focused, setFocused }
}
