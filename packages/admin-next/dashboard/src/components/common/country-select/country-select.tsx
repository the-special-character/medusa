import { forwardRef } from "react"

import { TrianglesMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { countries } from "../../../lib/countries"

export const CountrySelect = forwardRef<
  HTMLSelectElement,
  React.ComponentPropsWithoutRef<"select"> & { placeholder?: string }
>(({ className, disabled, placeholder, ...props }, ref) => {
  const { t } = useTranslation()

  return (
    <div className="relative">
      <TrianglesMini
        className={clx(
          "absolute right-2 top-1/2 -translate-y-1/2 text-ui-fg-muted transition-fg pointer-events-none",
          {
            "text-ui-fg-disabled": disabled,
          }
        )}
      />
      <select
        disabled={disabled}
        className={clx(
          "appearance-none bg-ui-bg-field shadow-buttons-neutral transition-fg flex w-full select-none items-center justify-between rounded-md outline-none px-2 py-1 txt-compact-small",
          "placeholder:text-ui-fg-muted text-ui-fg-base",
          "hover:bg-ui-bg-field-hover",
          "focus-visible:shadow-borders-interactive-with-active data-[state=open]:!shadow-borders-interactive-with-active",
          "aria-[invalid=true]:border-ui-border-error aria-[invalid=true]:shadow-borders-error",
          "invalid::border-ui-border-error invalid:shadow-borders-error",
          "disabled:!bg-ui-bg-disabled disabled:!text-ui-fg-disabled",
          className
        )}
        {...props}
        ref={ref}
      >
        {/* Add an empty option so the first option is preselected */}
        <option value="" disabled hidden className="text-ui-fg-muted">
          {placeholder || t("fields.selectCountry")}
        </option>
        {countries.map((country) => {
          return (
            <option key={country.iso_2} value={country.iso_2}>
              {country.display_name}
            </option>
          )
        })}
      </select>
    </div>
  )
})
CountrySelect.displayName = "CountrySelect"
