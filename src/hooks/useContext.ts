import { 
    useEffect, 
    useMemo,
    useState,
} from 'react'
import lib from '../lib/lib'
import log from '../lib/log'
import { Chain } from '../enums/Chain'
import { WalletContextContents } from '../types/WalletContextContents'
import useAccount from './useAccount'
import useConnect from './useConnect'
import { EthosConnectStatus } from '../enums/EthosConnectStatus'

const useContext = (ethosConfiguration: any, onWalletConnected: any) => {
    if (!ethosConfiguration) ethosConfiguration = {};
    if (!ethosConfiguration?.chain) ethosConfiguration.chain = Chain.Sui;
    if (!ethosConfiguration?.network) ethosConfiguration.network = 'sui';
    if (!ethosConfiguration?.walletAppUrl) ethosConfiguration.walletAppUrl = 'https://ethoswallet.xyz';

    log('EthosConnectProvider', 'EthosConnectProvider Configuration:', ethosConfiguration)
  
    useEffect(() => {
        lib.initializeEthos(ethosConfiguration || {})
    }, [])
  
    const { wallets, selectWallet, providerAndSigner, logout } = useConnect()
    const { address, contents } = useAccount(providerAndSigner.signer)
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const modal = useMemo(() => {
        const openModal = () => {
            setIsModalOpen(true)
        }

        const closeModal = () => {
            setIsModalOpen(false)
        }

        return {
            isModalOpen,
            openModal,
            closeModal
        }
    }, [isModalOpen, setIsModalOpen])

    const wallet = useMemo(() => {
        const { provider, signer } = providerAndSigner;
        let status;
        if (provider) {
            if (signer) {
                status = EthosConnectStatus.Connected
            } else {
                status = EthosConnectStatus.NoConnection
            }
        } else {
            status = EthosConnectStatus.Loading
        }

        const context: WalletContextContents = {
            status,
            wallets: wallets.map(w => ({
                ...w,
                name: w.name,
                icon: w.icon,
            })),
            selectWallet,
            provider
        }
        
        if (signer) {
            context.wallet = {
                ...signer,
                address,
                contents
            }
        }
        
        return context;
    }, [
        wallets, 
        selectWallet, 
        address,
        providerAndSigner,
        contents,
        logout
    ])

    useEffect(() => {
        if (!providerAndSigner?.provider) return;
        log('EthosConnectProvider', 'calling onWalletConnected', providerAndSigner)

        if (providerAndSigner.signer) {
            setIsModalOpen(false);
            const rawDisconnect = providerAndSigner.signer.disconnect;
            providerAndSigner.signer.disconnect = async () => {
                await rawDisconnect();
                logout();
            }
        }

        onWalletConnected && onWalletConnected(providerAndSigner)
    }, [providerAndSigner])

    useEffect(() => {
        if (isModalOpen) {
            document.getElementsByTagName('html').item(0)?.setAttribute('style', 'overflow: hidden;')
        } else {
            document.getElementsByTagName('html').item(0)?.setAttribute('style', '')
        }
    }, [isModalOpen])

    const value = useMemo(() => ({
        wallet,
        modal,
        providerAndSigner
    }), [wallet, modal, providerAndSigner]);
    
    return { ...value, ethosConfiguration }
}

export default useContext;