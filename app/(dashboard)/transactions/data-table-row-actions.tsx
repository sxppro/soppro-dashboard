import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { FilteredTransactionResource } from '@/types/custom';
import { Row } from '@tanstack/react-table';
import { ClipboardCheck, MoreHorizontal } from 'lucide-react';

interface DataTableRowActionsProps {
  row: Row<FilteredTransactionResource>;
}

const DataTableRowActions = ({ row }: DataTableRowActionsProps) => {
  const transaction = row.original;
  const { toast } = useToast();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(transaction.id);
            toast({
              description: (
                <div className="flex gap-2 items-center">
                  <ClipboardCheck className="h-5 w-5" />
                  <span>Transaction ID copied</span>
                </div>
              ),
            });
          }}
        >
          Copy transaction ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View transaction details</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DataTableRowActions;
