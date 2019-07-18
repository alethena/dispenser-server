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