/**
 * Creates pipeline for calculating total income,
 * expenditure and number of transactions per month
 * between start and end dates (excluding transfers)
 * for specified account
 * @param start
 * @param end
 * @param account account ID
 * @returns aggregation pipeline definition
 */
const monthlyStatsPipeline = (start: Date, end: Date, account: string) => [
  /**
   * Match documents within the desired date range
   * and filter transfers
   */
  {
    $match: {
      'attributes.createdAt': {
        $gte: start,
        $lte: end,
      },
      'attributes.description': {
        // Match those NOT starting with ...
        $regex:
          '^(?!(Transfer from|Auto Transfer from|Transfer to|Auto Transfer to|Forward to)).+',
      },
      'relationships.account.data.id': account,
      // 'attributes.isCategorizable': true,
    },
  },
  // Project only the necessary fields for further processing
  {
    $project: {
      month: {
        $month: {
          date: '$attributes.createdAt',
          timezone: 'Australia/Melbourne',
        },
      },
      year: {
        $year: {
          date: '$attributes.createdAt',
          timezone: 'Australia/Melbourne',
        },
      },
      amount: {
        $toDecimal: '$attributes.amount.value',
      },
      type: {
        $cond: [
          {
            $lt: [
              {
                $toDecimal: '$attributes.amount.value',
              },
              0,
            ],
          },
          'expense',
          'income',
        ],
      },
    },
  },
  // Group documents by month and type and calculate the total amount and count
  {
    $group: {
      _id: {
        month: { $subtract: ['$month', 1] },
        year: '$year',
      },
      income: {
        $sum: {
          $cond: [{ $eq: ['$type', 'income'] }, '$amount', { $toDecimal: '0' }],
        },
      },
      expense: {
        $sum: {
          $cond: [
            { $eq: ['$type', 'expense'] },
            '$amount',
            { $toDecimal: '0' },
          ],
        },
      },
      transactions: { $sum: 1 },
    },
  },
  // Project the final result
  {
    $project: {
      _id: 0, // Exclude the default _id field from the result
      Month: '$_id.month',
      Year: '$_id.year',
      Income: { $toDouble: '$income' },
      Expenses: { $multiply: [{ $toDouble: '$expense' }, -1] },
      Transactions: '$transactions',
    },
  },
  // Sort the results by month
  {
    $sort: {
      Year: 1,
      Month: 1,
    },
  },
];

/**
 * Pipeline for calculating number of transacrtions
 * and total spending per transaction category for
 * specified account
 * @param start
 * @param end
 * @param account account ID
 * @returns aggregation pipeline definition
 */
const categoriesPipeline = (start: Date, end: Date, account: string) => [
  /**
   * Match documents within the desired date range
   * and filter transfers
   */
  {
    $match: {
      'attributes.createdAt': {
        $gte: start,
        $lte: end,
      },
      'attributes.isCategorizable': true,
      'relationships.account.data.id': account,
    },
  },
  // Project only the necessary fields for further processing
  {
    $project: {
      category: {
        $ifNull: ['$relationships.category.data.id', 'uncategorised'],
      },
      amount: {
        $toDecimal: '$attributes.amount.value',
      },
    },
  },
  // Group documents by month and type and calculate the total amount and count
  {
    $group: {
      _id: '$category',
      amount: {
        $sum: '$amount',
      },
      transactions: {
        $sum: 1,
      },
    },
  },
  // Project the final result
  {
    $project: {
      _id: 0,
      // Exclude the default _id field from the result
      category: '$_id',
      amount: {
        $abs: { $toDouble: '$amount' },
      },
      transactions: 1,
    },
  },
  {
    $sort: {
      transactions: -1,
      amount: -1,
    },
  },
];

/**
 * Pipeline for retrieving transaction
 * IDs grouped by tag
 * @returns
 */
const transactionsByTagsPipeline = () => [
  /**
   * Match only documents that have a tag
   */
  {
    $match: {
      'relationships.tags.data.0': {
        $exists: true,
      },
    },
  },
  {
    $project: {
      tags: '$relationships.tags.data',
    },
  },
  {
    $unwind: {
      path: '$tags',
      preserveNullAndEmptyArrays: false,
    },
  },
  {
    $group: {
      _id: '$tags.id',
      transactions: {
        $addToSet: '$_id',
      },
    },
  },
  {
    $project: {
      _id: 0,
      tag: '$_id',
      transactions: '$transactions',
    },
  },
];

export { categoriesPipeline, monthlyStatsPipeline, transactionsByTagsPipeline };
