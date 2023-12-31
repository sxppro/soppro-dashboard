import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryOption } from '@/types/custom';
import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  options: CategoryOption[];
}

export function DataTableToolbar<TData>({
  table,
  options,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex flex-1 items-center space-x-2 w-full">
        <Input
          className="h-8 md:w-[250px]"
          placeholder="Filter transactions ..."
          value={
            (table.getColumn('description')?.getFilterValue() as string) ?? ''
          }
          onChange={(e) =>
            table.getColumn('description')?.setFilterValue(e.target.value)
          }
        />
        {table.getColumn('category') && (
          <DataTableFacetedFilter
            column={table.getColumn('category')}
            title="Category"
            options={options}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8"
          >
            Reset <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
