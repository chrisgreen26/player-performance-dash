"use client";

import { useMemo, useState } from "react";
import { Command } from "cmdk";
import type { PlayerRef } from "@/lib/types";

export function PlayerSelector({
  players,
  selectedPlayerId,
  onSelect,
}: {
  players: PlayerRef[];
  selectedPlayerId: number | null;
  onSelect: (playerId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => players.find((p) => p.playerId === selectedPlayerId) ?? null,
    [players, selectedPlayerId]
  );

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [players]
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-left shadow-sm hover:border-blue-400 dark:border-gray-700 dark:bg-gray-900"
      >
        {selected?.headImg ? (
          // key forces a fresh DOM node per player so a previous broken-image
          // state (set via onError below) never leaks onto the next selection
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={selected.playerId}
            src={selected.headImg}
            alt=""
            className="h-12 w-12 rounded-full object-cover bg-gray-100"
            onError={(e) => {
              (e.target as HTMLImageElement).style.visibility = "hidden";
            }}
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        )}
        <span className="flex-1 text-base font-semibold text-gray-900 dark:text-gray-100">
          {selected ? selected.fullName : "Select a player…"}
        </span>
        <span className="text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <Command shouldFilter={false} className="flex flex-col">
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search players…"
              autoFocus
              className="border-b border-gray-200 px-3 py-2 text-sm outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
            <Command.List className="max-h-72 overflow-y-auto p-1">
              <Command.Empty className="px-3 py-2 text-sm text-gray-500">No players found.</Command.Empty>
              {sortedPlayers
                .filter((p) => p.fullName.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 50)
                .map((p) => (
                  <Command.Item
                    key={p.playerId}
                    value={String(p.playerId)}
                    onSelect={() => {
                      onSelect(p.playerId);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm data-[selected=true]:bg-blue-50 dark:text-gray-100 dark:data-[selected=true]:bg-gray-800"
                  >
                    {p.headImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.headImg}
                        alt=""
                        className="h-6 w-6 rounded-full object-cover bg-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.visibility = "hidden";
                        }}
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700" />
                    )}
                    {p.fullName}
                  </Command.Item>
                ))}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  );
}
