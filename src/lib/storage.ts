"use client";

import { useEffect, useState } from "react";
import { sampleData } from "./sample-data";
import type { WorkroomData } from "./types";

const STORAGE_KEY = "nayul-workroom:v1";

function normalizeData(value: Partial<WorkroomData> | null): WorkroomData {
  return {
    today: {
      priorities:
        value?.today?.priorities?.length === 3
          ? value.today.priorities
          : sampleData.today.priorities,
    },
    tasks: value?.tasks ?? sampleData.tasks,
    projects: value?.projects ?? sampleData.projects,
    languageNotes: value?.languageNotes ?? sampleData.languageNotes,
    designNotes: value?.designNotes ?? sampleData.designNotes,
    prompts: value?.prompts ?? sampleData.prompts,
    moneyRecords: value?.moneyRecords ?? sampleData.moneyRecords,
    weeklyResets: value?.weeklyResets ?? sampleData.weeklyResets,
  };
}

export function useWorkroomData() {
  const [data, setData] = useState<WorkroomData>(sampleData);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setData(stored ? normalizeData(JSON.parse(stored)) : sampleData);
    } catch {
      setData(sampleData);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, isReady]);

  const resetData = () => {
    setData(sampleData);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
  };

  return { data, setData, isReady, resetData };
}
