import {
  getAccountBalance,
  getCategories,
  getCategoryInfo,
  getCategoryInfoHistory,
  getMonthlyInfo,
  getTagInfo,
  getTransactionById,
} from '@/db';
import { getTransactions } from '@/db/helpers';
import { filterTransactionFields } from '@/utils/helpers';
import { TRPCError } from '@trpc/server';
import { format } from 'date-fns';
import { z } from 'zod';
import {
  AccountBalanceHistorySchema,
  AccountMonthlyInfoSchema,
  DateRangeGroupBySchema,
  DateRangeSchema,
  TransactionCategoryInfoHistory,
  TransactionCategoryInfoHistorySchema,
  TransactionCategoryInfoSchema,
  TransactionCategoryTypeSchema,
  TransactionIdSchema,
  TransactionResourceFilteredSchema,
  TransactionRetrievalOptionsSchema,
} from '../schemas';
import { publicProcedure, router } from '../trpc';

export const publicRouter = router({
  getCategories: publicProcedure
    .input(TransactionCategoryTypeSchema)
    .query(async ({ input }) => {
      return await getCategories(input);
    }),
  getMonthlyInfo: publicProcedure
    .input(
      z.object({
        accountId: z.string().uuid(),
        dateRange: DateRangeSchema,
        groupBy: DateRangeGroupBySchema.optional(),
      })
    )
    .output(z.array(AccountMonthlyInfoSchema))
    .query(async ({ input }) => {
      const { accountId, dateRange, groupBy } = input;
      const results = await getMonthlyInfo(accountId, dateRange, groupBy);
      return results.map(({ Year, Month, ...rest }) =>
        Year && Month
          ? {
              ...rest,
              Year,
              Month,
              FormattedDate: format(new Date(Year, Month - 1), 'LLL yy'),
            }
          : rest
      );
    }),
  getCategoryInfo: publicProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        type: TransactionCategoryTypeSchema,
        parentCategory: z.string().optional(),
      })
    )
    .output(z.array(TransactionCategoryInfoSchema))
    .query(async ({ input }) => {
      const { dateRange, type, parentCategory } = input;
      return await getCategoryInfo(dateRange, type, parentCategory);
    }),
  getCategoryInfoHistory: publicProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        type: TransactionCategoryTypeSchema,
      })
    )
    .output(z.array(TransactionCategoryInfoHistorySchema))
    .query(async ({ input }) => {
      const { dateRange, type } = input;
      const results = await getCategoryInfoHistory(dateRange, type);
      return results.map(({ month, year, categories }) => {
        // @ts-expect-error
        const remappedElem: TransactionCategoryInfoHistory = {
          FormattedDate: format(new Date(year, month - 1), 'LLL yy'),
        };
        categories.map(
          ({ amount, category }) => (remappedElem[category] = amount)
        );
        return remappedElem;
      });
    }),
  getAccountBalance: publicProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        accountId: z.string().uuid(),
      })
    )
    .output(
      z.array(AccountBalanceHistorySchema.extend({ FormattedDate: z.string() }))
    )
    .query(async ({ input }) => {
      const { dateRange, accountId } = input;
      const accountBalance = await getAccountBalance(dateRange, accountId);
      return accountBalance.map(({ Timestamp, ...rest }) => {
        return {
          ...rest,
          Timestamp,
          FormattedDate: format(Timestamp, 'dd LLL'),
        };
      });
    }),
  getTagInfo: publicProcedure.input(z.string()).query(async ({ input }) => {
    return await getTagInfo(input);
  }),
  getTransactionsByDate: publicProcedure
    .input(TransactionRetrievalOptionsSchema)
    .query(async ({ input }) => {
      return await getTransactions(input);
    }),
  getTransactionById: publicProcedure
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
