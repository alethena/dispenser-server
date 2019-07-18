export interface MailParams {
    to: string[],
    subject: string,
    html: string,
    attachments?: object[]
}

export interface PaymentData {
    numberOfShares: number,
    buy: boolean,
    sell: boolean,
    insider: boolean,
    emailAddress: string,
    crypto: boolean,
    price: number,
    walletAddress: string
}

export interface XCHFBuyData {
    txhash: string,
    numberofshares: number,
    emailAddress: string,
    sessionid?: string
}

export interface XCHFSellData {
    txhash: string,
    numberofshares: number,
    pricelimit: number,
    emailAddress: string,
    sessionid?: string
}

export interface InsiderRequest {
    emailAddress: string,
    insiderInformation: string,
    sessionID: string
}

export interface SignupRequest {
    emailAddress: string,
    contractAddress: string
}

export interface XCHFPDFData {
    now: string,
    type: string,
    etherscanLink: string,
    price: string,
    numberOfShares: number,
    walletAddress: string,
    emailAddress: string
}

export interface Company {
    tokenSymbol: string,
    companyName: string,
    equityAddress: string,
    equityActive: boolean,
    SDAddress: string,
    SDActive: boolean,
    equityLastBlock: number,
    SDLastBlock: number,
    lastBlockReported: number
}

export interface InsiderTrade {
    sessionID: string,
    emailAddress: string,
    insiderInformation: string,
    txHash: string
}

export interface Notificatiion {
    contractAddress: string,
    emailAddress: string
}

export interface SDTransaction {
    txhash: string,
    contractAddress: string,
    buy: boolean,
    sell: boolean,
    price: number,
    fee: number,
    lastPrice: number,
    user: string,
    amount: number,
    blockNumber: number,
    timestamp: Date
}

export interface equityTransaction {
    txHash: string,
    event: string,
    contractAddress: string,
    timestamp: Date
    blockNumber: number,
    transactionIndex: number,
    logIndex: number,
    sender: string,
    receiver: string,
    value: number
    shareholder: string,
    amount: number,
    message: string

}
