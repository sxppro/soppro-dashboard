'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/utils/helpers';
import { CheckIcon, PlusCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { mutate } from 'swr';

interface TxTagsComboboxProps {
  txId: string;
  title?: string;
  initialState?: string[];
  options: {
    name: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

const TransactionTagsCombobox = ({
  txId,
  title,
  initialState,
  options,
}: TxTagsComboboxProps) => {
  const [filterValues, setFilterValues] = useState<string[]>(
    initialState || []
  );
  const [input, setInput] = useState<string>('');
  const selectedValues = new Set<string>(filterValues);

  const addTags = async (id: string, tags: string[]) => {
    await fetch(`/api/tags/${id}`, {
      method: 'POST',
      body: JSON.stringify({
        tags,
      }),
    });
    mutate(`/api/transaction/${id}`);
    mutate('/api/tags');
  };
  const deleteTags = async (id: string, tags: string[]) => {
    await fetch(`/api/tags/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({
        tags,
      }),
    });
    mutate(`/api/transaction/${id}`);
    mutate('/api/tags');
  };

  const handleTagSelect = async (value: string) => {
    if (selectedValues.has(value)) {
      selectedValues.delete(value);
      await deleteTags(txId, [value]);
    } else {
      selectedValues.add(value);
      await addTags(txId, Array.from(selectedValues));
    }
    const filterValues = Array.from(selectedValues);
    setFilterValues(filterValues.length ? filterValues : []);
  };
  const handleClearTags = async () => {
    await deleteTags(txId, Array.from(selectedValues));
    setFilterValues([]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-6 border-dashed rounded-full text-xs"
        >
          <PlusCircleIcon className={cn('h-3 w-3', title && 'mr-1')} />
          {title}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={title}
            value={input}
            onValueChange={(input) => setInput(input)}
          />
          <CommandList>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={async () => {
                      await handleTagSelect(option.value);
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {input && (
              <CommandGroup heading="Create tag">
                <CommandItem
                  value={input.trim()}
                  onSelect={async () => await handleTagSelect(input)}
                >
                  <div
                    className={cn(
                      'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                      selectedValues.has(input)
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50 [&_svg]:invisible'
                    )}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <span>{input}</span>
                </CommandItem>
              </CommandGroup>
            )}
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => handleClearTags()}
                    className="justify-center text-center"
                  >
                    Clear all tags
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default TransactionTagsCombobox;