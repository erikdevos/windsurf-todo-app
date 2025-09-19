<template>
  <div class="date-picker d-flex gap-2 align-items-center">
    <!-- Day Field -->
    <div class="day-field">
      <input
        v-model.number="day"
        type="number"
        min="1"
        :max="maxDaysInMonth"
        class="form-control form-control-sm text-center"
        style="width: 60px;"
        placeholder="Day"
        @input="validateDayInput"
      />
    </div>
    
    <!-- Month Field -->
    <div class="month-field">
      <select
        v-model="month"
        class="form-select form-select-sm"
        style="width: 130px;"
        @change="updateDate"
      >
        <option value="">Month</option>
        <option v-for="(monthName, index) in months" :key="index" :value="index + 1">
          {{ monthName }}
        </option>
      </select>
    </div>
    
    <!-- Year Field -->
    <div class="year-field">
      <input
        v-model.number="year"
        type="number"
        :min="currentYear"
        :max="currentYear + 10"
        class="form-control form-control-sm text-center"
        style="width: 80px;"
        placeholder="Year"
        @input="updateDate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: Date | null
  disabled?: boolean
}

interface Emits {
  'update:modelValue': [value: Date | null]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false
})

const emit = defineEmits<Emits>()

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const currentYear = new Date().getFullYear()

// Reactive date components
const day = ref<number | ''>('')
const month = ref<number | ''>('')
const year = ref<number | ''>('')

// Computed property for maximum days in the selected month
const maxDaysInMonth = computed(() => {
  if (!month.value || !year.value) {
    return 31 // Default to 31 if month/year not selected
  }
  // Get the last day of the month (0 means last day of previous month)
  return new Date(year.value, month.value, 0).getDate()
})

// Initialize with current date when component mounts
onMounted(() => {
  if (props.modelValue) {
    setDateFromValue(props.modelValue)
  } else {
    // Set to today's date as default
    const today = new Date()
    day.value = today.getDate()
    month.value = today.getMonth() + 1
    year.value = today.getFullYear()
    updateDate()
  }
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    setDateFromValue(newValue)
  } else {
    day.value = ''
    month.value = ''
    year.value = ''
  }
})

const setDateFromValue = (date: Date) => {
  day.value = date.getDate()
  month.value = date.getMonth() + 1
  year.value = date.getFullYear()
}

const validateDayInput = () => {
  // Validate day immediately when typing
  if (day.value && month.value && year.value) {
    const maxDays = maxDaysInMonth.value
    if (day.value > maxDays) {
      day.value = maxDays
    } else if (day.value < 1) {
      day.value = 1
    }
  }
  updateDate()
}

const updateDate = () => {
  if (day.value && month.value && year.value) {
    // Validate the date
    const date = new Date(year.value, month.value - 1, day.value)
    
    // Check if the date is valid (handles cases like Feb 30)
    if (date.getDate() === day.value && 
        date.getMonth() === month.value - 1 && 
        date.getFullYear() === year.value) {
      emit('update:modelValue', date)
    } else {
      // Invalid date, emit null
      emit('update:modelValue', null)
    }
  } else {
    // Incomplete date
    emit('update:modelValue', null)
  }
}

// Watch for changes in maxDaysInMonth to adjust day if needed
watch(maxDaysInMonth, (newMaxDays) => {
  if (day.value && day.value > newMaxDays) {
    day.value = newMaxDays
    updateDate()
  }
})

// Validate day input to prevent invalid values
watch(day, (newDay) => {
  if (newDay && month.value && year.value) {
    const maxDays = maxDaysInMonth.value
    if (newDay > maxDays) {
      // Automatically adjust to max valid day
      day.value = maxDays
    } else if (newDay < 1) {
      // Ensure minimum day is 1
      day.value = 1
    }
  }
})
</script>

<style scoped>
.date-picker input::-webkit-outer-spin-button,
.date-picker input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.date-picker input[type=number] {
  -moz-appearance: textfield;
}

.date-picker .form-control:focus,
.date-picker .form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
</style>
