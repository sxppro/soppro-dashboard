import ActiveLink from '@/components/core/active-link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { getTags } from '@/db';
import { X } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — Tags',
};

const TagPage = async () => {
  const data = await getTags();

  return (
    <>
      {data ? (
        <div className="w-full flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
          <Table>
            <TableCaption>
              List of tags assigned to your transactions
            </TableCaption>
            <TableBody>
              {data.tags &&
                data.tags.map((tag) => (
                  <TableRow key={tag}>
                    <TableCell>{tag}</TableCell>
                    <TableCell className="text-end">
                      {' '}
                      <Button variant="link" asChild>
                        <ActiveLink href={`/tag/${tag}`}>Details</ActiveLink>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="w-full flex h-screen">
          <div className="flex flex-col items-center gap-2 m-auto">
            <X className="h-8 w-8" />
            <h1 className="text-xl tracking-tight">No tags found</h1>
          </div>
        </div>
      )}
    </>
  );
};

export default TagPage;
