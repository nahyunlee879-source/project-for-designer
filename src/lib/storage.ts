"use client";

import { useEffect, useState } from "react";
import { sampleData } from "./sample-data";
import type { WorkroomData } from "./types";

const LEGACY_STORAGE_KEYS = [
  "nayul-workroom:creative-director:v1",
  "nayul-workroom:deep-workflow:v1",
];
const STORAGE_KEY = "nayul-os:life-operating-system:v1";

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

function hasBoolean(value: Record<string, unknown>, key: string) {
  return typeof value[key] === "boolean";
}

function isGoal(value: unknown): value is WorkroomList<"goals"> {
  return (
    isRecord(value) &&
    hasString(value, "id") &&
    hasString(value, "goalTitle") &&
    hasString(value, "area") &&
    hasString(value, "targetDate") &&
    hasString(value, "nextMilestone") &&
    hasNumber(value, "progressPercentage") &&
    Array.isArray(value.linkedProjectIds) &&
    Array.isArray(value.linkedTaskIds)
  );
}

function isTodayAction(value: unknown): value is WorkroomList<"todayActions"> {
  return (
    isRecord(value) &&
    hasString(value, "id") &&
    hasString(value, "actionTitle") &&
    hasString(value, "linkedGoalId") &&
    hasString(value, "area") &&
    hasString(value, "dueDate") &&
    hasString(value, "status") &&
    hasNumber(value, "importance")
  );
}

function isProject(value: unknown): value is WorkroomList<"projects"> {
  return (
    isRecord(value) &&
    hasString(value, "id") &&
    hasString(value, "projectTitle") &&
    hasString(value, "projectType") &&
    hasString(value, "purpose") &&
    hasString(value, "nextAction") &&
    hasNumber(value, "portfolioPotential") &&
    hasNumber(value, "careerRelevance") &&
    Array.isArray(value.linkedGoalIds)
  );
}

function isStudyRoute(value: unknown): value is WorkroomList<"studyRoutes"> {
  return (
    isRecord(value) &&
    hasString(value, "id") &&
    hasString(value, "subjectLanguage") &&
    hasString(value, "currentLevel") &&
    hasString(value, "targetLevel") &&
    hasString(value, "linkedGoalId") &&
    hasNumber(value, "studyStreak")
  );
}

function isMoneyRecord(value: unknown): value is WorkroomList<"moneyRecords"> {
  return (
    isRecord(value) &&
    hasString(value, "id") &&
    hasString(value, "recordType") &&
    hasNumber(value, "amount") &&
    hasString(value, "connectedGoalId") &&
    hasString(value, "date") &&
    hasBoolean(value, "futureInvestment") &&
    hasBoolean(value, "wasted")
  );
}

function isCareerItem(value: unknown): value is WorkroomList<"careerItems"> {
  return (
    isRecord(value) &&
    hasString(value, "id") &&
    hasString(value, "opportunityTitle") &&
    hasString(value, "type") &&
    hasString(value, "status") &&
    hasString(value, "deadline") &&
    hasNumber(value, "careerRelevance")
  );
}

function isAdminItem(value: unknown): value is WorkroomList<"adminItems"> {
  return (
    isRecord(value) &&
    hasString(value, "id") &&
    hasString(value, "itemTitle") &&
    hasString(value, "adminType") &&
    hasString(value, "status") &&
    hasString(value, "deadline") &&
    hasString(value, "linkedGoalId")
  );
}

function isWeeklyReview(value: unknown): value is WorkroomList<"weeklyReviews"> {
  return (
    isRecord(value) &&
    hasString(value, "id") &&
    hasString(value, "weekOf") &&
    hasString(value, "moneySummary") &&
    hasString(value, "studySummary") &&
    Array.isArray(value.nextWeekTopThree)
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
    goals: listOrSample(value, "goals", isGoal),
    todayActions: listOrSample(value, "todayActions", isTodayAction),
    projects: listOrSample(value, "projects", isProject),
    studyRoutes: listOrSample(value, "studyRoutes", isStudyRoute),
    moneyRecords: listOrSample(value, "moneyRecords", isMoneyRecord),
    careerItems: listOrSample(value, "careerItems", isCareerItem),
    adminItems: listOrSample(value, "adminItems", isAdminItem),
    weeklyReviews: listOrSample(value, "weeklyReviews", isWeeklyReview),
  };
}

function loadStoredData() {
  const stored =
    window.localStorage.getItem(STORAGE_KEY) ??
    LEGACY_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean);

  return stored ? normalizeData(JSON.parse(stored) as Partial<WorkroomData>) : sampleData;
}

export function useWorkroomData() {
  const [data, setData] = useState<WorkroomData>(sampleData);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      setData(loadStoredData());
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
