import { useCallback, useState } from "react"

export type RestaurantAboutAccordionId =
  | "serviceTypes"
  | "whatWeServe"
  | "amenities"
  | "otherDetails"

export function useRestaurantAbout() {
  const [openAccordion, setOpenAccordion] =
    useState<RestaurantAboutAccordionId | null>(null)

  const toggleAccordion = useCallback((id: RestaurantAboutAccordionId) => {
    setOpenAccordion((prev) => (prev === id ? null : id))
  }, [])

  return { openAccordion, setOpenAccordion, toggleAccordion }
}
