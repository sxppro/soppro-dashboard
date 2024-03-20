'use client';

import { AlignJustify } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import MainNav from './main-nav';

const MobileNav = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button className={className} variant="outline" size="icon" {...props}>
          <AlignJustify />
          <span className="sr-only">Open drawer</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={'left'}>
        <SheetHeader>
          <SheetTitle className="text-start">Dashboard</SheetTitle>
        </SheetHeader>
        <SheetClose asChild>
          <MainNav
            className="flex flex-col gap-4 py-4"
            setOpen={setSheetOpen}
          />
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
