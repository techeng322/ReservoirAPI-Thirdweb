import { useAppDispatch } from "@/common/redux/store"
import { mintToken } from "../Collection/Token/token.slice"
import { useWallet } from "@/common/useWallet"
import { Network } from '../../common/types'
import { FREE_MINT_TOKEN_ID } from "@/common/config"

const FreeMintButton = ({disabled, contractAddress, className = "", onError, onSuccess, amountToMint, children}) => {
    const dispatch = useAppDispatch()
    const { address } = useWallet()

    const freeMint = async () => {  
        try {
            console.log("ZIAD")
            return dispatch(
                mintToken({
                    contract: contractAddress,
                    tokenId: `${FREE_MINT_TOKEN_ID}`,
                    address,
                    network: Network.SEPOLIA,
                    amount: `${amountToMint}`
                }),
            )
        } catch(error) {
            console.log("ZIAD", error)
            onError()
        }
    }

    return (
        <button
            type="button"
            onClick={freeMint}
            className={`${className}`}
            disabled={disabled}
        >        
            {children}
        </button>
    )
}

export default FreeMintButton