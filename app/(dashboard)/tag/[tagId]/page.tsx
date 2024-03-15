import TableSkeleton from '@/components/core/table-skeleton';
import TagDashboard from '@/components/dashboards/tag';
import TransactionsByTag from '@/components/tables/tag-transactions';
import { getTagInfo } from '@/db';
import { X } from 'lucide-react';
import { Suspense } from 'react';

const TagPage = async ({ params }: { params: { tagId: string } }) => {
  const { tagId } = params;
  const decodedTagId = decodeURIComponent(tagId);
  const tagInfo = await getTagInfo(decodedTagId);

  return (
    <>
      {tagInfo ? (
        <>
          <h1 className="text-2xl font-bold tracking-tight">{decodedTagId}</h1>
          <TagDashboard tagInfo={tagInfo} />
          <Suspense fallback={<TableSkeleton cols={4} rows={10} />}>
            <TransactionsByTag tag={decodedTagId} />
          </Suspense>
        </>
      ) : (
        <div className="w-full flex h-screen">
          <div className="flex flex-col items-center gap-2 m-auto">
            <X className="h-8 w-8" />
            <h1 className="text-xl tracking-tight">Tag not found</h1>
          </div>
        </div>
      )}
    </>
  );
};

export default TagPage;
