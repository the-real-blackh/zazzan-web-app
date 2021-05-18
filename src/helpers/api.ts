import algosdk from "algosdk";
import { IAssetData } from "./types";

const client = new algosdk.Algodv2("", "https://algoexplorerapi.io", "");

export async function apiGetAccountAssets(address: string): Promise<IAssetData[]> {
  const accountInfo = await client
    .accountInformation(address)
    .setIntDecoding(algosdk.IntDecoding.BIGINT)
    .do();

  const algoBalance = accountInfo.amount as bigint;
  const assetsFromRes: Array<{
    "asset-id": bigint;
    amount: bigint;
    creator: string;
    frozen: boolean;
  }> = accountInfo.assets;

  const assets: IAssetData[] = assetsFromRes.map(({ "asset-id": id, amount, creator, frozen }) => ({
    id: Number(id),
    amount,
    creator,
    frozen,
    decimals: 0,
  }));

  assets.sort((a, b) => a.id - b.id);

  await Promise.all(
    assets.map(async asset => {
      const { params } = await client.getAssetByID(asset.id).do();
      asset.name = params.name;
      asset.unitName = params["unit-name"];
      asset.url = params.url;
      asset.decimals = params.decimals;
    }),
  );

  assets.unshift({
    id: 0,
    amount: algoBalance,
    creator: "",
    frozen: false,
    decimals: 6,
    name: "Algo",
    unitName: "Algo",
  });

  return assets;
}

export async function apiGetTxnParams(): Promise<algosdk.SuggestedParams> {
  const params = await client.getTransactionParams().do();
  return params;
}

// export async function sendTransaction(txn: )
