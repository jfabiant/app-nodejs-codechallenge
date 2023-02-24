import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm";
import {Transaction} from "./Transaction"

@Entity()
export class Status extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number
    
    @Column()
    name: string

    @OneToMany(() => Transaction, (transaction) => transaction.status)
    transactions: Transaction[]

}