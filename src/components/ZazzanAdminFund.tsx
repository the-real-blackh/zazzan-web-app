import * as React from "react";
import { formatBigNumWithDecimals } from "../helpers/utilities";
import { IAssetData } from "../helpers/types";
import { getZANIndex } from "../scenarios";
import { ChainType } from "../helpers/api";
import styled from "styled-components";

const SSpan = styled.span`
`;

const ZazzanAdminFund = (props: { asset: Record<string, any>, adminFundAssets: IAssetData[], chain: ChainType }) => {
  const { asset, adminFundAssets, chain } = props;
  const zanAssetID = getZANIndex(chain);
  const tokens = adminFundAssets.filter((asset: IAssetData) => asset && asset.id === zanAssetID);

  const adminFundBalance = tokens[0].amount;
  const zanDecimals = Number(asset.params.decimals);

  return (
      <SSpan>admin fund balance:&nbsp;
          {`${formatBigNumWithDecimals(adminFundBalance, zanDecimals)} ${asset.params["unit-name"] || "units"}`}
      </SSpan>
    )
}

export default ZazzanAdminFund;
