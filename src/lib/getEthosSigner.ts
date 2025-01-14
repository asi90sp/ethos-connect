import store from 'store2'
import { HostedSigner, SignerType } from '../types/Signer'
import activeUser from './activeUser'
import hostedInteraction, { HostedInteractionResponse } from './hostedInteraction'

import type { JsonRpcProvider, SignedTransaction, SuiTransactionBlockResponse } from '@mysten/sui.js'
import type { 
    SuiSignMessageOutput, 
    WalletAccount, 
    WalletIcon 
} from '@mysten/wallet-standard';
import { EthosSignMessageInput } from '../types/EthosSignMessageInput'
import { EthosSignAndExecuteTransactionBlockInput } from '../types/EthosSignAndExecuteTransactionBlockInput'
import { EthosSignTransactionBlockInput } from '../types/EthosSignTransactionBlockInput'
import { DEFAULT_CHAIN } from '../lib/constants';
import { Chain } from 'enums/Chain'
import { EthosExecuteTransactionBlockInput } from 'types/EthosExecuteTransactionBlockInput'

const getEthosSigner = async ({ provider, defaultChain }: { provider: JsonRpcProvider, defaultChain: Chain }): Promise<HostedSigner | null> => {

    const user: any = await activeUser()
    
    const accounts: WalletAccount[] = (user?.accounts || []).filter((account: any) => account.chain === 'sui')

    const currentAccount = accounts[0]

    const signAndExecuteTransactionBlock = (input: EthosSignAndExecuteTransactionBlockInput): Promise<SuiTransactionBlockResponse> => {
        return new Promise((resolve, reject) => {
            const transactionEventListener = ({ approved, data }: HostedInteractionResponse) => {
                if (approved) {
                    resolve(data.response);
                } else {
                    reject({ error: data?.response?.error || "User rejected transaction."})
                }
            }

            const serializedTransaction = input.transactionBlock.serialize();
            const account = input.account ?? currentAccount.address
            const chain  = input.chain ?? defaultChain ?? DEFAULT_CHAIN
            
            hostedInteraction({
                action: 'transaction',
                data: { 
                    input,
                    serializedTransaction,
                    account,
                    chain
                 },
                onResponse: transactionEventListener,
                showWallet: true
            })
        });
    }

    const executeTransactionBlock = (input: EthosExecuteTransactionBlockInput): Promise<SuiTransactionBlockResponse> => {
        return provider.executeTransactionBlock(input);
    }

    const signTransactionBlock = (input: EthosSignTransactionBlockInput): Promise<SignedTransaction> => {
        return new Promise((resolve, reject) => {
            const transactionEventListener = ({ approved, data }: HostedInteractionResponse) => {
                if (approved) {
                    resolve(data.response);
                } else {
                    reject({ error: data?.response?.error || "User rejected transaction."})
                }
            }

            const serializedTransaction = input.transactionBlock.serialize();
            const account = input.account ?? currentAccount.address
            const chain  = input.chain ?? defaultChain ?? DEFAULT_CHAIN
            
            hostedInteraction({
                action: 'transaction',
                data: { 
                    input,
                    serializedTransaction,
                    account,
                    chain
                 },
                onResponse: transactionEventListener,
                showWallet: true
            })
        });
    }

    const requestPreapproval = () => {
        return Promise.resolve(true);
    }

    const signMessage = (input: EthosSignMessageInput): Promise<SuiSignMessageOutput> => {
        return new Promise((resolve, reject) => {
            const transactionEventListener = ({ approved, data }: HostedInteractionResponse) => {
                if (approved) {
                    resolve(data.response);
                } else {
                    reject({ error: data?.response?.error || "User rejected signing."})
                }
            }
            
            hostedInteraction({
                action: 'sign',
                data: { ...input, signData: input.message },
                onResponse: transactionEventListener,
                showWallet: true
            })
        });
    }

    const disconnect = (fromWallet = false) => {
        return new Promise((resolve) => {
            const transactionEventListener = () => {
                resolve(true);
            }
            
            hostedInteraction({
                action: 'logout',
                data: { 
                    fromWallet: typeof fromWallet === 'boolean' ? fromWallet : false  
                },
                onResponse: transactionEventListener
            })

            store.namespace('auth')('access_token', null)
        });
    }

    const logout = () => {
        return disconnect(true);
    }

    return user ? {
        type: SignerType.Hosted,
        name: "Ethos",
        icon: dataIcon,
        email: user.email,
        getAddress: async () => currentAccount?.address,
        accounts,
        currentAccount,
        signAndExecuteTransactionBlock,
        executeTransactionBlock,
        signTransactionBlock,
        requestPreapproval,
        signMessage,
        disconnect,
        logout,
        provider
    } : null
   
}

export default getEthosSigner;

const dataIcon: WalletIcon = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzZEMjhEOSIvPgo8cGF0aCBvcGFjaXR5PSIwLjgiIGQ9Ik05LjEyMTg3IDYuODU3MDZIMTkuOTU4M0MyMC40NTcxIDYuODU3MDYgMjAuODYxNCA3LjI2MTQxIDIwLjg2MTQgNy43NjAyVjE5Ljk4ODZDMjAuODYxNCAyMC40ODc0IDIwLjQ1NzEgMjAuODkxOCAxOS45NTgzIDIwLjg5MThIOS4xMjE4N0M4LjYyMzA4IDIwLjg5MTggOC4yMTg3MiAyMC40ODc0IDguMjE4NzIgMTkuOTg4NlY3Ljc2MDJDOC4yMTg3MiA3LjI2MTQxIDguNjIzMDggNi44NTcwNiA5LjEyMTg3IDYuODU3MDZaIiBzdHJva2U9InVybCgjcGFpbnQwX2xpbmVhcl82OTlfMjY5OCkiIHN0cm9rZS13aWR0aD0iMC40NTE1NzIiLz4KPHBhdGggZD0iTTguNzEyNzQgNy40NTQ1OUwxNi4wOTQ1IDEwLjg4OTRDMTYuNDEyOSAxMS4wMzc2IDE2LjYxNjYgMTEuMzU3IDE2LjYxNjYgMTEuNzA4M1YyMy44MUMxNi42MTY2IDI0LjQ2MzUgMTUuOTQ0IDI0LjkwMDcgMTUuMzQ2OCAyNC42MzUzTDcuOTY1MDIgMjEuMzU1NkM3LjYzODgyIDIxLjIxMDcgNy40Mjg1OCAyMC44ODcyIDcuNDI4NTggMjAuNTMwM1Y4LjI3MzQzQzcuNDI4NTggNy42MTMxMSA4LjExNDA2IDcuMTc2MDIgOC43MTI3NCA3LjQ1NDU5WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIzLjM3ODIgMTUuMzc2N0MyMy40MzAzIDE1LjEzMjEgMjMuNTUzOCAxNC45MDg2IDIzLjczMzIgMTQuNzM0M0MyMy45MTI1IDE0LjU2IDI0LjEzOTYgMTQuNDQzIDI0LjM4NTYgMTQuMzk3OUwyNS4wNDA0IDE0LjI3ODRMMjQuMzg1NSAxNC4xNTg4SDI0LjM4NTZDMjQuMTM5NiAxNC4xMTM3IDIzLjkxMjUgMTMuOTk2NyAyMy43MzMyIDEzLjgyMjRDMjMuNTUzOCAxMy42NDgxIDIzLjQzMDMgMTMuNDI0NiAyMy4zNzgyIDEzLjE4TDIzLjIzNDEgMTIuNTAxM0wyMy4wOSAxMy4xOEMyMy4wMzc5IDEzLjQyNDYgMjIuOTE0NCAxMy42NDgxIDIyLjczNTEgMTMuODIyNEMyMi41NTU4IDEzLjk5NjcgMjIuMzI4NyAxNC4xMTM4IDIyLjA4MjcgMTQuMTU4OEwyMS40Mjc4IDE0LjI3ODRMMjIuMDgyNyAxNC4zOTc5SDIyLjA4MjdDMjIuMzI4NyAxNC40NDMgMjIuNTU1NyAxNC41NiAyMi43MzUgMTQuNzM0M0MyMi45MTQ0IDE0LjkwODYgMjMuMDM3OSAxNS4xMzIxIDIzLjA5IDE1LjM3NjdMMjMuMjM0MSAxNi4wNTU0TDIzLjM3ODIgMTUuMzc2N1oiIGZpbGw9IndoaXRlIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfNjk5XzI2OTgiIHgxPSIyMC44NjE0IiB5MT0iMTAuNTkyNiIgeDI9IjE0LjUzOTgiIHkyPSIxMy43NTM0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IndoaXRlIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0id2hpdGUiIHN0b3Atb3BhY2l0eT0iMCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=`;
