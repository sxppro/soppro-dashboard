import { CustomTransactionResource } from '@/types/custom';
import { components } from '@/types/up-api';
import { UUID } from 'bson';
import { MongoBulkWriteError, MongoClient } from 'mongodb';

const DB_URI = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(
  process.env.DB_PASS || ''
)}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority`;
const client = new MongoClient(DB_URI);

/**
 * Converts BSON UUID to string
 * @param uuid to be converted
 * @returns uuid as string
 */
const uuidToString = (uuid: UUID) =>
  uuid
    .toString('hex')
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

/**
 * Inserts transactions to db
 * @param data list of transactions
 */
const insertTransactions = async (
  data: components['schemas']['TransactionResource'][]
) => {
  if (data.length < 1) {
    return;
  }
  try {
    const db = client.db('up');
    const transactions =
      db.collection<CustomTransactionResource>('transactions');
    /**
     * Remaps id to _id as BSON UUID
     * for better query performance
     * @see https://mongodb.github.io/node-mongodb-native/5.1/classes/BSON.UUID.html
     */
    const parsedData: CustomTransactionResource[] = data.map(
      ({ id, ...rest }) => ({
        ...rest,
        _id: new UUID(id).toBinary(),
      })
    );
    const insert = await transactions.insertMany(parsedData);
    return insert;
  } catch (err) {
    // Catch duplicate key errors
    if (err instanceof MongoBulkWriteError && err.code === 11000) {
      const { insertedCount, insertedIds } = err;
      // console.log(
      //   Object.keys(insertedIds).map((id) =>
      //     uuidToString(insertedIds[parseInt(id)])
      //   )
      // );
      return {
        acknowledged: true,
        insertedCount,
        insertedIds,
      };
    } else {
      console.error(err);
    }
  }
};

export { insertTransactions };
