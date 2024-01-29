import { AdminProductsRes } from "@medusajs/medusa"
import { Response } from "@medusajs/medusa-js"
import { adminRegionKeys } from "medusa-react"
import { LoaderFunctionArgs } from "react-router-dom"

import { medusa, queryClient } from "../../../lib/medusa"

const regionQuery = (id: string) => ({
  queryKey: adminRegionKeys.detail(id),
  queryFn: async () => medusa.admin.regions.retrieve(id),
})

export const regionLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id
  const query = regionQuery(id!)

  return (
    queryClient.getQueryData<Response<AdminProductsRes>>(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  )
}
