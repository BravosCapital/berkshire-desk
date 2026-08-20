import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { MarkedHolding } from "@/lib/valuation/compute";
import { formatBillions, formatPct, formatPrice, formatShares } from "@/lib/valuation/format";
import { cn } from "@/lib/utils";

export function HoldingsTable({ holdings }: { holdings: MarkedHolding[] }) {
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "value", desc: true }]);

  const columns = useMemo<ColumnDef<MarkedHolding>[]>(
    () => [
      {
        accessorKey: "ticker",
        header: "Ticker",
        cell: ({ row }) => (
          <div className="min-w-[9rem]">
            <div className="font-medium text-fg">{row.original.ticker}</div>
            <div className="text-kicker text-muted">{row.original.name}</div>
            {row.original.ownershipPct != null ? (
              <div className="mt-0.5 text-kicker text-faint">
                {row.original.ownershipPct.toFixed(1)}% of company
              </div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => <Badge>{String(row.original.source)}</Badge>,
      },
      {
        id: "marks",
        header: "Marks",
        cell: ({ row }) =>
          row.original.live ? (
            <Badge tone="gain">Live</Badge>
          ) : row.original.mapped === false ? (
            <Badge tone="warn">13F value</Badge>
          ) : (
            <Badge tone="warn">Fallback</Badge>
          ),
      },
      {
        accessorKey: "shares",
        header: () => <span className="block w-full text-right">Shares</span>,
        cell: ({ row }) => (
          <span className="block text-right font-mono tabular">
            {formatShares(row.original.shares)}
          </span>
        ),
      },
      {
        accessorKey: "price",
        header: () => <span className="block w-full text-right">Price</span>,
        cell: ({ row }) => (
          <span className="block text-right font-mono tabular">
            {formatPrice(row.original.price, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: "changePct",
        header: () => <span className="block w-full text-right">Day</span>,
        cell: ({ row }) => {
          const n = row.original.changePct;
          return (
            <span
              className={cn(
                "block text-right font-mono tabular",
                n > 0 ? "text-gain" : n < 0 ? "text-loss" : "text-muted",
              )}
            >
              {formatPct(n)}
            </span>
          );
        },
      },
      {
        accessorKey: "value",
        header: () => <span className="block w-full text-right">Value</span>,
        cell: ({ getValue }) => (
          <span className="block text-right font-mono tabular">
            {formatBillions(Number(getValue()))}
          </span>
        ),
      },
      {
        accessorKey: "weight",
        header: () => <span className="block w-full text-right">Wt</span>,
        cell: ({ getValue }) => (
          <span className="block text-right font-mono tabular text-muted">
            {(Number(getValue()) * 100).toFixed(1)}%
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: holdings,
    columns,
    state: { sorting, globalFilter: query },
    onSortingChange: setSorting,
    onGlobalFilterChange: setQuery,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _id, value) => {
      const q = String(value).toLowerCase();
      const h = row.original;
      return (
        h.ticker.toLowerCase().includes(q) ||
        h.name.toLowerCase().includes(q) ||
        h.sector.toLowerCase().includes(q) ||
        h.source.toLowerCase().includes(q)
      );
    },
  });

  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-medium tracking-tight">Equity portfolio</h2>
          <p className="text-sm text-muted">
            13F share counts from EDGAR · Japan stakes from ownership filings · live marks where
            available
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticker or name"
            className="pl-9"
            aria-label="Search holdings"
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border text-kicker uppercase text-faint">
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-2 py-2.5 font-medium">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="inline-flex w-full items-center gap-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" ? (
                          <ArrowUp className="size-3 shrink-0" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDown className="size-3 shrink-0" />
                        ) : null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border/60 last:border-0 hover:bg-surface-2">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-2 py-2.5 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
