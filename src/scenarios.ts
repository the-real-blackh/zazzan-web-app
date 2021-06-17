import algosdk from "algosdk";
import { apiGetTxnParams } from "./helpers/api";

export type Scenario = (
  address: string,
) => Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean }>>;

const signSingleTxn: Scenario = async (
  address: string,
): Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean }>> => {
  const suggestedParams = await apiGetTxnParams();

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    amount: 100000,
    note: new Uint8Array(Buffer.from("this is a single payment txn")),
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return txnsToSign;
};

const sign1FromGroupTxn: Scenario = async (
  address: string,
): Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean }>> => {
  const suggestedParams = await apiGetTxnParams();

  const assetIndex = 100;

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    assetIndex,
    amount: 0,
    note: new Uint8Array(Buffer.from("this is an opt-in txn")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    to: address,
    assetIndex,
    amount: 1000000,
    note: new Uint8Array(Buffer.from("this is an asset receive txn")),
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1, shouldSign: true },
    { txn: txn2, shouldSign: false },
  ];

  return txnsToSign;
};

const sign2FromGroupTxn: Scenario = async (
  address: string,
): Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean }>> => {
  const suggestedParams = await apiGetTxnParams();

  const assetIndex = 100;

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    assetIndex,
    amount: 0,
    note: new Uint8Array(Buffer.from("this is an opt-in txn")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    to: address,
    assetIndex,
    amount: 1000000,
    note: new Uint8Array(Buffer.from("this is an asset receive txn")),
    suggestedParams,
  });

  const txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    amount: 500000,
    note: new Uint8Array(Buffer.from("this is a payment txn")),
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1, shouldSign: true },
    { txn: txn2, shouldSign: false },
    { txn: txn3, shouldSign: true },
  ];

  return txnsToSign;
};

export const scenarios: Array<{ name: string, scenario: Scenario }> = [
  {
    name: "Sign a single txn",
    scenario: signSingleTxn,
  },
  {
    name: "Sign 1 txn from a group",
    scenario: sign1FromGroupTxn,
  },
  {
    name: "Sign 2 txns from a group",
    scenario: sign2FromGroupTxn,
  },
];
