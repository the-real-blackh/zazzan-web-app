import * as React from "react";
import { formatBigNumWithDecimals } from "../helpers/utilities";
import { IAssetData } from "../helpers/types";
import { getZANIndex } from "../scenarios";
import { ChainType } from "../helpers/api";

const ZazzanAdminFund = (props: { asset: Record<string, any>, adminFundAssets: IAssetData[], chain: ChainType }) => {
  const { asset, adminFundAssets, chain } = props;
  const zanAssetID = getZANIndex(chain);
  const tokens = adminFundAssets.filter((asset: IAssetData) => asset && asset.id === zanAssetID);

  const adminFundBalance = tokens[0].amount;
  const zanDecimals = Number(asset.params.decimals);

  return (
      <div>ZAN admin fund balance:&nbsp;
          {`${formatBigNumWithDecimals(adminFundBalance, zanDecimals)} ${asset.params["unit-name"] || "units"}`}
      </div>
    )
}

export default ZazzanAdminFund;
