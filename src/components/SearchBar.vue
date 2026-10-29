<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'What do you want to play?'
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const inputRef = ref(null)
const internalValue = ref(props.modelValue)
let debounceTimer = null

// Keep internal value in sync with prop updates
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== internalValue.value) {
      internalValue.value = newVal
    }
  }
)

// Handle typing with 400ms debounce
function onInput(event) {
  const value = event.target.value
  internalValue.value = value
  emit('update:modelValue', value)

  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    emit('search', value)
  }, 400)
}

// Clear search input immediately
function clearInput() {
  internalValue.value = ''
  emit('update:modelValue', '')
  emit('search', '')
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  inputRef.value?.focus()
}

// Focus input publicly for external triggers (e.g. sidebar search click)
function focusInput() {
  inputRef.value?.focus()
}

defineExpose({
  focusInput
})

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<template>
  <div class="search-bar">
    <!-- Search Icon -->
    <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M10.533 1.278.472 11.34a.75.75 0 0 0 1.06 1.06l10.062-10.06a.75.75 0 0 0-1.06-1.062zm-3.033 9a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-1.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z" />
    </svg>

    <!-- Search Text Input -->
    <input
      ref="inputRef"
      type="text"
      :value="internalValue"
      :placeholder="placeholder"
      aria-label="Search tracks"
      class="search-input"
      @input="onInput"
    />

    <!-- Clear Button -->
    <button
      v-if="internalValue"
      type="button"
      class="clear-button"
      title="Clear search"
      @click="clearInput"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 460px;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: var(--color-text-subdued);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 48px;
  padding: 0 40px 0 44px;
  background-color: var(--color-bg-input);
  color: var(--color-text-base);
  border: 1px solid transparent;
  border-radius: 500px;
  font-size: 0.95rem;
  outline: none;
  transition: all var(--transition-fast);
}

.search-input::placeholder {
  color: var(--color-text-subdued);
}

.search-input:hover {
  background-color: #2a2a2a;
  border-color: #383838;
}

.search-input:focus {
  background-color: #2a2a2a;
  border-color: #ffffff;
  box-shadow: 0 0 0 1px #ffffff;
}

.clear-button {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: var(--color-text-subdued);
  background: transparent;
  transition: color var(--transition-fast);
}

.clear-button:hover {
  color: var(--color-text-base);
}
</style>
