<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog as="div" @close="$emit('update:modelValue', false)" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle as="h3" class="text-xl font-semibold leading-6 text-gray-900 mb-4">
                {{ title || 'Welcome to Planning Poker!' }}
              </DialogTitle>
              
              <div class="mt-2">
                <p class="text-sm text-gray-500 mb-4">
                  {{ description || 'Please enter your name to join the game.' }}
                </p>
                <input
                  type="text"
                  v-model="playerName"
                  placeholder="Enter your name"
                  class="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  @keyup.enter="handleSubmit"
                />
              </div>

              <div class="mt-6 flex justify-end">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  :disabled="!isValid"
                  @click="handleSubmit"
                >
                  {{ submitText || 'Join Game' }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue';

const props = defineProps<{
  modelValue: boolean;
  title?: string;
  description?: string;
  submitText?: string;
  initialValue?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', name: string): void;
}>();

const playerName = ref(props.initialValue || '');

const isValid = computed(() => {
  return playerName.value.trim().length >= 2;
});

watch(() => props.modelValue, (newValue) => {
  if (newValue && props.initialValue) {
    playerName.value = props.initialValue;
  }
});

const handleSubmit = () => {
  if (isValid.value) {
    emit('submit', playerName.value.trim());
    emit('update:modelValue', false);
    playerName.value = '';
  }
};
</script> 