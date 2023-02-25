import { RequestHandler, Request, Response } from "express";
import { Kafka, PartitionAssigners } from "kafkajs";
import { Consumer } from "../domain/Consumer";
import { Transaction } from "../domain/Transaction";

export const verifyTransaction = async () => {
  try {
    
    let clientId = process.env.CLIENT_ID;
let brokers = [process.env.BROKER as string];
    let transactionsTopic = "transactions";
    let antifraudTopic = "antifraud";
    let groupId = "g1";

    let kafka = new Kafka({ clientId, brokers });

    let producer = kafka.producer();
    let consumer = kafka.consumer({ groupId });

    await consumer.connect();
    await consumer.subscribe({ topic: transactionsTopic });
    await consumer.run({
      eachMessage: async ({ message, partition, topic }) => {
        if (message.value) {

          let transaction: Transaction = JSON.parse(message.value?.toString());

          transaction.statusId = 2;

          if (transaction.value > 1000) {
            transaction.statusId = 3;
          }

          await producer.connect();
          await producer.send({
            topic: antifraudTopic,
            messages: [
              {
                value: JSON.stringify({
                  id: transaction.id,
                  statusId: transaction.statusId,
                }),
              },
            ],
          });

          await producer.disconnect();
        }
      },
    });
  } catch (ex) {
    if (ex instanceof Error) {
      console.log(ex.message);
    }
  }
};
