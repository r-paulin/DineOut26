import { Radio, RadioGroup, Typography } from "@bolteu/kalep-react"

export interface RadioFilterOption {
  id: string
  label: string
}

export interface RadioFilterListProps {
  name: string
  options: RadioFilterOption[]
  value: string
  onChange: (next: string) => void
  /** `aria-labelledby` for the radio group */
  "aria-labelledby": string
}

/**
 * Single-select list with label left and Kalep radio control right (Figma filter sheets).
 */
export function RadioFilterList({
  name,
  options,
  value,
  onChange,
  "aria-labelledby": labelledBy,
}: RadioFilterListProps) {
  return (
    <RadioGroup
      name={name}
      value={value === "" ? undefined : value}
      onChange={(e) => onChange(e.target.value)}
      aria-labelledby={labelledBy}
    >
      <div className="flex flex-col w-full">
        {options.map((opt, index) => (
          <div
            key={opt.id}
            className={`w-full border-b border-separator ${
              index === options.length - 1 ? "border-b-0" : ""
            }`}
          >
            <label
              htmlFor={`${name}-${opt.id}`}
              className="flex flex-row gap-3 items-start w-full cursor-pointer pt-4 pb-[15px]"
            >
              <span className="flex-1 min-w-0 text-start">
                <Typography as="span" variant="body-m-regular">
                  {opt.label}
                </Typography>
              </span>
              <Radio
                id={`${name}-${opt.id}`}
                value={opt.id}
                aria-label={opt.label}
              />
            </label>
          </div>
        ))}
      </div>
    </RadioGroup>
  )
}
