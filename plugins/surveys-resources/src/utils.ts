// Copyright © 2022 Hardcore Engineering Inc.

import type { Doc, DocumentQuery, FindResult, Data, Ref } from '@hcengineering/core'
import { getClient } from '@hcengineering/presentation'
import type { FormItem, SurveyElement, SurveyReference } from '@hcengineering/surveys'
import { type ColorDefinition, getColorNumberByText } from '@hcengineering/ui'
import { writable } from 'svelte/store'
import surveys from './plugin'
import { FilterQuery } from '@hcengineering/view-resources'
import type { Filter } from '@hcengineering/view'

export function getSurveyStyle (color: ColorDefinition, selected = false): string {
  return `
    background: ${color.color + (selected ? 'ff' : '33')};
    border: 1px solid ${color.color + (selected ? 'ff' : '66')};
    color: ${color.title ?? 'var(--theme-caption-color)'};
  `
}

export async function getRefs (filter: Filter, onUpdate: () => void): Promise<Array<Ref<Doc>>> {
  const lq = FilterQuery.getLiveQuery(filter.index)
  const promise = new Promise<Array<Ref<Doc>>>((resolve, reject) => {
    const q: DocumentQuery<SurveyReference> = {
      survey: { $in: filter.value }
    }
    const refresh = lq.query(surveys.class.SurveyReference, q, (refs: FindResult<SurveyReference>) => {
      const result = Array.from(new Set(refs.map((p) => p.attachedTo)))
      FilterQuery.results.set(filter.index, result)
      resolve(result)
      onUpdate()
    })
    if (!refresh) {
      resolve(FilterQuery.results.get(filter.index) ?? [])
    }
  })
  return await promise
}

/**
 * @public
 */
export const selectedSurveyElements = writable<Array<Ref<SurveyElement>>>([])

/**
 * @public
 */
export async function createSurvey (
  title: string,
  color?: number | null,
  formItems?: FormItem[] | null
): Promise<Ref<SurveyElement>> {
  const surveyElement: Data<any> = {
    title,
    color: color ?? getColorNumberByText(title),
    formItems: formItems ?? []
  }

  const client = getClient()
  return await client.createDoc<SurveyElement>(surveys.class.SurveyElement, surveys.space.Surveys, surveyElement)
}
