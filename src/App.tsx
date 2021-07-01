import * as React from "react";
import styled from "styled-components";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
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
import { apiGetAccountAssets, apiSubmitTransactions } from "./helpers/api";
import { IAssetData, IWalletTransaction, SignTxnParams } from "./helpers/types";
import Banner from "./components/Banner";
import AccountAssets from "./components/AccountAssets";
import { Scenario, scenarios, signTxnWithTestAccount } from "./scenarios";

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
  height: 44px;
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

interface IAppState {
  connector: WalletConnect | null;
  fetching: boolean;
  connected: boolean;
  showModal: boolean;
  pendingRequest: boolean;
  signedTxns: Uint8Array[] | null;
  pendingSubmission: boolean | number;
  pendingSubmissionError: Error | null;
  uri: string;
  accounts: string[];
  address: string;
  result: any | null;
  assets: IAssetData[];
}

const INITIAL_STATE: IAppState = {
  connector: null,
  fetching: false,
  connected: false,
  showModal: false,
  pendingRequest: false,
  signedTxns: null,
  pendingSubmission: false,
  pendingSubmissionError: null,
  uri: "",
  accounts: [],
  address: "",
  result: null,
  assets: [],
};

class App extends React.Component<any, any> {
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
    const { address } = this.state;
    this.setState({ fetching: true });
    try {
      // get account balances
      const assets = await apiGetAccountAssets(address);

      await this.setState({ fetching: false, address, assets });
    } catch (error) {
      console.error(error);
      await this.setState({ fetching: false });
    }
  };

  public toggleModal = () =>
    this.setState({
      showModal: !this.state.showModal,
      pendingSubmission: false,
      pendingSubmissionError: null,
    });

  public signTxnScenario = async (scenario: Scenario) => {
    const { connector, address } = this.state;

    if (!connector) {
      return;
    }

    try {
      const txnsToSign = await scenario(address);

      // open modal
      this.toggleModal();

      // toggle pending request indicator
      this.setState({ pendingRequest: true });

      const walletTxns: IWalletTransaction[] = txnsToSign.map(({ txn, shouldSign, authAddr }) => ({
        txn: Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString("base64"),
        signers: shouldSign ? undefined : [], // TODO: put auth addr in signers array
        authAddr,
      }));

      // sign transaction
      const requestParams: SignTxnParams = [walletTxns];
      const request = formatJsonRpcRequest("algo_signTxn", requestParams);
      const result: Array<string | null> = await connector.sendCustomRequest(request);

      const signedPartialTxns: Array<Uint8Array | null> = result.map((r, i) => {
        if (r == null) {
          if (!txnsToSign[i].shouldSign) {
            return null;
          }
          throw new Error(`Transaction at index ${i}: was not signed when it should have been`);
        }

        if (!txnsToSign[i].shouldSign) {
          throw new Error(`Transaction at index ${i} was signed when it should not have been`);
        }

        const rawSignedTxn = Buffer.from(r, "base64");
        return new Uint8Array(rawSignedTxn);
      });

      const signedTxns: Uint8Array[] = signedPartialTxns.map((stxn, i) => {
        if (stxn) {
          return stxn;
        }

        return signTxnWithTestAccount(txnsToSign[i].txn);
      });

      const signedTxnInfo: Array<{
        txID: string;
        signingAddress?: string;
        signature: string;
      } | null> = signedPartialTxns.map((rawSignedTxn, i) => {
        if (rawSignedTxn == null) {
          return null;
        }

        const signedTxn = algosdk.decodeSignedTransaction(rawSignedTxn);
        const txn = (signedTxn.txn as unknown) as algosdk.Transaction;
        const txID = txn.txID();
        const unsignedTxID = txnsToSign[i].txn.txID();

        if (txID !== unsignedTxID) {
          throw new Error(
            `Signed transaction at index ${i} differs from unsigned transaction. Got ${txID}, expected ${unsignedTxID}`,
          );
        }

        return {
          txID,
          signingAddress: signedTxn.sgnr ? algosdk.encodeAddress(signedTxn.sgnr) : undefined,
          signature: Buffer.from(signedTxn.sig).toString("base64"),
        };
      });

      console.log("Signed txn info:", signedTxnInfo);

      // format displayed result
      const formattedResult = {
        method: "algo_signTxn",
        result: signedTxnInfo,
      };

      // display result
      this.setState({
        connector,
        pendingRequest: false,
        signedTxns,
        result: formattedResult || null,
      });
    } catch (error) {
      console.error(error);
      this.setState({ connector, pendingRequest: false, result: null });
    }
  };

  public async submitSignedTransaction() {
    const { signedTxns } = this.state;
    if (signedTxns == null) {
      throw new Error("Transactions to submit are null");
    }

    this.setState({ pendingSubmission: true });

    try {
      const confirmedRound = await apiSubmitTransactions(signedTxns);
      if (this.state.pendingSubmission === true) {
        this.setState({ pendingSubmission: confirmedRound, pendingSubmissionError: null });
      }
      console.log(`Transaction confirmed at round ${confirmedRound}`);
    } catch (err) {
      if (this.state.pendingSubmission === true) {
        this.setState({ pendingSubmissionError: err });
      }
      console.error("Error submitting transaction:", err);
    }
  }

  public render = () => {
    const {
      assets,
      address,
      connected,
      fetching,
      showModal,
      pendingRequest,
      pendingSubmission,
      pendingSubmissionError,
      result,
    } = this.state;
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header connected={connected} address={address} killSession={this.killSession} />
          <SContent>
            {!address && !assets.length ? (
              <SLanding center>
                <h3>
                  {`Try out WalletConnect`}
                  <br />
                  <span>{`v${process.env.REACT_APP_VERSION}`}</span>
                </h3>
                <SButtonContainer>
                  <SConnectButton left onClick={this.walletConnectInit} fetching={fetching}>
                    {"Connect to WalletConnect"}
                  </SConnectButton>
                </SButtonContainer>
              </SLanding>
            ) : (
              <SBalances>
                <Banner />
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
          ) : result ? (
            <SModalContainer>
              <SModalTitle>{"Call Request Approved"}</SModalTitle>
              <STable>
                {Object.keys(result).map(key => (
                  <SRow key={key}>
                    <SKey>{key}</SKey>
                    <SValue>{JSON.stringify(result[key])}</SValue>
                  </SRow>
                ))}
              </STable>
              <SModalButton
                onClick={() => this.submitSignedTransaction()}
                disabled={pendingSubmission !== false}
              >
                {"Submit transaction to network."}
              </SModalButton>
              {pendingSubmission === true && !pendingSubmissionError && (
                <SModalTitle>{"Submitting..."}</SModalTitle>
              )}
              {typeof pendingSubmission === "number" && (
                <SModalTitle>{`Transaction confirmed at round ${pendingSubmission}`}</SModalTitle>
              )}
              {!!pendingSubmissionError && (
                <SModalTitle>
                  {"Transaction rejected by network. See console for more information."}
                </SModalTitle>
              )}
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
