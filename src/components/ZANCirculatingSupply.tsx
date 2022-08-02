import * as React from "react";
import { formatBigNumWithDecimals } from "../helpers/utilities";
import { IAssetData } from "../helpers/types";
import { getZANIndex } from "../scenarios";
import { ChainType } from "../helpers/api";
import styled from "styled-components";

const SSpan = styled.span`
`;

const ZANCirculatingSupply = (props: { asset: Record<string, any>, appAssets: IAssetData[], chain: ChainType }) => {
  const { asset, appAssets, chain } = props;
  const zanAssetID = getZANIndex(chain);
  const tokens = appAssets.filter((asset: IAssetData) => asset && asset.id === zanAssetID);

  const circSupply = asset.params.total - tokens[0].amount;
  const zanDecimals = Number(asset.params.decimals);

  return (
      <SSpan>circulating supply:&nbsp;
          {`${formatBigNumWithDecimals(circSupply, zanDecimals)} ${asset.params["unit-name"] || "units"}`}
      </SSpan>
    )
}

export default ZANCirculatingSupply;
