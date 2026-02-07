/**
 * Pharos Testnet (AtlanticOcean) chain params for MetaMask / wallet connection.
 * Use with wallet_addEthereumChain. Chain ID should match Pharos docs.
 */
const PHAROS_RPC = process.env.NEXT_PUBLIC_PHAROS_RPC || "https://atlantic.ocean.pharos.network";
const PHAROS_CHAIN_ID = process.env.NEXT_PUBLIC_PHAROS_CHAIN_ID || "0x1f95"; // 8085 in hex, adjust per Pharos docs

export const pharosChain = {
  chainId: PHAROS_CHAIN_ID,
  chainName: "Pharos Testnet (AtlanticOcean)",
  nativeCurrency: { name: "Pharos", symbol: "PHAROS", decimals: 18 },
  rpcUrls: [PHAROS_RPC],
  blockExplorerUrls: ["https://explorer.pharos.network"].filter(Boolean),
};

export async function addPharosToWallet(): Promise<void> {
  if (typeof window === "undefined" || !(window as unknown as { ethereum?: { request: (p: unknown) => Promise<unknown> } }).ethereum) {
    throw new Error("No wallet found. Install MetaMask or another Web3 wallet.");
  }
  const eth = (window as unknown as { ethereum: { request: (p: unknown) => Promise<unknown> } }).ethereum;
  await eth.request({
    method: "wallet_addEthereumChain",
    params: [{ ...pharosChain }],
  });
}
