<script lang="ts">
  import { Card } from '@hcengineering/presentation'
  import {
    Button,
    DropdownLabels,
    EditBox,
    eventToHTMLElement,
    getColorNumberByText,
    getPlatformColorDef,
    IconFolder,
    showPopup,
    themeStore
  } from '@hcengineering/ui'
  import { ColorsPopup } from '@hcengineering/view-resources'
  import { createEventDispatcher } from 'svelte'
  import surveys from '../plugin'
  import { createSurvey, getSurveyStyle } from '../utils'
  import LongText from './formItems/LongText.svelte'
  import ShortText from './formItems/ShortText.svelte'
  import Select from './formItems/Select.svelte'
  import Checkbox from './formItems/Checkbox.svelte'

  export let keyTitle: string = ''
  export let title: string = ''

  let color: number = getColorNumberByText(title)
  let colorSet = false

  $: if (!colorSet) {
    color = getColorNumberByText(title)
  }

  async function createSurveyFnc (): Promise<void> {
    const res = await createSurvey(title, color, formElements)
    dispatch('close', res)
  }

  export function canClose(): boolean {
    return title === ''
  }

  const dispatch = createEventDispatcher()

  const showColorPopup = (evt: MouseEvent): void => {
    showPopup(
      ColorsPopup,
      { selected: getPlatformColorDef(color, $themeStore.dark).name },
      eventToHTMLElement(evt),
      (col) => {
        if (col != null) {
          color = col
          colorSet = true
        }
      }
    )
  }

  // Form elements list
  type FormElementType = 'long-text' | 'short-text' | 'select' | 'checkbox' | 'range'

  interface FormElement {
    id: number
    type: FormElementType
    question: string
    options?: string[]
    defaultValue?: string
  }

  let formElements: FormElement[] = []
  let selected: string | string[] = []

  // Add form element based on selection
  function addFormElement(type: FormElementType): void {
    const newElement: FormElement = { id: Date.now(), type, question: '', options: type === 'select' || type === 'checkbox' ? [''] : undefined, defaultValue: ''}
    formElements = [...formElements, newElement]
  console.log('formElements', formElements);

  }

  // Update form element
  function updateQuestion(id: number, newQuestion: string): void {
    formElements = formElements.map(element => element.id === id ? { ...element, question: newQuestion } : element)
  }

  // Update form element default value

  function updateDefaultValue(id: number, newDefaultValue: string): void {
    formElements = formElements.map(element => element.id === id ? { ...element, defaultValue: newDefaultValue } : element)
  }

  function updateOptions(id: number, newOptions: string[]): void {
    formElements = formElements.map(element => element.id === id ? { ...element, options: newOptions } : element)
  }

</script>

<Card
  label={surveys.string.AddSurvey}
  labelProps={{ word: keyTitle }}
  okAction={() => createSurveyFnc()}
  canSave={title.trim().length > 0}
  on:close={() => {
    dispatch('close')
  }}
  on:changeContent
>
  <div class="flex-row-top clear-mins">
    <div class="mr-3">
      <Button size={'medium'} kind={'link-bordered'} on:click={showColorPopup}>
        <svelte:fragment slot="content">
          <div class="color pointer-events-none" style={getSurveyStyle(getPlatformColorDef(color, $themeStore.dark))} />
        </svelte:fragment>
      </Button>
    </div>
    <div class="flex-col mt-0-5 w-full">
      <EditBox
        bind:value={title}
        placeholder={surveys.string.SurveyName}
        placeholderParam={{ word: keyTitle }}
        kind={'large-style'}
        autoFocus
      />
    </div>
  </div>
  <svelte:fragment slot="pool">
    <div class="ml-12">      
      <DropdownLabels
        icon={IconFolder}
        label={surveys.string.SurveyCreateLabel}
        kind={'regular'}
        size={'large'}
        bind:selected
        items={[
          { label: 'Long Text', id: 'long-text' },
          { label: 'Short Text', id: 'short-text' },
          { label: 'Select', id: 'select' },
          { label: 'Checkbox', id: 'checkbox' },
        ]}
        on:selected={(event) => {
          const selectedValue = event.detail
          addFormElement(selectedValue)
        }}
      />
    </div>
  </svelte:fragment>

  <div class="form-elements">
    {#each formElements as element (element.id)}
      {#if element.type === 'long-text'}
        <LongText question={element.question}  
        on:changeQuestion={(event) => updateQuestion(element.id, event.detail)} 
        on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
        />
      {/if}
      {#if element.type === 'short-text'}
        <ShortText question={element.question} 
        on:changeQuestion={(event) => updateQuestion(element.id, event.detail)} 
        on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
        />
      {/if}
      {#if element.type === 'select'}
        <Select 
        question={element.question} 
        options={element.options} 
        on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
        on:changeQuestion={(event) => updateQuestion(element.id, event.detail)} on:changeOptions={(event) => updateOptions(element.id, event.detail)} />
      {/if}
      {#if element.type === 'checkbox'}
        <Checkbox 
        question={element.question} 
        options={element.options} 
        on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
        on:changeQuestion={(event) => updateQuestion(element.id, event.detail)} on:changeOptions={(event) => updateOptions(element.id, event.detail)} />
      {/if}
    {/each}
  </div>
</Card>

<style lang="scss">
  .color {
    width: 1rem;
    height: 1rem;
    border-radius: 0.25rem;
  }
  .form-elements {
    margin-top: 1rem;
  }
  .form-element {
    margin-bottom: 1rem;
  }
</style>
