import { Color } from '@tremor/react';
import { components } from './up-api';

import type { Binary } from 'bson';
import type { DateRange } from 'react-day-picker';

interface TransactionResourceAttributes
  extends Omit<
    components['schemas']['TransactionResource']['attributes'],
    'createdAt' | 'settledAt'
  > {
  createdAt: Date;
  settledAt: Date | null;
}

export interface DbTransactionResource
  extends Omit<
    components['schemas']['TransactionResource'],
    'id' | 'attributes'
  > {
  _id: Binary;
  attributes: TransactionResourceAttributes;
}

export interface FilteredTransactionResource {
  id: string;
  description: string;
  rawText: string | null;
  amount: string;
  amountRaw: number;
  time: string;
  status: string;
  category: string;
  parentCategory: string;
  tags: string[];
}

export type DateRangeContext = {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
};

export type PageProps = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export type TransactionRetrievalOptions = {
  sort: 'time' | 'amount';
  sortDir: 'asc' | 'desc';
  limit?: number;
};

export type TransactionAccountType = 'transactional' | 'savings';

export type StatCardInfo = {
  title: string;
  metric: string | number | undefined;
  icon: any;
  color: Color;
  isLoading?: boolean;
};
