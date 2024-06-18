<script lang="ts">
  import { Button, IconAdd } from '@hcengineering/ui'
  export let question: string
  export let options: string[] 
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
  let updatedQuestion = question
  let updatedOptions = options
  let newOption = ''
  let editingQuestion = false

  function addOption() {
    if (newOption.trim() !== '') {
      updatedOptions = [...updatedOptions, newOption]
      dispatch('changeOptions', updatedOptions)
      newOption = ''
    }
  }

  function handleInputChange() {
    dispatch('changeQuestion', updatedQuestion)
  }

  function toggleEditing() {
    editingQuestion = !editingQuestion
  }

  function handleBlur() {
    editingQuestion = false
  }
</script>

<div class="form-container">
  <div class="form-element">
    {#if editingQuestion}
      <input
        type="text"
        class="form-control"
        bind:value={updatedQuestion}
        on:input={handleInputChange}
        on:blur={handleBlur}
        placeholder="Enter question"
      />
    {:else}
      <div class="editable-text" on:click={toggleEditing}>
        {updatedQuestion || 'Please enter a question'}
      </div>
    {/if}
  </div>

  <div class="form-element">
    <label for="new-option-input">New Option</label>
    <div class="input-group">
      <input
        type="text"
        id="new-option-input"
        class="form-control"
        bind:value={newOption}
        placeholder="Enter new option"
      />
      <Button icon={IconAdd} kind={'primary'} on:click={addOption} />

    </div>
  </div>

  <div class="form-element">
    <label for="select-options">Select an option</label>
    <select id="select-options" class="form-control">
      <option>Select an option</option>
      {#each updatedOptions as option}
        {#if option.trim() !== ''}
          <option>{option}</option>
        {/if}
      {/each}
    </select>
  </div>
</div>

<style>
  .form-container {
    padding: 2rem;
    background: #fff;
    border: 1px solid #ccc;
    border-width: 1px 0 0 0;
  }
  .form-element {
    margin-bottom: 1rem;
  }
  .form-element label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  .form-control {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    margin-right: 1rem;
  }
  .editable-text {
    padding: 0.5rem;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  .editable-text:hover {
    background-color: #f0f0f0;
  }
  .input-group {
    display: flex;
    align-items: center;
  }
  .add-btn {
    display: inline-block;
    padding: 0.5rem 1rem;
    font-size: 1.5rem;
    line-height: 1;
    color: #111111;
    border: none;
    cursor: pointer;
    text-align: center;
    margin-left: 0.5rem;
  }
</style>
