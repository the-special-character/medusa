import { usePrompt } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

type Prompt = {
  title: string
  description: string
  cancelText: string
  confirmText: string
}

/**
 * Hook for managing the state of route modals.
 */
export const useRouteModalState = (): [
  open: boolean,
  onOpenChange: (open: boolean, ignore?: boolean) => void,
  /**
   * Subscribe to the dirty state of the form.
   * If the form is dirty, the modal will prompt
   * the user before closing.
   */
  subscribe: (value: boolean) => void,
] => {
  const [open, setOpen] = useState(false)
  const [shouldPrompt, subscribe] = useState(false)

  const navigate = useNavigate()
  const prompt = usePrompt()
  const { t } = useTranslation()

  let promptValues: Prompt = {
    title: t("general.unsavedChangesTitle"),
    description: t("general.unsavedChangesDescription"),
    cancelText: t("general.cancel"),
    confirmText: t("general.continue"),
  }

  useEffect(() => {
    setOpen(true)
  }, [])

  const onOpenChange = async (open: boolean, ignore = false) => {
    if (!open) {
      if (shouldPrompt && !ignore) {
        const confirmed = await prompt(promptValues)

        if (!confirmed) {
          return
        }
      }

      setTimeout(() => {
        navigate("..", { replace: true })
      }, 200)
    }

    setOpen(open)
  }

  return [open, onOpenChange, subscribe]
}
