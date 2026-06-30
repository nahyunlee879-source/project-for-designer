"use client";

import { useEffect, useState } from "react";
import { sampleData } from "./sample-data";
import type { WorkroomData } from "./types";

const STORAGE_KEY = "nayul-workroom:creative-director:v1";
const WORKFLOW_STORAGE_KEY = "nayul-workroom:deep-workflow:v1";

type WorkroomList<K extends keyof WorkroomData> = WorkroomData[K][number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasString(value: Record<string, unknown>, key: string) {
  return typeof value[key] === "string";
}

function hasNumber(value: Record<string, unknown>, key: string) {
  return typeof value[key] === "number";
}

function isPipelineIdea(value: unknown): value is WorkroomList<"ideas"> {
  return (
    isRecord(value) &&
    hasString(value, "id") &&
    hasString(value, "title") &&
    hasString(value, "rawIdea") &&
    hasString(value, "linkedProjectId") &&
    hasString(value, "currentStatus") &&
    hasString(value, "nextAction") &&
    hasNumber(value, "tasteFit") &&
    hasNumber(value, "portfolioPotential") &&
    hasNumber(value, "brandDepth")
  );
}

function isStudioProject(value: unknown): value is WorkroomList<"projects"> {
  return (
    isRecord(value) &&
    hasString(value, "id") &&
    hasString(value, "name") &&
    hasString(value, "coreIdentity") &&
    hasString(value, "mustInclude") &&
    hasString(value, "mustAvoid") &&
    Array.isArray(value.nextMoves) &&
    Array.isArray(value.standards) &&
    Array.isArray(value.references) &&
    Array.isArray(value.resultReviews)
  );
}

function isExperimentRecord(value: unknown): value is WorkroomList<"experiments"> {
  return (
    isRecord(value) &&
    hasString(value, "id") &&
    hasString(value, "experimentTitle") &&
    hasString(value, "linkedProjectId") &&
    hasString(value, "experimentType") &&
    hasNumber(value, "resultRating") &&
    Array.isArray(value.failureTags)
  );
}

function isPortfolioCase(value: unknown): value is WorkroomList<"portfolioCases"> {
  return (
    isRecord(value) &&
    hasString(value, "id") &&
    hasString(value, "projectId") &&
    isRecord(value.sections) &&
    hasString(value.sections, "projectOverview") &&
    hasString(value.sections, "portfolioDescription")
  );
}

function listOrSample<K extends keyof WorkroomData>(
  value: Partial<WorkroomData> | null,
  key: K,
  isValid: (item: unknown) => item is WorkroomList<K>,
): WorkroomData[K] {
  const list = value?.[key];
  return Array.isArray(list) && list.every(isValid) ? (list as WorkroomData[K]) : sampleData[key];
}

function normalizeData(value: Partial<WorkroomData> | null): WorkroomData {
  return {
    ideas: listOrSample(value, "ideas", isPipelineIdea),
    projects: listOrSample(value, "projects", isStudioProject),
    experiments: listOrSample(value, "experiments", isExperimentRecord),
    portfolioCases: listOrSample(value, "portfolioCases", isPortfolioCase),
  };
}

export function useWorkroomData() {
  const [data, setData] = useState<WorkroomData>(sampleData);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(WORKFLOW_STORAGE_KEY) ??
        window.localStorage.getItem(STORAGE_KEY);
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

    window.localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(data));
  }, [data, isReady]);

  const resetData = () => {
    setData(sampleData);
    window.localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(sampleData));
  };

  return { data, setData, isReady, resetData };
}
