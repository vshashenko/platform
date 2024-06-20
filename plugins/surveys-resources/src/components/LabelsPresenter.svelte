<script lang="ts">
  import { Doc, WithLookup } from '@hcengineering/core'
  import { createQuery } from '@hcengineering/presentation'
  import type { SurveyReference } from '@hcengineering/surveys'
  import surveys from '@hcengineering/surveys'
  import { Chip, getEventPopupPositionElement, resizeObserver, showPopup, tooltip } from '@hcengineering/ui'
  import { afterUpdate, createEventDispatcher } from 'svelte'
  import SurveyReferencePresenter from './SurveyReferencePresenter.svelte'
  import SurveysEditorPopup from './SurveysEditorPopup.svelte'
  import SurveysItemPresenter from './SurveysItemPresenter.svelte'
  import LabelsPresenter from './LabelsPresenter.svelte'

  export let value: number
  export let object: WithLookup<Doc>
  export let full: boolean
  export let ckeckFilled: boolean = false
  export let kind: 'short' | 'full' | 'list' | 'link' | 'todo' | 'todo-compact' = 'short'
  export let isEditable: boolean = false
  export let action: (evt: MouseEvent) => Promise<void> | void = async () => {}
  export let compression: boolean = false
  export let ignoreFirst: boolean = false

  const dispatch = createEventDispatcher()

  let items: SurveyReference[] = []
  const query = createQuery()

  $: update(object, value)

  function update (object: WithLookup<Doc>, value: number) {
    if (value > 0) {
      query.query(surveys.class.SurveyReference, { attachedTo: object._id }, (result) => {
        items = result.slice(ignoreFirst ? 1 : 0)
      })
    } else {
      query.unsubscribe()
      items = []
    }
  }

  async function surveysHandler (evt: MouseEvent): Promise<void> {
    showPopup(SurveysEditorPopup, { object }, getEventPopupPositionElement(evt), undefined, undefined, {
      refId: 'SurveysPopup',
      category: 'popup',
      overlay: true
    })
  }

  let allWidth: number
  const widths: number[] = []

  afterUpdate(() => {
    let count: number = 0
    widths.forEach((i) => (count += i))
    full = count > allWidth
    dispatch('change', { full, ckeckFilled })
  })
</script>

{#if kind === 'list' || kind === 'link'}
  {#if items.length > 4}
    <div
      class="label-box no-shrink"
      use:tooltip={{
        component: SurveysItemPresenter,
        props: { value: items, kind: 'link' }
      }}
    >
      <!-- <SurveyReferencePresenter {value} {kind} /> -->
    </div>
  {:else}
    {#each items as value}
      <div class="label-box no-shrink" title={value.title}>
        <SurveyReferencePresenter attr={undefined} {value} {kind} />
      </div>
    {/each}
  {/if}
{:else if kind === 'todo'}
  <div class="flex-row-top flex-wrap flex-gap-0-5">
    {#each items as value}
      <SurveyReferencePresenter attr={undefined} {value} {kind} />
    {/each}
  </div>
{:else if kind === 'todo-compact'}
  {#if items.length > 1}
    <div class="flex-row-top flex-wrap flex-gap-0-5">
      <SurveyReferencePresenter attr={undefined} value={items[0]} kind={'todo'} />
      <Chip
        label={`+${items.length - 1}`}
        size={'min'}
        backgroundColor={'var(--survey-subtle-PorpoiseBackground)'}
        tooltip={{
          component: LabelsPresenter,
          props: { value, object, isEditable, kind: 'todo', ignoreFirst: true }
        }}
      />
    </div>
  {:else if items.length === 1}
    <SurveyReferencePresenter attr={undefined} value={items[0]} kind={'todo'} />
  {/if}
{:else}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="labels-container"
    style:justify-content={kind === 'short' ? 'space-between' : 'flex-start'}
    class:w-full={kind === 'full'}
    style:flex-wrap={kind === 'short' || compression ? 'nowrap' : 'wrap'}
    style:flex-shrink={compression ? 1 : 0}
    use:resizeObserver={(element) => {
      allWidth = element.clientWidth
    }}
    on:click|stopPropagation={(evt) => {
      if (isEditable) surveysHandler(evt)
      else action(evt)
    }}
  >
    {#each items as value, i}
      <div class="label-box wrap-{kind}" title={value.title}>
        <SurveyReferencePresenter attr={undefined} {value} kind={'link'} bind:realWidth={widths[i]} />
      </div>
    {/each}
  </div>
{/if}

<style lang="scss">
  .labels-container {
    overflow: hidden;
    display: flex;
    align-items: center;
    flex-shrink: 1;
    min-width: 0;
    border-radius: 0.25rem;
  }

  .label-box {
    display: flex;
    align-items: center;
    width: auto;
    min-width: 0;
    border-radius: 0.25rem;
    transition: box-shadow 0.15s ease-in-out;
  }
  .wrap-short:not(:last-child) {
    margin-right: 0.375rem;
  }
  .wrap-full {
    margin: 0.125rem;
  }
</style>
