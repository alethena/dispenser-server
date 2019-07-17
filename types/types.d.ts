export interface mailParams {
    to: string[],
    subject: string,
    html: string,
    attachments?: object[]
}