/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { SetRelation, Merge } from "../core/ModelUtils"

/**
 * The details of the country to add to the region.
 */
export interface AdminPostRegionsRegionCountriesReq {
  /**
   * The 2 character ISO code for the Country.
   */
  country_code: string
}
