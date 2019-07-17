export interface mailParams {
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
    sessionid?: string
}

export interface XCHFSellData {
    txhash: string,
    numberofshares: number,
    pricelimit: number,
    sessionid?: string
}
