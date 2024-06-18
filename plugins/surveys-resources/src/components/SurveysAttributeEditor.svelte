<script lang="ts">
  import { AnyAttribute, Class, Doc, Ref } from '@hcengineering/core'
  import { IntlString } from '@hcengineering/platform'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import type { SurveyReference } from '@hcengineering/surveys'
  import surveys from '@hcengineering/surveys'
  import { Icon, Label, getEventPopupPositionElement, showPopup } from '@hcengineering/ui'
  import SurveyReferencePresenter from './SurveyReferencePresenter.svelte'
  import SurveysEditorPopup from './SurveysEditorPopup.svelte'
  import SurveyIcon from './icons/SurveyIcon.svelte'

  export let object: Doc
  export let label: IntlString = surveys.string.AddLabel
  export let readonly: boolean = false
  export let attr: AnyAttribute | undefined = undefined
  export let targetClass: Ref<Class<Doc>> = object._class

  let items: SurveyReference[] = []
  const query = createQuery()
  const client = getClient()

  $: query.query(surveys.class.SurveyReference, { attachedTo: object._id }, (result) => {
    items = result
  })
  async function surveysHandler (evt: MouseEvent): Promise<void> {
    if (readonly) return
    showPopup(SurveysEditorPopup, { object, targetClass }, getEventPopupPositionElement(evt), undefined, undefined, {
      refId: 'SurveysPopup',
      category: 'popup',
      overlay: true
    })
  }
  async function removeSurvey (survey: SurveyReference): Promise<void> {
    if (survey !== undefined) await client.remove(survey)
  }
</script>

{#if items.length}
  <div class="flex-row-center flex-wrap">
    {#each items as value}
      <div class="step-container clear-mins">
        <SurveyReferencePresenter
          {attr}
          {value}
          isEditable={!readonly}
          kind={'list'}
          on:remove={(res) => removeSurvey(res.detail)}
        />
      </div>
    {/each}
    {#if !readonly}
      <div class="step-container clear-mins">
        <button class="survey-button" on:click|stopPropagation={surveysHandler}>
          <div class="icon"><Icon icon={SurveyIcon} size={'full'} /></div>
          <span class="overflow-label label"><Label {label} /></span>
        </button>
      </div>
    {/if}
  </div>
{:else if !readonly}
  <button class="survey-button" style="width: min-content" on:click|stopPropagation={surveysHandler}>
    <div class="icon"><Icon icon={SurveyIcon} size={'full'} /></div>
    <span class="overflow-label label"><Label {label} /></span>
  </button>
{/if}

<style lang="scss">
  .step-container {
    margin: 0.375rem 0.375rem 0 0;
  }
  .survey-button {
    overflow: hidden;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding: 0 0.625rem 0 0.5rem;
    height: 2rem;
    min-width: 0;
    min-height: 0;
    color: var(--theme-content-color);
    border: 1px solid transparent;
    border-radius: 1rem;

    .icon {
      flex-shrink: 0;
      width: 1rem;
      height: 1rem;
    }
    .label {
      margin-left: 0.25rem;
    }
    &:hover {
      color: var(--theme-caption-color);
      border-color: var(--theme-divider-color);
    }
  }
</style>
