"use client";

import { useEffect, useState } from "react";
import type { PlayerGameRow, ReferenceData } from "@/lib/types";
import { GAMES_DATA_URL, REFERENCE_DATA_URL } from "@/lib/constants";

interface DashboardData {
  reference: ReferenceData;
  games: PlayerGameRow[];
  gamesByPlayer: Map<number, PlayerGameRow[]>;
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: DashboardData };

export function useDashboardData(): LoadState {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const refRes = await fetch(REFERENCE_DATA_URL);
        if (!refRes.ok) throw new Error(`Failed to load reference data (${refRes.status})`);
        const reference: ReferenceData = await refRes.json();

        const gamesRes = await fetch(`${GAMES_DATA_URL}?v=${encodeURIComponent(reference.meta.generatedAt)}`);
        if (!gamesRes.ok) throw new Error(`Failed to load game data (${gamesRes.status})`);
        const games: PlayerGameRow[] = await gamesRes.json();

        if (cancelled) return;

        const gamesByPlayer = new Map<number, PlayerGameRow[]>();
        for (const g of games) {
          if (!gamesByPlayer.has(g.playerId)) gamesByPlayer.set(g.playerId, []);
          gamesByPlayer.get(g.playerId)!.push(g);
        }

        setState({ status: "ready", data: { reference, games, gamesByPlayer } });
      } catch (err) {
        if (cancelled) return;
        setState({ status: "error", message: err instanceof Error ? err.message : String(err) });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
