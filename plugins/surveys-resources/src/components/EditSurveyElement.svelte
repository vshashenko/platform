<script lang="ts">
  import core, { Data, DocumentUpdate } from '@hcengineering/core';
  import { Card, createQuery, getClient } from '@hcengineering/presentation';
  import { FormItem, SurveyElement } from '@hcengineering/surveys';
  import {
    DropdownLabels,
    EditBox,
    IconFolder,
    eventToHTMLElement,
    getPlatformColorDef,
    showPopup,
    themeStore
  } from '@hcengineering/ui';
  import { DropdownTextItem } from '@hcengineering/ui/src/types';
  import { ColorsPopup } from '@hcengineering/view-resources';
  import { createEventDispatcher } from 'svelte';
  import surveys from '../plugin';
  import { getSurveyStyle } from '../utils';
  import LongText from './formItems/LongText.svelte';
  import ShortText from './formItems/ShortText.svelte';
  import Select from './formItems/Select.svelte';
  import Checkbox from './formItems/Checkbox.svelte';

  export let value: SurveyElement;
  export let keyTitle: string = '';

  const dispatch = createEventDispatcher();
  const client = getClient();

  console.log(value);

  const data: Omit<Data<SurveyElement>, 'targetClass'> = {
    title: value.title,
    color: value.color,
    formItems: value.formItems
  };

  async function updateElement() {
    const documentUpdate: DocumentUpdate<SurveyElement> = {
      title: data.title,
      color: data.color,
      formItems: data.formItems
    };
    const refUpdate: DocumentUpdate<any> = {
      title: data.title,
      color: data.color
    };

    console.log(documentUpdate);
    
    await client.update(value, documentUpdate);
    console.log(value);
        
    const references = await client.findAll(surveys.class.SurveyReference, { survey: value._id });

    for (const r of references) {
      const u = client.txFactory.createTxUpdateDoc(r._class, r.space, r._id, refUpdate);
      u.space = core.space.DerivedTx;
      await client.tx(u);
    }

    dispatch('close');
  }

  function addFormElement(type: any) {
    const id = Date.now()
    const newElement: FormItem = {
      id,
      type,
      question: '',
      defaultValue: '',
      options: []
    };
    data.formItems = [...data.formItems, newElement];
    console.log(data);
  }

  function updateFormElement(id: string, property: string, val: any) {
    const element = data.formItems.find(item => item.id === id);
    if (element) {
      element[property] = val;
      data.formItems = [...data.formItems];  // Ensure reactivity
    }
  }
  console.log(value);
</script>

<Card
  label={surveys.string.EditSurvey}
  labelProps={{ word: keyTitle }}
  okAction={updateElement}
  canSave={value.title.trim().length > 0}
  on:close={() => {
    dispatch('close')
  }}
  okLabel={surveys.string.SaveLabel}
  on:changeContent
>
  <div class="flex-row-center">
    <div class="flex-col">
      <div class="fs-title flex-row-center">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="mr-3">
          <div
            class="color"
            style={getSurveyStyle(getPlatformColorDef(data.color, $themeStore.dark))}
            on:click={(evt) => {
              showPopup(
                ColorsPopup,
                { selected: getPlatformColorDef(data.color, $themeStore.dark).name },
                eventToHTMLElement(evt),
                (col) => {
                  if (col != null) {
                    data.color = col
                  }
                }
              )
            }}
          />
        </div>
        <EditBox
          placeholder={surveys.string.SurveyName}
          placeholderParam={{ word: keyTitle }}
          bind:value={data.title}
        />
      </div>
    </div>
  </div>

  <div class="formElements">
    {#each data.formItems as element (element.id)}
      {#if element.type === 'long-text'}
        <LongText 
          question={element.question} 
          defaultValue={element.defaultValue}
          on:changeDefaultValue={(event) => updateFormElement(element.id, 'defaultValue', event.detail)}
          on:changeQuestion={(event) => updateFormElement(element.id, 'question', event.detail)}
        />
      {/if}
      <!-- {#if element.type === 'short-text'}
        <ShortText question={element.question} defaultValue={element.defaultValue}/>
      {/if}
      {#if element.type === 'select'}
        <Select question={element.question} options={element.options} defaultValue={element.defaultValue}/>
      {/if}
      {#if element.type === 'checkbox'}
        <Checkbox question={element.question} options={element.options} defaultValue={element.defaultValue}/>
      {/if} -->
    {/each}
  </div>
  <svelte:fragment slot="pool">
    <div class="ml-12">
      <DropdownLabels
        icon={IconFolder}
        label={surveys.string.SurveyCreateLabel}
        kind={'regular'}
        size={'large'}
        items={[
          { label: 'Long Text', id: 'long-text' },
          { label: 'Short Text', id: 'short-text' },
          { label: 'Select', id: 'select' },
          { label: 'Checkbox', id: 'checkbox' }
        ]}
        on:selected={(event) => {
          const selectedValue = event.detail;
          addFormElement(selectedValue);
        }}
      />
    </div>
  </svelte:fragment>
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
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .form-content {
    flex-grow: 1;
  }
  .remove-button {
    background: none;
    border: none;
    color: black;
    font-weight: bold;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    margin-left: 27px;
    margin-bottom: 110px;
    display: flex;
    align-items: start;
    justify-content: start;
  }
</style>
