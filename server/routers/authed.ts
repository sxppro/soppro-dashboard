import {
  getAccountBalance,
  getCategories,
  getCategoryInfo,
  getMonthlyInfo,
  getTagInfo,
  getTransactionById,
  getTransactionsByDate,
  getTransfers,
  replaceTransactions,
} from '@/db';
import { filterTransactionFields } from '@/utils/helpers';
import { addTags, deleteTags, getTags } from '@/utils/up';
import { TRPCError } from '@trpc/server';
import { format } from 'date-fns';
import { z } from 'zod';
import {
  AccountBalanceHistorySchema,
  AccountMonthlyInfoSchema,
  DateRangeSchema,
  TransactionAccountTypeSchema,
  TransactionCategoryInfoSchema,
  TransactionCategoryTypeSchema,
  TransactionIdSchema,
  TransactionResourceFilteredSchema,
  TransactionRetrievalOptionsSchema,
  TransactionTagsModificationSchema,
} from '../schemas';
import { authedProcedure, router } from '../trpc';

export const authedRouter = router({
  getCategories: authedProcedure
    .input(TransactionCategoryTypeSchema)
    .query(async ({ input }) => {
      return await getCategories(input);
    }),
  getTags: authedProcedure.query(async () =>
    (await getTags()).map(({ id }) => ({ name: id, value: id }))
  ),
  addTags: authedProcedure
    .input(TransactionTagsModificationSchema)
    .mutation(async ({ input }) => {
      const { transactionId, tags } = input;
      const { error, response } = await addTags(transactionId, tags);
      if (error) {
        console.error(error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      const res = await replaceTransactions([transactionId]);
      if (!response.ok || res !== 1) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
  deleteTags: authedProcedure
    .input(TransactionTagsModificationSchema)
    .mutation(async ({ input }) => {
      const { transactionId, tags } = input;
      const { error, response } = await deleteTags(transactionId, tags);
      if (error) {
        console.error(error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      const res = await replaceTransactions([transactionId]);
      if (!response.ok || res !== 1) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
  getMonthlyInfo: authedProcedure
    .input(DateRangeSchema)
    .output(z.array(AccountMonthlyInfoSchema))
    .query(async ({ input }) => {
      return await getMonthlyInfo(input);
    }),
  getCategoryInfo: authedProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        type: TransactionCategoryTypeSchema,
      })
    )
    .output(z.array(TransactionCategoryInfoSchema))
    .query(async ({ input }) => {
      const { dateRange, type } = input;
      return await getCategoryInfo(dateRange, type);
    }),
  getAccountBalance: authedProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        account: TransactionAccountTypeSchema,
      })
    )
    .output(
      z.array(AccountBalanceHistorySchema.extend({ FormattedDate: z.string() }))
    )
    .query(async ({ input }) => {
      const { dateRange, account } = input;
      const accountBalance = await getAccountBalance(dateRange, account);
      return accountBalance.map(({ Timestamp, ...rest }) => {
        return {
          ...rest,
          Timestamp,
          FormattedDate: format(Timestamp, 'dd LLL yy'),
        };
      });
    }),
  getTagInfo: authedProcedure.input(z.string()).query(async ({ input }) => {
    return await getTagInfo(input);
  }),
  getTransactionsByDate: authedProcedure
    .input(TransactionRetrievalOptionsSchema)
    .query(async ({ input }) => {
      const { account, dateRange, type, ...options } = input;
      if (type === 'transactions') {
        const transactions = await getTransactionsByDate(
          account === 'transactional'
            ? process.env.UP_TRANS_ACC || ''
            : account === 'savings'
            ? process.env.UP_SAVINGS_ACC || ''
            : '',
          dateRange,
          options
        );
        return filterTransactionFields(transactions);
      } else if (type === 'transfers') {
        const transfers = await getTransfers(dateRange);
        return filterTransactionFields(transfers);
      }
    }),
  getTransactionById: authedProcedure
    .input(TransactionIdSchema)
    .output(TransactionResourceFilteredSchema)
    .query(async ({ input }) => {
      const transaction = await getTransactionById(input);
      if (!transaction) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return filterTransactionFields([transaction])[0];
    }),
});
