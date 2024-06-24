<script lang="ts">
    export let question: string;
    export let defaultValue: string | undefined;
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
    let updatedQuestion = question;
    let updatedDefaultValue = defaultValue;
    let editingQuestion = false;
  
    function handleInputChange() {
      dispatch('changeQuestion', updatedQuestion);
    }
  
    function handleDefaultValueChange(event: any) {
      updatedDefaultValue = event.target.value;
      dispatch('changeDefaultValue', updatedDefaultValue);
    }
  
    function toggleEditing() {
      editingQuestion = !editingQuestion;
    }
  
    function handleBlur() {
      editingQuestion = false;
    }
  </script>
  
  <div class="form-container">
    <div class="form-element">
      {#if editingQuestion}
        <input
          type="text"
          id="question-input"
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
      <label for="default-value-input">Answer</label>
      <input
        type="time"
        id="default-value-input"
        class="form-control"
        bind:value={updatedDefaultValue}
        placeholder="Default Value"
        on:input={handleDefaultValueChange}
      />
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
    }
    .form-control:focus {
      border-color: #007bff;
      outline: none;
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.25);
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
  </style>
  