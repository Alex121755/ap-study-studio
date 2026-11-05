import { isLocalRequest, localAccessDenied, normalizeLocalRequest } from "@/lib/local-access";
import { allTopics, subjects } from "@/lib/curriculum";
import { handleChatRequest, type TutorCatalog } from "@/lib/tutor";
import { getModelCatalog } from "@/lib/model-catalog";
import {getLesson} from "@/lib/lessons";
import {readOpenAIKey} from "@/lib/server-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const catalog: TutorCatalog = {
  subjectIds: subjects.map((subject) => subject.id),
  topicSubject: (id) => allTopics.find((topic) => topic.id === id)?.subjectId,
  context: (input) => {
    const selectedTopic = allTopics.find((topic) => topic.id === input.topicId);
    const subject = subjects.find((subject) => subject.id === input.subjectId);
    const relatedIds = new Set([...(selectedTopic?.prerequisites ?? []), ...(selectedTopic?.links.map((link) => link.to) ?? [])]);
    const topicContext = (topic: (typeof allTopics)[number]) => ({
      id: topic.id, subjectId: topic.subjectId, unit: topic.unit, title: topic.title,
      en: topic.en, summary: topic.summary, prerequisites: topic.prerequisites, links: topic.links,
    });
    return JSON.stringify({
      selectedTopic,
      selectedLesson: selectedTopic ? getLesson(selectedTopic.id) : undefined,
      subject: subject && { id: subject.id, name: subject.name, description: subject.description, source: subject.source },
      directlyRelatedTopics: allTopics.filter((topic) => relatedIds.has(topic.id)).map(topicContext),
      topics: allTopics.filter((topic) => topic.subjectId === input.subjectId && topic.id !== input.topicId).map(topicContext),
      crossSubjectIndex: allTopics.map((topic) => ({ id: topic.id, subjectId: topic.subjectId, title: topic.title })),
    });
  },
};

export async function POST(request: Request) {
  if (!isLocalRequest(request)) return localAccessDenied();
  const localRequest = normalizeLocalRequest(request);
  const apiKey = readOpenAIKey();
  const available = apiKey?.trim() ? await getModelCatalog(apiKey) : undefined;
  return handleChatRequest(localRequest, {
    apiKey,
    authenticate: async () => isLocalRequest(request),
    catalog: { ...catalog, ...(available ? { allowedModels: available.models, allowUnlistedModels: available.source !== "api" } : {}) },
  });
}
