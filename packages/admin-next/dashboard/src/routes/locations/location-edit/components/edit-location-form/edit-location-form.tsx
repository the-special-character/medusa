import { zodResolver } from "@hookform/resolvers/zod"
import { StockLocationExpandedDTO } from "@medusajs/types"
import { Button, Drawer, Input } from "@medusajs/ui"
import { useAdminUpdateStockLocation } from "medusa-react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as zod from "zod"
import { CountrySelect } from "../../../../../components/common/country-select"
import { Form } from "../../../../../components/common/form"

type EditLocationFormProps = {
  location: StockLocationExpandedDTO
}

const EditLocationSchema = zod.object({
  name: zod.string().min(1),
  address: zod.object({
    address_1: zod.string().min(1),
    address_2: zod.string().optional(),
    country_code: zod.string().min(2).max(2),
    city: zod.string().optional(),
    postal_code: zod.string().optional(),
    province: zod.string().optional(),
    company: zod.string().optional(),
    phone: zod.string().optional(), // TODO: Add validation
  }),
})

export const EditLocationForm = ({ location }: EditLocationFormProps) => {
  const form = useForm<zod.infer<typeof EditLocationSchema>>({
    defaultValues: {
      name: location.name,
      address: {
        address_1: location.address?.address_1 || "",
        address_2: location.address?.address_2 || "",
        city: location.address?.city || "",
        company: location.address?.company || "",
        country_code: location.address?.country_code || "",
        phone: location.address?.phone || "",
        postal_code: location.address?.postal_code || "",
        province: location.address?.province || "",
      },
    },
    resolver: zodResolver(EditLocationSchema),
  })

  const { mutateAsync, isLoading } = useAdminUpdateStockLocation(location.id)

  const { t } = useTranslation()

  const handleSubmit = form.handleSubmit(async (values) => {
    mutateAsync({
      name: values.name,
      address: values.address,
    })
  })

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <Drawer.Body className="flex flex-col gap-y-8 overflow-y-auto">
          <div>
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t("fields.name")}</Form.Label>
                    <Form.Control>
                      <Input size="small" {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Field
              control={form.control}
              name="address.address_1"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t("fields.address")}</Form.Label>
                    <Form.Control>
                      <Input size="small" {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="address.address_2"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>{t("fields.address2")}</Form.Label>
                    <Form.Control>
                      <Input size="small" {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="address.postal_code"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>{t("fields.postalCode")}</Form.Label>
                    <Form.Control>
                      <Input size="small" {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="address.city"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>{t("fields.city")}</Form.Label>
                    <Form.Control>
                      <Input size="small" {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="address.country_code"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t("fields.country")}</Form.Label>
                    <Form.Control>
                      <CountrySelect {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="address.province"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>{t("fields.state")}</Form.Label>
                    <Form.Control>
                      <Input size="small" {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="address.company"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>{t("fields.company")}</Form.Label>
                    <Form.Control>
                      <Input size="small" {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="address.phone"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>{t("fields.phone")}</Form.Label>
                    <Form.Control>
                      <Input size="small" {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <Drawer.Close asChild>
              <Button size="small" variant="secondary">
                {t("general.cancel")}
              </Button>
            </Drawer.Close>
            <Button size="small">{t("general.save")}</Button>
          </div>
        </Drawer.Footer>
      </form>
    </Form>
  )
}
