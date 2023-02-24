import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, CreateDateColumn } from "typeorm";
import { Status } from "./Status";

@Entity()
export class Transaction extends BaseEntity{

    @PrimaryGeneratedColumn()
    id?: number

    @Column()
    accountExternalIdDebit:string

    @Column()
    accountExternalIdCredit:string

    @Column()
    transferTypeId:number

    @Column()
    value: number

    @ManyToOne(() => Status, (status) => status.transactions)
    status: Status

    @Column()
    @CreateDateColumn()
    createdAt: Date

}