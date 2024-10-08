'use client';

import { formatCurrency } from '@/utils/helpers';
import { trpc } from '@/utils/trpc';
import Link from 'next/link';
import TableSkeleton from '../core/table-skeleton';
import TransactionTagsCombobox from '../core/transaction-tags-combobox';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

interface TransactionDetailsProps {
  transactionId: string;
}

const TransactionDetails = ({ transactionId }: TransactionDetailsProps) => {
  const { data: txDetails, isLoading } =
    trpc.public.getTransactionById.useQuery(transactionId);
  const { data: tags } = trpc.user.getTags.useQuery();
  const isTagged =
    txDetails && Array.isArray(txDetails.tags) && txDetails.tags.length > 0;

  if (isLoading || !txDetails) {
    return <TableSkeleton cols={2} rows={10} />;
  }

  return (
    <>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Description</TableCell>
            <TableCell className="text-end">{txDetails.description}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Raw</TableCell>
            <TableCell className="font-mono text-end">
              {txDetails.rawText ?? '—'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Message</TableCell>
            <TableCell className="font-mono text-end">
              {txDetails.message ?? '—'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Amount</TableCell>
            <TableCell className="text-end">
              {formatCurrency(txDetails.amountRaw)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Time</TableCell>
            <TableCell className="text-end">
              {new Date(txDetails.time).toLocaleString()}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Category</TableCell>
            <TableCell className="text-end">{txDetails.category}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Parent Category</TableCell>
            <TableCell className="text-end">
              {txDetails.parentCategory}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Status</TableCell>
            <TableCell className="text-end">{txDetails.status}</TableCell>
          </TableRow>
          {tags ? (
            <TableRow>
              <TableCell className="font-medium">Tags</TableCell>
              <TableCell className="text-end">
                <div className="flex flex-wrap justify-end gap-1">
                  {isTagged &&
                    txDetails.tags.map((tag: string) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  <TransactionTagsCombobox
                    txId={txDetails.id}
                    title="Add tags"
                    options={tags || []}
                    initialState={txDetails.tags}
                  />
                </div>
              </TableCell>
            </TableRow>
          ) : (
            ''
          )}
        </TableBody>
      </Table>
      {txDetails.deepLinkURL ? (
        <Button asChild>
          <Link href={txDetails.deepLinkURL}>Open in Up</Link>
        </Button>
      ) : (
        ''
      )}
    </>
  );
};

export default TransactionDetails;
