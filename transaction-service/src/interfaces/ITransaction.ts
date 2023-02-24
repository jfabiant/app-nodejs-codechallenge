export interface ITransaction {
    id?: number;
    accountExternalIdDebit?:string;
    accountExternalIdCredit?:string;
    transferTypeId?:number;
    value?:number;
}