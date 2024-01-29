import React from "react"
import {
  useAdminRemoveLocationFromSalesChannel
} from "medusa-react"

type Props = {
  salesChannelId: string
}

const SalesChannel = ({ salesChannelId }: Props) => {
  const removeLocation = useAdminRemoveLocationFromSalesChannel()
  // ...

  const handleRemoveLocation = (locationId: string) => {
    removeLocation.mutate({
      sales_channel_id: salesChannelId,
      location_id: locationId
    }, {
      onSuccess: ({ sales_channel }) => {
        console.log(sales_channel.locations)
      }
    })
  }

  // ...
}

export default SalesChannel
