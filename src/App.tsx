import * as React from "react";
import styled from "styled-components";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";
import { IInternalEvent } from "@walletconnect/types";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
import algosdk from "algosdk";
import Button from "./components/Button";
import Column from "./components/Column";
import Wrapper from "./components/Wrapper";
import Modal from "./components/Modal";
import Header from "./components/Header";
import Loader from "./components/Loader";
import { fonts } from "./styles";
import { apiGetAccountAssets, apiGetAssetByID, apiSubmitTransactions, ChainType, apiGetApplicationByID } from "./helpers/api";
import { IAssetData, IWalletTransaction, SignTxnParams } from "./helpers/types";
import AccountAssets from "./components/AccountAssets";
import ZANCirculatingSupply from "./components/ZANCirculatingSupply";
import ZazzanAdminFund from "./components/ZazzanAdminFund";
import { Scenario, scenarios, signTxnWithTestAccount, getZANIndex, getZazzanAppIndex, getZazzanAppAddress, getZazzanAdminFundAddress } from "./scenarios";

const SLayout = styled.div`
  position: relative;
  width: 100%;
  /* height: 100%; */
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled(Wrapper as any)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SLanding = styled(Column as any)`
  height: 600px;
`;

const SButtonContainer = styled(Column as any)`
  width: 250px;
  margin: 50px 0;
`;

const SConnectButton = styled(Button as any)`
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  height: 70px;
  width: 100%;
  margin: 12px 0;
`;

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SModalContainer = styled.div`
  width: 100%;
  position: relative;
  word-wrap: break-word;
`;

const SModalTitle = styled.div`
  margin: 1em 0;
  font-size: 20px;
  font-weight: 700;
`;

const SModalButton = styled.button`
  margin: 1em 0;
  font-size: 18px;
  font-weight: 700;
`;

const SModalInput = styled.input`
  border: 1px solid #000;
  border-radius: 10px;
  padding: 10px;
  margin: 5px;
  width: 150px;
  box-sizing: border-box;
`;

const SModalParagraph = styled.p`
  margin-top: 30px;
`;

// @ts-ignore
const SBalances = styled(SLanding as any)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`;

const STable = styled(SContainer as any)`
  flex-direction: column;
  text-align: left;
`;

const SRow = styled.div`
  width: 100%;
  display: flex;
  margin: 6px 0;
`;

const SKey = styled.div`
  width: 30%;
  font-weight: 700;
`;

const SValue = styled.div`
  width: 70%;
  font-family: monospace;
`;

const STestButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

const STestButton = styled(Button as any)`
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  height: 64px;
  width: 100%;
  max-width: 175px;
  margin: 12px;
`;

interface IResult {
  method: string;
  body: Array<
    Array<{
      txID: string;
      signingAddress?: string;
      signature: string;
    } | null>
  >;
}

interface IAppState {
  connector: WalletConnect | null;
  fetching: boolean;
  connected: boolean;
  showModal: boolean;
  pendingRequest: boolean;
  requestArg: { text : string, resolve : (value : number) => void } | null;
  signedTxns: Uint8Array[][] | null;
  pendingSubmissions: Array<number | Error>;
  uri: string;
  accounts: string[];
  address: string;
  result: IResult | null;
  chain: ChainType;
  assets: IAssetData[];
  zanAsset: Record<string, any> | null;
  zazzanAppAssets: IAssetData[];
  zazzanAdminFundAssets: IAssetData[];
}

const INITIAL_STATE: IAppState = {
  connector: null,
  fetching: false,
  connected: false,
  showModal: false,
  pendingRequest: false,
  requestArg: null,
  signedTxns: null,
  pendingSubmissions: [],
  uri: "",
  accounts: [],
  address: "",
  result: null,
  chain: ChainType.TestNet,
  assets: [],
  zanAsset: null,
  zazzanAppAssets: [],
  zazzanAdminFundAssets: [],
};

class App extends React.Component<unknown, IAppState> {
  public state: IAppState = {
    ...INITIAL_STATE,
  };

  public walletConnectInit = async () => {
    // bridge url
    const bridge = "https://bridge.walletconnect.org";

    // create new connector
    const connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });

    await this.setState({ connector });

    // check if already connected
    if (!connector.connected) {
      // create new session
      await connector.createSession();
    }

    // subscribe to events
    await this.subscribeToEvents();
  };
  public subscribeToEvents = () => {
    const { connector } = this.state;

    if (!connector) {
      return;
    }

    connector.on("session_update", async (error, payload) => {
      console.log(`connector.on("session_update")`);

      if (error) {
        throw error;
      }

      const { accounts } = payload.params[0];
      this.onSessionUpdate(accounts);
    });

    connector.on("connect", (error, payload) => {
      console.log(`connector.on("connect")`);

      if (error) {
        throw error;
      }

      this.onConnect(payload);
    });

    connector.on("disconnect", (error, payload) => {
      console.log(`connector.on("disconnect")`);

      if (error) {
        throw error;
      }

      this.onDisconnect();
    });

    if (connector.connected) {
      const { accounts } = connector;
      const address = accounts[0];
      this.setState({
        connected: true,
        accounts,
        address,
      });
      this.onSessionUpdate(accounts);
    }

    this.setState({ connector });
  };

  public killSession = async () => {
    const { connector } = this.state;
    if (connector) {
      connector.killSession();
    }
    this.resetApp();
  };

  public chainUpdate = (newChain: ChainType) => {
    this.setState({ chain: newChain }, this.getAccountAssets);
  };

  public resetApp = async () => {
    await this.setState({ ...INITIAL_STATE });
  };

  public onConnect = async (payload: IInternalEvent) => {
    const { accounts } = payload.params[0];
    const address = accounts[0];
    await this.setState({
      connected: true,
      accounts,
      address,
    });
    this.getAccountAssets();
  };

  public onDisconnect = async () => {
    this.resetApp();
  };

  public onSessionUpdate = async (accounts: string[]) => {
    const address = accounts[0];
    await this.setState({ accounts, address });
    await this.getAccountAssets();
  };

  public getAccountAssets = async () => {
    const { address, chain } = this.state;
    this.setState({ fetching: true });
    try {
      // get account balances
      const assets = await apiGetAccountAssets(chain, address);
      const zanAsset = await apiGetAssetByID(chain, getZANIndex(chain));
      const zazzanAppAssets = await apiGetAccountAssets(chain, getZazzanAppAddress(chain));
      const zazzanIndex = getZazzanAppIndex(chain);
      const app = await apiGetApplicationByID(chain, zazzanIndex);
      const zazzanAdminFundAssets = await apiGetAccountAssets(chain, getZazzanAdminFundAddress(app));
      await this.setState({ fetching: false, address, assets, zanAsset, zazzanAppAssets, zazzanAdminFundAssets });
    } catch (error) {
      console.error(error);
      await this.setState({ fetching: false });
    }
  };

  public toggleModal = () =>
    this.setState({
      showModal: !this.state.showModal,
      pendingSubmissions: [],
    });

  public signTxnScenario = async (scenario: Scenario) => {
    const { connector, address, chain } = this.state;

    if (!connector) {
      return;
    }

    try {
      let arg : number | null = null;
      const App_this = this;
      const argRequired = scenario.argRequired;
      if (argRequired != null) {
          arg = await new Promise((resolve : (value: number | PromiseLike<number | null> | null) => void,
                                   reject : (reason?: any) => void) => {
              // open modal
              this.toggleModal();
        
              // toggle pending request indicator
              App_this.setState({ requestArg: {
                  text : argRequired,
                  resolve
                }});
          });
          this.toggleModal();
          this.setState({ requestArg: null });
      }

      const txnsToSign = await scenario.action(chain, address, arg);

      // open modal
      this.toggleModal();

      // toggle pending request indicator
      this.setState({ pendingRequest: true });

      const flatTxns = txnsToSign.reduce((acc, val) => acc.concat(val), []);

      const walletTxns: IWalletTransaction[] = flatTxns.map(
        ({ txn, signers, authAddr, message }) => ({
          txn: Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString("base64"),
          signers, // TODO: put auth addr in signers array
          authAddr,
          message,
        }),
      );

      // sign transaction
      const requestParams: SignTxnParams = [walletTxns];
      const request = formatJsonRpcRequest("algo_signTxn", requestParams);
      const result: Array<string | null> = await connector.sendCustomRequest(request);

      console.log("Raw response:", result);

      const indexToGroup = (index: number) => {
        for (let group = 0; group < txnsToSign.length; group++) {
          const groupLength = txnsToSign[group].length;
          if (index < groupLength) {
            return [group, index];
          }

          index -= groupLength;
        }

        throw new Error(`Index too large for groups: ${index}`);
      };

      const signedPartialTxns: Array<Array<Uint8Array | null>> = txnsToSign.map(() => []);
      result.forEach((r, i) => {
        const [group, groupIndex] = indexToGroup(i);
        const toSign = txnsToSign[group][groupIndex];

        if (r == null) {
          if (toSign.signers !== undefined && toSign.signers?.length < 1) {
            signedPartialTxns[group].push(null);
            return;
          }
          throw new Error(`Transaction at index ${i}: was not signed when it should have been`);
        }

        if (toSign.signers !== undefined && toSign.signers?.length < 1) {
          throw new Error(`Transaction at index ${i} was signed when it should not have been`);
        }

        const rawSignedTxn = Buffer.from(r, "base64");
        signedPartialTxns[group].push(new Uint8Array(rawSignedTxn));
      });

      const signedTxns: Uint8Array[][] = signedPartialTxns.map(
        (signedPartialTxnsInternal, group) => {
          return signedPartialTxnsInternal.map((stxn, groupIndex) => {
            if (stxn) {
              return stxn;
            }

            return signTxnWithTestAccount(txnsToSign[group][groupIndex].txn);
          });
        },
      );

      const signedTxnInfo: Array<Array<{
        txID: string;
        signingAddress?: string;
        signature: string;
      } | null>> = signedPartialTxns.map((signedPartialTxnsInternal, group) => {
        return signedPartialTxnsInternal.map((rawSignedTxn, i) => {
          if (rawSignedTxn == null) {
            return null;
          }

          const signedTxn = algosdk.decodeSignedTransaction(rawSignedTxn);
          const txn = (signedTxn.txn as unknown) as algosdk.Transaction;
          const txID = txn.txID();
          const unsignedTxID = txnsToSign[group][i].txn.txID();

          if (txID !== unsignedTxID) {
            throw new Error(
              `Signed transaction at index ${i} differs from unsigned transaction. Got ${txID}, expected ${unsignedTxID}`,
            );
          }

          if (!signedTxn.sig) {
            throw new Error(`Signature not present on transaction at index ${i}`);
          }

          return {
            txID,
            signingAddress: signedTxn.sgnr ? algosdk.encodeAddress(signedTxn.sgnr) : undefined,
            signature: Buffer.from(signedTxn.sig).toString("base64"),
          };
        });
      });

      console.log("Signed txn info:", signedTxnInfo);

      // format displayed result
      const formattedResult: IResult = {
        method: "algo_signTxn",
        body: signedTxnInfo,
      };

      // display result
      this.setState({
        connector,
        pendingRequest: false,
        signedTxns,
        result: formattedResult,
      });
    } catch (error) {
      console.error(error);
      this.setState({ connector, pendingRequest: false, result: null });
    }
  };

  public async submitSignedTransaction() {
    const { signedTxns, chain } = this.state;
    if (signedTxns == null) {
      throw new Error("Transactions to submit are null");
    }

    this.setState({ pendingSubmissions: signedTxns.map(() => 0) });

    signedTxns.forEach(async (signedTxn, index) => {
      try {
        const confirmedRound = await apiSubmitTransactions(chain, signedTxn);

        this.setState(prevState => {
          return {
            pendingSubmissions: prevState.pendingSubmissions.map((v, i) => {
              if (index === i) {
                return confirmedRound;
              }
              return v;
            }),
          };
        });

        console.log(`Transaction confirmed at round ${confirmedRound}`);
      } catch (err) {
        this.setState(prevState => {
          return {
            pendingSubmissions: prevState.pendingSubmissions.map((v, i) => {
              if (index === i) {
                return err;
              }
              return v;
            }),
          };
        });

        console.error(`Error submitting transaction at index ${index}:`, err);
      }
    });
  }

  public render = () => {
    const {
      chain,
      assets,
      address,
      connected,
      fetching,
      showModal,
      pendingRequest,
      pendingSubmissions,
      result,
      zanAsset,
      zazzanAppAssets,
      requestArg,
      zazzanAdminFundAssets,
    } = this.state;
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header
            connected={connected}
            address={address}
            killSession={this.killSession}
            chain={chain}
            chainUpdate={this.chainUpdate}
          />
          <SContent>
            {!address && (!assets.length || zanAsset == null || !zazzanAppAssets.length) ? (
              <SLanding center>
                <h3>{`Zazzan Web App v${process.env.REACT_APP_VERSION}`}</h3>
                <SButtonContainer>
                  <SConnectButton left onClick={this.walletConnectInit} fetching={fetching}>
                    {"Connect to your Algorand wallet"}
                  </SConnectButton>
                </SButtonContainer>
              </SLanding>
            ) : (
              <SBalances>
                {
                    zanAsset != null ? (
                          <>
                            <ZANCirculatingSupply asset={zanAsset} appAssets={zazzanAppAssets} chain={chain}/>
                            <ZazzanAdminFund asset={zanAsset} adminFundAssets={zazzanAdminFundAssets} chain={chain}/>
                          </>
                        ) : (<></>)  // How to make this tidier?
                }
                <h3>Balances</h3>
                {!fetching ? (
                  <AccountAssets assets={assets} />
                ) : (
                  <Column center>
                    <SContainer>
                      <Loader />
                    </SContainer>
                  </Column>
                )}
                <h3>Actions</h3>
                <Column center>
                  <STestButtonContainer>
                    {scenarios.map(({ name, scenario }) => (
                      <STestButton left key={name} onClick={() => this.signTxnScenario(scenario)}>
                        {name}
                      </STestButton>
                    ))}
                  </STestButtonContainer>
                </Column>
              </SBalances>
            )}
          </SContent>
        </Column>
        <Modal show={showModal} toggleModal={this.toggleModal}>
          {pendingRequest ? (
            <SModalContainer>
              <SModalTitle>{"Pending Call Request"}</SModalTitle>
              <SContainer>
                <Loader />
                <SModalParagraph>{"Approve or reject request using your wallet"}</SModalParagraph>
              </SContainer>
            </SModalContainer>
          ) : requestArg != null ? (
            <SModalContainer>
              <SModalTitle>{"Please enter "+(requestArg != null ? requestArg.text : "")}</SModalTitle>
              <div><SModalInput id="myarg" type="text"/></div>
              <SModalButton
                onClick={() => {
                    const elt = document.getElementById("myarg") as HTMLInputElement;
                    const text = elt == null ? "" : elt.value;
                    requestArg.resolve(text == null ? 0 : parseFloat(text));
                }}
              >
                {"Continue"}
              </SModalButton>
            </SModalContainer>
          ) : result ? (
            <SModalContainer>
              <SModalTitle>{"Call Request Approved"}</SModalTitle>
              <STable>
                <SRow>
                  <SKey>Method</SKey>
                  <SValue>{result.method}</SValue>
                </SRow>
                {result.body.map((signedTxns, index) => (
                  <SRow key={index}>
                    <SKey>{`Atomic group ${index}`}</SKey>
                    <SValue>
                      {signedTxns.map((txn, txnIndex) => (
                        <div key={txnIndex}>
                          {!!txn?.txID && <p>TxID: {txn.txID}</p>}
                          {!!txn?.signature && <p>Sig: {txn.signature}</p>}
                          {!!txn?.signingAddress && <p>AuthAddr: {txn.signingAddress}</p>}
                        </div>
                      ))}
                    </SValue>
                  </SRow>
                ))}
              </STable>
              <SModalButton
                onClick={() => this.submitSignedTransaction()}
                disabled={pendingSubmissions.length !== 0}
              >
                {"Submit transaction to network."}
              </SModalButton>
              {pendingSubmissions.map((submissionInfo, index) => {
                const key = `${index}:${
                  typeof submissionInfo === "number" ? submissionInfo : "err"
                }`;
                const prefix = `Txn Group ${index}: `;
                let content: string;

                if (submissionInfo === 0) {
                  content = "Submitting...";
                } else if (typeof submissionInfo === "number") {
                  content = `Confirmed at round ${submissionInfo}`;
                } else {
                  content = "Rejected by network. See console for more information.";
                }

                return <SModalTitle key={key}>{prefix + content}</SModalTitle>;
              })}
            </SModalContainer>
          ) : (
            <SModalContainer>
              <SModalTitle>{"Call Request Rejected"}</SModalTitle>
            </SModalContainer>
          )}
        </Modal>
      </SLayout>
    );
  };
}

export default App;
