<script lang="ts">
    import LongText from './formItems/LongText.svelte'
    import Number from './formItems/Number.svelte'
    import ShortText from './formItems/ShortText.svelte'
    import Select from './formItems/Select.svelte'
    import Checkbox from './formItems/Checkbox.svelte'
    import Radio from './formItems/Radio.svelte'
    import File from './formItems/File.svelte'
    import Date from './formItems/Date.svelte'
    import Range from './formItems/Range.svelte'
    import Rating from './formItems/Rating.svelte'
    import Url from './formItems/Url.svelte'
    import Email from './formItems/Email.svelte'
    import Time from './formItems/Time.svelte'
    import Color from './formItems/Color.svelte'
    import { createEventDispatcher } from 'svelte'
  
    export let element: any
  console.log('element', element);
  
    const dispatch = createEventDispatcher()
  
    function updateQuestion(id: number, newQuestion: string) {
      dispatch('updateQuestion', { id, newQuestion })
    }
  
    function updateDefaultValue(id: number, newDefaultValue: string) {
      console.log(id, newDefaultValue);
      
      dispatch('updateDefaultValue', { id, newDefaultValue })
    }
  
    function updateOptions(id: number, newOptions: string[]) {
      dispatch('updateOptions', { id, newOptions })
    }
  
    function removeFormElement(id: number) {
      dispatch('removeFormElement', id)
    }
    console.log('element', element);
    
  </script>
  
  <div class="form-element">
    <div class="form-content">
        {#if element.type === 'number'}
        <Number
          question={element.question}
          defaultValue={element.defaultValue}
          on:changeQuestion={(event) => updateQuestion(element.id, event.detail)}
          on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
        />
        {/if}
      {#if element.type === 'long-text'}
        <LongText
          question={element.question}
          defaultValue={element.defaultValue}
          on:changeQuestion={(event) => updateQuestion(element.id, event.detail)}
          on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
        />
      {/if}
      {#if element.type === 'short-text'}
        <ShortText
          question={element.question}
          defaultValue={element.defaultValue}
          on:changeQuestion={(event) => updateQuestion(element.id, event.detail)}
          on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
        />
      {/if}
      {#if element.type === 'select'}
        <Select
          question={element.question}
          options={element.options}
          defaultValue={element.defaultValue}
          on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
          on:changeOptions={(event) => updateOptions(element.id, event.detail)}
        />
      {/if}
      {#if element.type === 'checkbox'}
        <Checkbox
          question={element.question}
          options={element.options}
          defaultValue={element.defaultValue}
          on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
          on:changeOptions={(event) => updateOptions(element.id, event.detail)}
        />
      {/if}
      {#if element.type === 'radio'}
        <Radio
          question={element.question}
          options={element.options}
          defaultValue={element.defaultValue}
          on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
          on:changeOptions={(event) => updateOptions(element.id, event.detail)}
        />
      {/if}
      {#if element.type === 'date'}
        <Date
          question={element.question}
          defaultValue={element.defaultValue}
          on:changeQuestion={(event) => updateQuestion(element.id, event.detail)}
          on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
        />
      {/if}
      {#if element.type === 'range'}
        <Range
          question={element.question}
          defaultValue={element.defaultValue}
          on:changeQuestion={(event) => updateQuestion(element.id, event.detail)}
          on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
        />
      {/if}
      {#if element.type === 'raiting'}
        <Rating
          question={element.question}
          defaultValue={element.defaultValue}
          on:changeQuestion={(event) => updateQuestion(element.id, event.detail)}
          on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
        />
      {/if}
      {#if element.type === 'url'}
          <Url  
            question={element.question}
            defaultValue={element.defaultValue}
            on:changeQuestion={(event) => updateQuestion(element.id, event.detail)}
            on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
            />
        {/if}
        {#if element.type === 'email'}
          <Email
            question={element.question}
            defaultValue={element.defaultValue}
            on:changeQuestion={(event) => updateQuestion(element.id, event.detail)}
            on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
          />
        {/if}
        {#if element.type === 'time'}
          <Time
            question={element.question}
            defaultValue={element.defaultValue}
            on:changeQuestion={(event) => updateQuestion(element.id, event.detail)}
            on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
          />
        {/if}
        {#if element.type === 'file'}
          <File
            question={element.question}
            defaultValue={element.defaultValue}
            on:changeQuestion={(event) => updateQuestion(element.id, event.detail)}
            on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
          />
        {/if}
        {#if element.type === 'color'}
            <Color 
              question={element.question}
              defaultValue={element.defaultValue}
              on:changeQuestion={(event) => updateQuestion(element.id, event.detail)}
              on:changeDefaultValue={(event) => updateDefaultValue(element.id, event.detail)}
              />
        {/if}
    </div>
    <button class="remove-button" on:click={() => removeFormElement(element)}>X</button>
  </div>
  
  <style>
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
  