import { User } from "@medusajs/medusa"
import * as zod from "zod"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Drawer, Input, Select, Switch } from "@medusajs/ui"
import { adminAuthKeys, useAdminUpdateUser } from "medusa-react"
import { useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { Form } from "../../../../../components/common/form"
import { languages } from "../../../../../i18n/config"
import { queryClient } from "../../../../../lib/medusa"

type EditProfileProps = {
  user: Omit<User, "password_hash">
  usageInsights: boolean
  onSuccess: () => void
}

const EditProfileSchema = zod.object({
  first_name: zod.string().optional(),
  last_name: zod.string().optional(),
  language: zod.string(),
  usage_insights: zod.boolean(),
})

export const EditProfileForm = ({
  user,
  usageInsights,
  onSuccess,
}: EditProfileProps) => {
  const { t, i18n } = useTranslation()
  const { mutateAsync, isLoading } = useAdminUpdateUser(user.id)

  const form = useForm<zod.infer<typeof EditProfileSchema>>({
    defaultValues: {
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      language: i18n.language,
      usage_insights: usageInsights,
    },
    resolver: zodResolver(EditProfileSchema),
  })

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
  }

  const sortedLanguages = languages.sort((a, b) =>
    a.display_name.localeCompare(b.display_name)
  )

  const handleSubmit = form.handleSubmit(async (values) => {
    await mutateAsync(
      {
        first_name: values.first_name,
        last_name: values.last_name,
      },
      {
        onSuccess: ({ user }) => {
          form.reset({
            first_name: user.first_name,
            last_name: user.last_name,
          })

          // Invalidate the current user session.
          queryClient.invalidateQueries(adminAuthKeys.details())
        },
        onError: () => {
          return
        },
      }
    )

    changeLanguage(values.language)

    onSuccess()
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <Drawer.Body>
          <div className="flex flex-col gap-y-8">
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t("fields.firstName")}</Form.Label>
                    <Form.Control>
                      <Input {...field} size="small" />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t("fields.lastName")}</Form.Label>
                    <Form.Control>
                      <Input {...field} size="small" />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
            </div>
            <Form.Field
              control={form.control}
              name="language"
              render={({ field: { ref, ...field } }) => (
                <Form.Item className="gap-y-4">
                  <div>
                    <Form.Label>{t("profile.language")}</Form.Label>
                    <Form.Hint>{t("profile.languageHint")}</Form.Hint>
                  </div>
                  <div>
                    <Form.Control>
                      <Select
                        {...field}
                        // open={selectOpen}
                        // onOpenChange={setSelectOpen}
                        value={field.value}
                        onValueChange={field.onChange}
                        size="small"
                      >
                        <Select.Trigger ref={ref} className="py-1 text-[13px]">
                          <Select.Value placeholder="Choose language">
                            {
                              sortedLanguages.find(
                                (language) => language.code === field.value
                              )?.display_name
                            }
                          </Select.Value>
                        </Select.Trigger>
                        <Select.Content>
                          {languages.map((language) => (
                            <Select.Item
                              key={language.code}
                              value={language.code}
                            >
                              {language.display_name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.ErrorMessage />
                  </div>
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="usage_insights"
              render={({ field: { value, onChange, ...rest } }) => (
                <Form.Item>
                  <div className="flex items-center justify-between">
                    <Form.Label>{t("profile.usageInsights")}</Form.Label>
                    <Form.Control>
                      <Switch
                        {...rest}
                        checked={value}
                        onCheckedChange={onChange}
                      />
                    </Form.Control>
                  </div>
                  <Form.Hint>
                    <span>
                      <Trans
                        i18nKey="profile.userInsightsHint"
                        components={[
                          <a
                            className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-fg underline"
                            href="https://docs.medusajs.com/usage#admin-analytics"
                            target="_blank"
                            rel="noopener noreferrer"
                          />,
                        ]}
                      />
                    </span>
                  </Form.Hint>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <div className="flex items-center gap-x-2">
            <Drawer.Close asChild>
              <Button size="small" variant="secondary">
                {t("general.cancel")}
              </Button>
            </Drawer.Close>
            <Button size="small" type="submit" isLoading={isLoading}>
              {t("general.save")}
            </Button>
          </div>
        </Drawer.Footer>
      </form>
    </Form>
  )
}
