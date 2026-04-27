import { memo } from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { CompanyMeta } from 'shared/client';
import { abbreviateLegalForm } from '@/lib/companyName';

interface ConnectionsCardProps {
  readonly connections: readonly Partial<CompanyMeta>[];
}

export const ConnectionsCard = memo(function ConnectionsCard({ connections }: ConnectionsCardProps) {
  if (connections.length === 0) return null;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-600" /> Связанные организации
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connections.map((conn) => (
          <ConnectionItem key={conn.inn} connection={conn} />
        ))}
      </div>
    </div>
  );
});

interface ConnectionItemProps {
  readonly connection: Partial<CompanyMeta>;
}

const ConnectionItem = memo(function ConnectionItem({ connection }: ConnectionItemProps) {
  return (
    <Link href={`/organizations/${connection.inn}`} className="p-4 rounded-2xl border-2 border-gray-200 bg-gray-50/30 hover:bg-gray-50 hover:border-gray-400 transition-all group">
      <p className="text-xs font-black text-gray-900 uppercase truncate mb-1 group-hover:text-gray-800 transition-colors" title={connection.name}>
        {abbreviateLegalForm(connection.name) || connection.name}
      </p>
      <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
        <span>ИНН: {connection.inn}</span>
        <span className="bg-white px-2 py-0.5 rounded-full border border-gray-100">{connection.status}</span>
      </div>
    </Link>
  );
});
