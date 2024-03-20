import { columns } from '@/app/(dashboard)/transactions/columns';
import { DataTable } from '@/app/(dashboard)/transactions/data-table';
import { getCategories, getTransactionsByTag, searchTransactions } from '@/db';
import { filterTransactionFields } from '@/utils/helpers';

interface TransactionsByTagProps {
  tag: string;
  search?: string;
}

const TransactionsByTag = async ({ tag, search }: TransactionsByTagProps) => {
  const data = filterTransactionFields(
    search ? await searchTransactions(search) : await getTransactionsByTag(tag)
  );
  const categories = await getCategories('child');

  return (
    <DataTable
      columns={columns}
      data={data}
      options={categories}
      search={search}
    />
  );
};

export default TransactionsByTag;
