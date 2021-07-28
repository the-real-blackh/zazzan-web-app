import algosdk from "algosdk";
import { apiGetTxnParams, ChainType } from "./helpers/api";

const testAccounts = [
  algosdk.mnemonicToSecretKey(
    "cannon scatter chest item way pulp seminar diesel width tooth enforce fire rug mushroom tube sustain glide apple radar chronic ask plastic brown ability badge",
  ),
  algosdk.mnemonicToSecretKey(
    "person congress dragon morning road sweet horror famous bomb engine eager silent home slam civil type melt field dry daring wheel monitor custom above term",
  ),
  algosdk.mnemonicToSecretKey(
    "faint protect home drink journey humble tube clinic game rough conduct sell violin discover limit lottery anger baby leaf mountain peasant rude scene abstract casual",
  ),
];

export function signTxnWithTestAccount(txn: algosdk.Transaction): Uint8Array {
  const sender = algosdk.encodeAddress(txn.from.publicKey);

  for (const testAccount of testAccounts) {
    if (testAccount.addr === sender) {
      return txn.signTxn(testAccount.sk);
    }
  }

  throw new Error(`Cannot sign transaction from unknown test account: ${sender}`);
}

export interface IScenarioTxn {
  txn: algosdk.Transaction;
  shouldSign: boolean;
  authAddr?: string;
  message?: string;
}

export type ScenarioReturnType = IScenarioTxn[][];

export type Scenario = (chain: ChainType, address: string) => Promise<ScenarioReturnType>;

const singlePayTxn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return [txnsToSign];
};

const singlePayTxnWithClose: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return [txnsToSign];
};

const singlePayTxnWithRekey: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return [txnsToSign];
};

const singlePayTxnWithRekeyAndClose: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: testAccounts[2].addr,
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return [txnsToSign];
};

const singleAssetOptInTxn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

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
  return [txnsToSign];
};

const singleAssetTransferTxn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const assetIndex = 11711; // HipoCoin on TestNet

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 1000000,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return [txnsToSign];
};

const singleAssetTransferTxnWithClose: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const assetIndex = 100;

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 1000000,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return [txnsToSign];
};

const singleAppOptIn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const appIndex = 200;

  const txn = algosdk.makeApplicationOptInTxnFromObject({
    from: address,
    appIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    appArgs: [Uint8Array.from([0]), Uint8Array.from([0, 1])],
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return [txnsToSign];
};

const singleAppCall: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const appIndex = 200;

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: address,
    appIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    appArgs: [Uint8Array.from([0]), Uint8Array.from([0, 1])],
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return [txnsToSign];
};

const singleAppCallWithRekey: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const appIndex = 200;

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: address,
    appIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    appArgs: [Uint8Array.from([0]), Uint8Array.from([0, 1])],
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return [txnsToSign];
};

const singleAppCloseOut: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const appIndex = 200;

  const txn = algosdk.makeApplicationCloseOutTxnFromObject({
    from: address,
    appIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    appArgs: [Uint8Array.from([0]), Uint8Array.from([0, 1])],
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true }];
  return [txnsToSign];
};

const sign1FromGroupTxn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

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
    from: testAccounts[0].addr,
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

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const sign2FromGroupTxn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

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
    from: testAccounts[0].addr,
    to: address,
    assetIndex,
    amount: 1000000,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 500000,
    note: new Uint8Array(Buffer.from("this is a payment txn")),
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1, shouldSign: true },
    { txn: txn2, shouldSign: false },
    { txn: txn3, shouldSign: true },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const signGroupWithPayOptinTransfer: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const assetIndex = 100;

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 500000,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    assetIndex,
    amount: 0,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    assetIndex,
    amount: 1000000,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1, shouldSign: true },
    { txn: txn2, shouldSign: true },
    { txn: txn3, shouldSign: true },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const signGroupWithPayRekey: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 500000,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 500000,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1, shouldSign: true },
    { txn: txn2, shouldSign: true },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const signGroupOf7: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const assetIndex = 100;

  const optIn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const assetXfer = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    assetIndex,
    amount: 50,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const assetClose = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    assetIndex,
    amount: 50,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const payment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 500000,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const accountClose = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 0,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const accountRekey = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 1000,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const accountRekeyAndClose = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 50000,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const txnsToSign = [
    { txn: optIn, shouldSign: true },
    { txn: assetXfer, shouldSign: true },
    { txn: assetClose, shouldSign: true },
    { txn: payment, shouldSign: true },
    { txn: accountClose, shouldSign: true },
    { txn: accountRekey, shouldSign: true },
    { txn: accountRekeyAndClose, shouldSign: true },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const signTxnWithAssetClose: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const assetIndex = 100;

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    assetIndex,
    amount: 50,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    assetIndex,
    amount: 50,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1, shouldSign: true },
    { txn: txn2, shouldSign: true },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const signTxnWithRekey: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const assetIndex = 100;

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    assetIndex,
    amount: 50,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    assetIndex,
    amount: 50,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1, shouldSign: true },
    { txn: txn2, shouldSign: true },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const signTxnWithRekeyAndAssetClose: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const assetIndex = 100;

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    assetIndex,
    amount: 10,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    assetIndex,
    amount: 20,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    assetIndex,
    amount: 30,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const txn4 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    assetIndex,
    amount: 40,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1, shouldSign: true },
    { txn: txn2, shouldSign: true },
    { txn: txn3, shouldSign: true },
    { txn: txn4, shouldSign: true },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const fullTxnGroup: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txnsToSign: Array<{ txn: algosdk.Transaction; shouldSign: boolean }> = [];

  for (let i = 0; i < 8; i++) {
    const assetIndex = 100 + i;

    const optIn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: address,
      amount: 0,
      assetIndex,
      note: new Uint8Array(Buffer.from("example note value")),
      suggestedParams,
    });

    const closeOut = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: address,
      amount: 0,
      assetIndex,
      note: new Uint8Array(Buffer.from("example note value")),
      closeRemainderTo: testAccounts[1].addr,
      suggestedParams,
    });

    txnsToSign.push({ txn: optIn, shouldSign: true });
    txnsToSign.push({ txn: closeOut, shouldSign: true });
  }

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const singlePayTxnWithInvalidAuthAddress: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [{ txn, shouldSign: true, authAddr: "INVALID_ADDRESS" }];
  return [txnsToSign];
};

const multipleNonAtomicTxns: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100001,
    note: new Uint8Array(Buffer.from("txn 1")),
    suggestedParams,
  });

  const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100002,
    note: new Uint8Array(Buffer.from("txn 2")),
    suggestedParams,
  });

  const txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100003,
    note: new Uint8Array(Buffer.from("txn 3")),
    suggestedParams,
  });

  const group1 = [{ txn: txn1, shouldSign: true }];
  // not necessary to do this, but let's test it works
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [{ txn: txn2, shouldSign: true }];

  const group3 = [{ txn: txn3, shouldSign: true }];

  return [group1, group2, group3];
};

const atomicGroupAndNonAtomicTxns: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100001,
    note: new Uint8Array(Buffer.from("atomic group 1 txn 1")),
    suggestedParams,
  });

  const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100002,
    note: new Uint8Array(Buffer.from("atomic group 2 txn 2")),
    suggestedParams,
  });

  const txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100003,
    note: new Uint8Array(Buffer.from("txn 3")),
    suggestedParams,
  });

  const txn4 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100004,
    note: new Uint8Array(Buffer.from("txn 4")),
    suggestedParams,
  });

  const group1 = [
    { txn: txn1, shouldSign: true },
    { txn: txn2, shouldSign: true },
  ];
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [{ txn: txn3, shouldSign: true }];

  const group3 = [{ txn: txn4, shouldSign: true }];

  return [group1, group2, group3];
};

const multipleAtomicGroups: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100001,
    note: new Uint8Array(Buffer.from("atomic group 1 txn 1")),
    suggestedParams,
  });

  const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100002,
    note: new Uint8Array(Buffer.from("atomic group 1 txn 2")),
    suggestedParams,
  });

  const txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100003,
    note: new Uint8Array(Buffer.from("atomic group 2 txn 1")),
    suggestedParams,
  });

  const txn4 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100004,
    note: new Uint8Array(Buffer.from("atomic group 2 txn 2")),
    suggestedParams,
  });

  const group1 = [
    { txn: txn1, shouldSign: true },
    { txn: txn2, shouldSign: true },
  ];
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [
    { txn: txn3, shouldSign: true },
    { txn: txn4, shouldSign: true },
  ];
  algosdk.assignGroupID(group2.map(toSign => toSign.txn));

  return [group1, group2];
};

export const scenarios: Array<{ name: string; scenario: Scenario }> = [
  {
    name: "1. Sign single pay txn",
    scenario: singlePayTxn,
  },
  {
    name: "2. Sign single pay txn with close",
    scenario: singlePayTxnWithClose,
  },
  {
    name: "3. Sign single pay txn with rekey",
    scenario: singlePayTxnWithRekey,
  },
  {
    name: "4. Sign single pay txn with rekey and close",
    scenario: singlePayTxnWithRekeyAndClose,
  },
  {
    name: "5. Sign single asset opt-in txn",
    scenario: singleAssetOptInTxn,
  },
  {
    name: "6. Sign single asset transfer txn",
    scenario: singleAssetTransferTxn,
  },
  {
    name: "7. Sign single asset transfer txn with close",
    scenario: singleAssetTransferTxnWithClose,
  },
  {
    name: "8. Sign single app opt-in txn",
    scenario: singleAppOptIn,
  },
  {
    name: "9. Sign single app call txn",
    scenario: singleAppCall,
  },
  {
    name: "10. Sign single app call txn with rekey",
    scenario: singleAppCallWithRekey,
  },
  {
    name: "11. Sign single app close out txn",
    scenario: singleAppCloseOut,
  },
  {
    name: "12. Sign 1 of 2 txns from a group",
    scenario: sign1FromGroupTxn,
  },
  {
    name: "13. Sign 2 of 3 txns from a group",
    scenario: sign2FromGroupTxn,
  },
  {
    name: "14. Sign txn group with pay, asset opt-in, and asset transfer",
    scenario: signGroupWithPayOptinTransfer,
  },
  {
    name: "15. Sign txn group with pay and rekey",
    scenario: signGroupWithPayRekey,
  },
  {
    name: "16. Sign txn group with asset close",
    scenario: signTxnWithAssetClose,
  },
  {
    name: "17. Sign txn group with rekey",
    scenario: signTxnWithRekey,
  },
  {
    name: "18. Sign txn group with rekey and asset close",
    scenario: signTxnWithRekeyAndAssetClose,
  },
  {
    name: "19. Sign group of 7",
    scenario: signGroupOf7,
  },
  {
    name: "20. Full txn group",
    scenario: fullTxnGroup,
  },
  {
    name: "21. Single pay txn with invalid auth address",
    scenario: singlePayTxnWithInvalidAuthAddress,
  },
  {
    name: "22. Sign multiple non-atomic txns",
    scenario: multipleNonAtomicTxns,
  },
  {
    name: "23. Sign atomic txn group and non-atomic txns",
    scenario: atomicGroupAndNonAtomicTxns,
  },
  {
    name: "24. Sign multiple atomic txn groups",
    scenario: multipleAtomicGroups,
  },
];
