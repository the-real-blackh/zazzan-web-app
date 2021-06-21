import algosdk from "algosdk";
import { apiGetTxnParams } from "./helpers/api";

export type Scenario = (
  address: string,
) => Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean; authAddr?: string }>>;

const signSinglePayTxn: Scenario = async (
  address: string,
): Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean }>> => {
  const suggestedParams = await apiGetTxnParams();

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return txnsToSign;
};

const signSinglePayTxnWithClose: Scenario = async (
  address: string,
): Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean }>> => {
  const suggestedParams = await apiGetTxnParams();

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: "C36WQELJIGAKOSXJVQNE6MQPQ3GOFJENDTBLONUD7GB7J5WNMK5AR6UJ5A",
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return txnsToSign;
};

const signSinglePayTxnWithRekey: Scenario = async (
  address: string,
): Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean }>> => {
  const suggestedParams = await apiGetTxnParams();

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: "K6NE5KNTGSZH5LUCG2ITGDVGG5RUXLCJPUC5WP3JHCUOTUNZJJN5F7L45A",
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return txnsToSign;
};

const signSinglePayTxnWithRekeyAndClose: Scenario = async (
  address: string,
): Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean }>> => {
  const suggestedParams = await apiGetTxnParams();

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: "K6NE5KNTGSZH5LUCG2ITGDVGG5RUXLCJPUC5WP3JHCUOTUNZJJN5F7L45A",
    closeRemainderTo: "C36WQELJIGAKOSXJVQNE6MQPQ3GOFJENDTBLONUD7GB7J5WNMK5AR6UJ5A",
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return txnsToSign;
};

const singleSingleAssetOptInTxn: Scenario = async (
  address: string,
): Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean }>> => {
  const suggestedParams = await apiGetTxnParams();

  const assetIndex = 100;

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return txnsToSign;
};

const singleSingleAssetTransferTxn: Scenario = async (
  address: string,
): Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean }>> => {
  const suggestedParams = await apiGetTxnParams();

  const assetIndex = 100;

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    amount: 1000000,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return txnsToSign;
};

const singleSingleAssetTransferTxnWithClose: Scenario = async (
  address: string,
): Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean }>> => {
  const suggestedParams = await apiGetTxnParams();

  const assetIndex = 100;

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    amount: 1000000,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: "C36WQELJIGAKOSXJVQNE6MQPQ3GOFJENDTBLONUD7GB7J5WNMK5AR6UJ5A",
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
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    to: address,
    assetIndex,
    amount: 1000000,
    note: new Uint8Array(Buffer.from("example note value")),
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
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    to: address,
    assetIndex,
    amount: 1000000,
    note: new Uint8Array(Buffer.from("example note value")),
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

const signTxnWithAssetClose: Scenario = async (
  address: string,
): Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean }>> => {
  const suggestedParams = await apiGetTxnParams();

  const assetIndex = 100;

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    assetIndex,
    amount: 50,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    assetIndex,
    amount: 50,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: "C36WQELJIGAKOSXJVQNE6MQPQ3GOFJENDTBLONUD7GB7J5WNMK5AR6UJ5A",
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1, shouldSign: true },
    { txn: txn2, shouldSign: true },
  ];

  return txnsToSign;
};

const signTxnWithRekey: Scenario = async (
  address: string,
): Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean }>> => {
  const suggestedParams = await apiGetTxnParams();

  const assetIndex = 100;

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    assetIndex,
    amount: 50,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    assetIndex,
    amount: 50,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: "K6NE5KNTGSZH5LUCG2ITGDVGG5RUXLCJPUC5WP3JHCUOTUNZJJN5F7L45A",
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1, shouldSign: true },
    { txn: txn2, shouldSign: true },
  ];

  return txnsToSign;
};

const signTxnWithRekeyAndAssetClose: Scenario = async (
  address: string,
): Promise<Array<{ txn: algosdk.Transaction; shouldSign: boolean }>> => {
  const suggestedParams = await apiGetTxnParams();

  const assetIndex = 100;

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    assetIndex,
    amount: 10,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    assetIndex,
    amount: 20,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: "C36WQELJIGAKOSXJVQNE6MQPQ3GOFJENDTBLONUD7GB7J5WNMK5AR6UJ5A",
    suggestedParams,
  });

  const txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    assetIndex,
    amount: 30,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: "K6NE5KNTGSZH5LUCG2ITGDVGG5RUXLCJPUC5WP3JHCUOTUNZJJN5F7L45A",
    suggestedParams,
  });

  const txn4 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: "NNUQ5WXJJFHGMJERF4U2UAUYXY2DMVF4YQ6P67Q4TM7UNEXTPLAA3LHGPQ",
    assetIndex,
    amount: 40,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: "C36WQELJIGAKOSXJVQNE6MQPQ3GOFJENDTBLONUD7GB7J5WNMK5AR6UJ5A",
    rekeyTo: "K6NE5KNTGSZH5LUCG2ITGDVGG5RUXLCJPUC5WP3JHCUOTUNZJJN5F7L45A",
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1, shouldSign: true },
    { txn: txn2, shouldSign: true },
    { txn: txn3, shouldSign: true },
    { txn: txn4, shouldSign: true },
  ];

  return txnsToSign;
};

export const scenarios: Array<{ name: string; scenario: Scenario }> = [
  {
    name: "Sign single pay txn",
    scenario: signSinglePayTxn,
  },
  {
    name: "Sign single pay txn with close",
    scenario: signSinglePayTxnWithClose,
  },
  {
    name: "Sign single pay txn with rekey",
    scenario: signSinglePayTxnWithRekey,
  },
  {
    name: "Sign single pay txn with rekey and close",
    scenario: signSinglePayTxnWithRekeyAndClose,
  },
  {
    name: "Sign single asset opt-in txn",
    scenario: singleSingleAssetOptInTxn,
  },
  {
    name: "Sign single asset transfer txn",
    scenario: singleSingleAssetTransferTxn,
  },
  {
    name: "Sign single asset transfer txn with close",
    scenario: singleSingleAssetTransferTxnWithClose,
  },
  {
    name: "Sign 1 of 2 txns from a group",
    scenario: sign1FromGroupTxn,
  },
  {
    name: "Sign 2 of 3 txns from a group",
    scenario: sign2FromGroupTxn,
  },
  {
    name: "Sign txn group with asset close",
    scenario: signTxnWithAssetClose,
  },
  {
    name: "Sign txn group with rekey",
    scenario: signTxnWithRekey,
  },
  {
    name: "Sign txn group with rekey and asset close",
    scenario: signTxnWithRekeyAndAssetClose,
  },
];
