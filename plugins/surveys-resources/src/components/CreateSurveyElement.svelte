<script lang="ts">
  import { Card, createQuery, getClient } from '@hcengineering/presentation'
  import {
    Button,
    DropdownLabels,
    DropdownTextItem,
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
  import { FormItem, SurveyElement } from '@hcengineering/surveys'
  import { Class, Data, Doc, DocumentUpdate, Ref } from '@hcengineering/core'
  import FormElement from './FormElement.svelte'



  export let value: SurveyElement;
  const client = getClient();
  console.log(value);
  
  export let keyTitle: string = ''
  export let title: string = ''
  export let targetClass: Ref<Class<Doc>>
  let formItems: DropdownTextItem[] = []
  let formElements: FormItem[] = []
  let color: number = getColorNumberByText(title)
  let colorSet = false
console.log(targetClass);

  $: if (!colorSet) {
    color = getColorNumberByText(title)
  }

  async function createSurveyFnc(): Promise<void> {
    const res = await createSurvey(title, color, formElements)
    dispatch('close', res)
  }

  export function canClose(): boolean {
    return title === ''
  }

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

  let selected: string | string[] = []

  function addFormElement(elem: any): void {
    const type = elem!.type
    const newElement: FormItem = {
      id: Date.now(),
      type,
      question: '',
      options: type === 'select' || type === 'checkbox' ? [''] : undefined,
      defaultValue: ''
    }
    formElements = [...formElements, newElement]
    console.log('formElements', formElements);
  }

  function updateFormElement(id: string, property: string, val: any) {
    const element = value.formItems.find(item => item.id === id);
    if (element) {
      element[property] = val;
      value.formItems = [...value.formItems];  // Ensure reactivity
    }
  }

  function removeFormElement
  (element: any): void {
    console.log('id', element);
    const {id} = element.detail
    formElements = formElements.filter((element) => element.id !== id)
  }

  function updateQuestion(elem: any): void {
    formElements = formElements.map((element: any) => (element.id === elem.detail.id ? { ...element, question: elem.detail.newQuestion } : element))
  }

  function updateDefaultValue(elem: any): void {
    formElements = formElements.map((element) =>
      element.id === elem.detail.id ? { ...element, defaultValue: elem.detail.newDefaultValue } : element
    )
  }

  function updateOptions(elem: any): void {
    console.log('elem', elem);
    
    formElements = formElements.map((element) => (element.id === elem.detail.id ? { ...element, options: elem.detail.newOptions } : element))
  }

  const dispatch = createEventDispatcher()

  const query = createQuery()
  
  query.query(surveys.class.FormElement, { targetClass }, async (result) => {
    const newItems: any[] = []
    console.log('result', result, 'targetClass', targetClass)

    for (const r of result) {
      newItems.push({
        id: r._id,
        label: r.label,
        type: r.type
      })
    }
    formItems = newItems
    console.log('formItems', formItems);
  })

  // async function updateElement() {
  //   const documentUpdate: DocumentUpdate<SurveyElement> = {
  //     title: value.title,
  //     color: value.color,
  //     formItems: value.formItems
  //   };
  //   const refUpdate: DocumentUpdate<any> = {
  //     title: value.title,
  //     color: value.color
  //   };

  //   console.log(documentUpdate);
    
  //   await client.update(value, documentUpdate);
  //   console.log(value);
        
  //   const references = await client.findAll(surveys.class.SurveyReference, { survey: value._id });

  //   for (const r of references) {
  //     const u = client.txFactory.createTxUpdateDoc(r._class, r.space, r._id, refUpdate);
  //     u.space = core.space.DerivedTx;
  //     await client.tx(u);
  //   }

  //   dispatch('close');
  // }
</script>

<Card
  label={surveys.string.AddSurvey}
  labelProps={{ word: keyTitle }}
  okAction={createSurveyFnc}
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
        items={formItems}
        on:selected={(event) => {
          const selectedValue = event.detail
          console.log('selectedValue', selectedValue);
          const selectedValueIndex = formItems.find((item) => item.id === selectedValue)
          if(!selectedValueIndex) return
          const formElement = {
            id: Date.now(),
            type: selectedValueIndex.type,
            question: '',
            options: selectedValueIndex.label === 'select' || selectedValueIndex.label === 'checkbox' ? [''] : undefined,
            defaultValue: ''
          }
          addFormElement(formElement)
        }}
      />
    </div>
  </svelte:fragment>

  <div class="form-elements">
      {#each formElements as element (element.id)}
        <FormElement 
          {element}
          on:removeFormElement={removeFormElement}
          on:updateQuestion={updateQuestion}
          on:updateDefaultValue={updateDefaultValue}
          on:updateOptions={updateOptions}
        />
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
</style>
