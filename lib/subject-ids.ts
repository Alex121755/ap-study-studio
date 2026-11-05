/** Stable IDs shared by the curriculum, learning records, and material backups. */
export const SUBJECT_IDS=['world','elc','physics','stats','psych','research','micro','macro'] as const;
export type SubjectId=(typeof SUBJECT_IDS)[number];
const registered=new Set<string>(SUBJECT_IDS);
export function isSubjectId(value:unknown):value is SubjectId {
 return typeof value==='string'&&registered.has(value);
}
