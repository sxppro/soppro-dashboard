import {
  TagInfo,
  type AccountBalanceHistory,
  type AccountMonthlyInfo,
  type DateRange,
  type TransactionAccountType,
  type TransactionCategoryInfo,
  type TransactionCategoryOption,
  type TransactionCategoryType,
} from '@/server/schemas';
import {
  DbTransactionResource,
  TransactionRetrievalOptions,
} from '@/types/custom';
import { components } from '@/types/up-api';
import { outputTransactionFields } from '@/utils/helpers';
import { getTransactionById as getUpTransactionById } from '@/utils/up';
import { UUID } from 'bson';
import { MongoBulkWriteError } from 'mongodb';
import { connectToDatabase } from './connect';
import {
  accountBalancePipeline,
  categoriesPipeline,
  monthlyStatsPipeline,
  searchTransactionsPipeline,
  tagInfoPipeline,
  transactionsByDatePipeline,
  transactionsByTagsPipeline,
  uniqueTagsPipeline,
} from './pipelines';

/**
 * Remaps transaction attributes from Up to be inserted to db
 * @param param0
 * @returns
 */
export const convertUpToDbTransaction = (
  transaction: components['schemas']['TransactionResource']
): DbTransactionResource => {
  const { id, attributes, ...rest } = transaction;
  const { createdAt, settledAt } = attributes;
  const newAttributes = {
    ...attributes,
    createdAt: new Date(createdAt),
    settledAt: settledAt ? new Date(settledAt) : null,
  };
  return {
    _id: new UUID(id).toBinary(),
    attributes: newAttributes,
    ...rest,
  };
};

/**
 * Inserts transactions to db
 * @param data list of transactions
 */
export const insertTransactions = async (
  data: components['schemas']['TransactionResource'][]
) => {
  if (data.length < 1) {
    return;
  }
  try {
    const { db } = await connectToDatabase('up');
    const transactions = db.collection<DbTransactionResource>('transactions');
    /**
     * Remaps id to _id as BSON UUID & ISO date strings
     * to BSON dates for better query performance
     * @see https://mongodb.github.io/node-mongodb-native/5.1/classes/BSON.UUID.html
     */
    const parsedData: DbTransactionResource[] = data.map(
      ({ id, attributes, ...rest }) => {
        const { createdAt, settledAt } = attributes;
        const newAttributes = {
          ...attributes,
          createdAt: new Date(createdAt),
          settledAt: settledAt ? new Date(settledAt) : null,
        };
        return {
          _id: new UUID(id).toBinary(),
          attributes: newAttributes,
          ...rest,
        };
      }
    );
    const insert = await transactions.insertMany(parsedData, {
      ordered: false,
    });
    return insert;
  } catch (err) {
    // Catch duplicate key errors
    if (err instanceof MongoBulkWriteError && err.code === 11000) {
      const { insertedCount, insertedIds } = err;
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

/**
 * Replaces transactions in db by their ids
 * with data from Up
 * @param transactionIds array of transaction IDs
 * @returns number of transactions replaced
 */
export const replaceTransactions = async (transactionIds: string[]) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection('transactions');
  let replacedTransactions = 0;
  await Promise.all(
    transactionIds.map(async (id) => {
      const data = await getUpTransactionById(id);
      const replace = await transactions.replaceOne(
        {
          _id: new UUID(id).toBinary(),
        },
        convertUpToDbTransaction(data.data)
      );
      if (replace.acknowledged) {
        replacedTransactions += replace.modifiedCount;
      }
    })
  );
  return replacedTransactions;
};

/**
 * Search transactions
 * @param search
 * @returns
 */
export const searchTransactions = async (search: string) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.aggregate<DbTransactionResource>(
    searchTransactionsPipeline(search)
  );
  const results = (await cursor.toArray()).map((transaction) =>
    outputTransactionFields(transaction)
  );
  await cursor.close();
  return results;
};

/**
 * Monthly transaction statistics between 2 dates
 * @param dateRange
 * @returns list of stats for each month
 */
export const getMonthlyInfo = async (dateRange: DateRange) => {
  if (!process.env.UP_TRANS_ACC) {
    throw new Error('Up transaction account not defined');
  }

  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.aggregate<AccountMonthlyInfo>(
    monthlyStatsPipeline(dateRange.from, dateRange.to, process.env.UP_TRANS_ACC)
  );
  const results = await cursor.toArray();
  await cursor.close();
  return results;
};

/**
 * Generates category stats for transactions
 * between 2 dates
 * @param start
 * @param end
 * @returns list of stats for each category
 */
export const getCategoryInfo = async (
  dateRange: DateRange,
  type: TransactionCategoryType
) => {
  if (!process.env.UP_TRANS_ACC) {
    throw new Error('Up transaction account not defined');
  }

  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.aggregate<TransactionCategoryInfo>(
    categoriesPipeline(
      dateRange.from,
      dateRange.to,
      process.env.UP_TRANS_ACC,
      type
    )
  );
  const results = await cursor.toArray();
  await cursor.close();
  return results;
};

/**
 * Retrieves income and expense stats for a tag
 * @param tag
 * @returns
 */
export const getTagInfo = async (tag: string) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.aggregate<TagInfo>(tagInfoPipeline(tag));
  const results = await cursor.toArray();
  await cursor.close();
  return results[0];
};

/**
 * Retrieves transactions between 2 dates
 * @param dateRange
 * @param options
 * @returns
 */
const getTransactionsByDate = async (
  account: string,
  dateRange: DateRange,
  options: TransactionRetrievalOptions
) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.aggregate<DbTransactionResource>(
    transactionsByDatePipeline(account, dateRange, options)
  );
  const results = (await cursor.toArray()).map((transaction) =>
    outputTransactionFields(transaction)
  );
  await cursor.close();
  return results;
};

/**
 * Retrieves transactions by category
 * @param category category id
 * @returns list of transactions
 */
const getTransactionsByCategory = async (category: string) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.find({ $text: { $search: category } });
  const results = (await cursor.toArray()).map((transaction) =>
    outputTransactionFields(transaction)
  );
  await cursor.close();
  return results;
};

/**
 * Retrieves transaction data by id
 * @param id transaction id
 * @returns transaction document
 */
const getTransactionById = async (id: string) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const result = await transactions.findOne({ _id: new UUID(id).toBinary() });
  return result ? outputTransactionFields(result) : result;
};

/**
 * Retrieves transactions by specific tag
 * @param tag
 * @returns
 */
export const getTransactionsByTag = async (tag: string) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.find({ 'relationships.tags.data.id': tag });
  const results = (await cursor.toArray()).map((transaction) =>
    outputTransactionFields(transaction)
  );
  await cursor.close();
  return results;
};

/**
 * Retrieves transactions by tags
 * @returns
 */
export const getTransactionsByTags = async () => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.aggregate(transactionsByTagsPipeline());
  const results = await cursor.toArray();
  await cursor.close();
  return results;
};

/**
 * Retrieves category details
 * @param type child or parent categories
 * @returns
 */
export const getCategories = async (type: TransactionCategoryType) => {
  const { db } = await connectToDatabase('up');
  const categories = db.collection('categories');
  const cursor = categories
    .find({
      'relationships.parent.data': type === 'child' ? { $ne: null } : null,
    })
    .sort({ 'attributes.name': 1 })
    .project<TransactionCategoryOption>({
      _id: 0,
      value: '$attributes.name',
      name: '$attributes.name',
    });
  const results = await cursor.toArray();
  return results;
};

/**
 * Retrieves all unique transaction tags
 */
export const getTags = async () => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.aggregate<{ tags: string[] }>(
    uniqueTagsPipeline()
  );
  const results = await cursor.toArray();
  await cursor.close();
  return results[0];
};

/**
 * Retrieves bank transfers by account and date range
 * @returns
 */
const getTransfers = async (dateRange: DateRange) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.find({
    'relationships.account.data.id': process.env.UP_TRANS_ACC,
    'attributes.isCategorizable': false,
    'attributes.createdAt': {
      $gte: dateRange.from,
      $lt: dateRange.to,
    },
  });
  const results = (await cursor.toArray()).map((transaction) =>
    outputTransactionFields(transaction)
  );
  await cursor.close();
  return results;
};

/**
 * Retrieves account balance between 2 dates
 * @param start
 * @param end
 * @param accountId
 * @returns
 */
const getAccountBalance = async (
  dateRange: DateRange,
  account: TransactionAccountType
) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.aggregate<AccountBalanceHistory>(
    accountBalancePipeline(
      dateRange.from,
      dateRange.to,
      (account === 'transactional'
        ? process.env.UP_TRANS_ACC
        : process.env.UP_SAVINGS_ACC) || ''
    )
  );
  const results = await cursor.toArray();
  await cursor.close();
  return results;
};

export {
  getAccountBalance,
  getTransactionById,
  getTransactionsByCategory,
  getTransactionsByDate,
  getTransfers,
};
