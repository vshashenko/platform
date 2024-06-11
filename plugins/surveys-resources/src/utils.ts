// Copyright © 2022 Hardcore Engineering Inc.

import { type Data, type Ref } from '@hcengineering/core'
import { getClient } from '@hcengineering/presentation'
import { type SurveyElement } from '@hcengineering/surveys'
import { type ColorDefinition, getColorNumberByText } from '@hcengineering/ui'
import { writable } from 'svelte/store'
import surveys from './plugin'

export function getSurveyStyle (color: ColorDefinition, selected = false): string {
  return `
    background: ${color.color + (selected ? 'ff' : '33')};
    border: 1px solid ${color.color + (selected ? 'ff' : '66')};
    color: ${color.title ?? 'var(--theme-caption-color)'};
  `
}

/**
 * @public
 */
export const selectedSurveyElements = writable<Array<Ref<SurveyElement>>>([])

/**
 * @public
 */
export async function createSurveyElement (
  title: string,
  color?: number | null,
  formItems?: Ref<any> | null
): Promise<Ref<SurveyElement>> {
  const surveyElement: Data<any> = {
    title,
    color: color ?? getColorNumberByText(title),
    formItems: formItems ?? []

  }

  const client = getClient()
  return await client.createDoc<SurveyElement>(surveys.class.SurveyElement, surveys.space.Surveys, surveyElement)
}
