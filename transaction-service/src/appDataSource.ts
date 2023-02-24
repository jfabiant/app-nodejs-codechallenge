import {DataSource} from "typeorm";
import {Transaction} from "./domain/Transaction";
import {Status} from "./domain/Status";

const AppDataSource = new DataSource({
    type: process.env.DB_TYPE as any,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT as unknown as number,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Transaction, Status],
    logging: process.env.DB_LOGGING as unknown as boolean,
    synchronize: process.env.DB_SYNC as unknown as boolean
});

export default AppDataSource;