import { RequestHandler, Request, Response } from "express";
import { Transaction } from "../domain/Transaction";
import appDataSource from "../appDataSource";
import { ITransaction } from "../interfaces/ITransaction";
import { Status } from "../domain/Status";
import { Kafka } from "kafkajs";
import { AntifraudConsumer } from "../dto/AntifraudConsumer";

let clientId = process.env.CLIENT_ID;
let brokers = [process.env.BROKER as string];
let transactionsTopic = "transactions";
let antifraudTopic = "antifraud";
let groupId = "g1-2";
let kafka = new Kafka({ clientId, brokers });
let producer = kafka.producer();
let consumer = kafka.consumer({ groupId });

export const antifraudConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: antifraudTopic });
    await consumer.run({
      eachMessage: async ({ message, partition, topic }) => {
        console.log({
          value: message.value?.toString(),
          partition,
          topic
        });

        if(message.value){
          let antifraudConsumer:AntifraudConsumer = JSON.parse(message.value.toString());

          let status = await appDataSource.getRepository(Status).findOneBy({
            id: antifraudConsumer.statusId
          });
          
          if(status != null){
            let currentTransaction:Transaction = await appDataSource.getRepository(Transaction).findOneByOrFail({
              id: antifraudConsumer.id
            });
  
            if(currentTransaction != null){
              currentTransaction.status = status;
              await currentTransaction.save();

            }

          }

        }

      },
    });
  } catch (ex) {
    if (ex instanceof Error) {
      console.error(ex.message);
    }
  }
};

export const createTransaction: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      accountExternalIdDebit,
      accountExternalIdCredit,
      transferTypeId,
      value,
    }: Transaction = req.body;

    const pendingStatus = await appDataSource.getRepository(Status).findOneBy({
      id: 1,
    });

    if (pendingStatus != null) {
      const transaction = new Transaction();
      transaction.accountExternalIdDebit = accountExternalIdDebit;
      transaction.accountExternalIdCredit = accountExternalIdCredit;
      transaction.transferTypeId = transferTypeId;
      transaction.value = value;
      transaction.status = pendingStatus;

      console.log(transaction);

      const transactionSaved = await appDataSource
          .getRepository(Transaction)
          .save(transaction);

      await producer.connect();
      await producer.send({
        topic: transactionsTopic,
        messages: [
          {
            value: JSON.stringify({
              id: transactionSaved.id,
              value: value,
              statusId: 1
            }),
          },
        ],
      });

      await producer.disconnect();

      res.json({
        accountExternalIdDebit,
        accountExternalIdCredit,
        transferTypeId,
        value,
      });

    } else {
      res
        .status(501)
        .send("No se encontró el estado inicial para la transacción");
    }
  } catch (ex) {
    if (ex instanceof Error) {
      res.status(501).send(ex.message);
    }
  }
};

export const getTransactionById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {

    let transactionId = req.params["id"];

    let transaction:Transaction = await appDataSource.getRepository(Transaction).findOneOrFail({
      where: {
        id: Number.parseInt(transactionId)
      },
      relations: {
        status: true
      }
    })

    res.json({
      transactionExternalId: "Guid",
      transactionType: {
        name: ""
      },
      transactionStatus: {
        name: transaction.status.name
      },
      value: transaction.value,
      createdAt: transaction.createdAt
    });

   } catch (ex) {
    if (ex instanceof Error) {
      console.log(ex.message);
      res.status(501).send(ex.message);
    }
  }
};