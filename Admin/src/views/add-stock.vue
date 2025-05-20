<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-xl font-bold mb-8 text-center text-rose-500">
      <span class="inline-block px-6 py-2 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl shadow-inner">
        Add Stock
      </span>
    </h1>

    <div class="bg-white p-8 rounded-2xl shadow-md border border-rose-100 max-w-3xl mx-auto">
      <form @submit.prevent="addStock" class="space-y-6">
        <!-- Category Dropdown -->
        <div>
          <label for="category" class="block text-md font-medium text-gray-700 mb-1">
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 3a1 1 0 00-1 1v1h12V4a1 1 0 00-1-1H5zM4 7v8a2 2 0 002 2h8a2 2 0 002-2V7H4zm3 2h2v4H7V9zm4 0h2v4h-2V9z" clip-rule="evenodd" />
              </svg>
              Category
            </span>
          </label>
          <select
            v-model="category"
            id="category"
            class="w-full mt-1 px-4 py-3 border border-rose-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
            required
          >
            <option disabled value="">Select category</option>
            <option value="WIGS">WIGS</option>
            <option value="WEAVES">WEAVES</option>
            <option value="CREAMS">CREAMS</option>
          </select>
        </div>

        <!-- Product Type Field -->
        <div>
          <label for="productType" class="block text-md font-medium text-gray-700 mb-1">
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
              </svg>
              Product Type
            </span>
          </label>
          <input 
            v-model="productType" 
            id="productType" 
            placeholder="e.g. HUMAN HAIR" 
            class="w-full mt-1 px-4 py-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent placeholder-gray-400 uppercase"
          />
        </div>

        <!-- Product Subtype Field -->
        <div>
          <label for="productSubtype" class="block text-md font-medium text-gray-700 mb-1">
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              Product Subtype
            </span>
          </label>
          <input 
            v-model="productSubtype" 
            id="productSubtype" 
            placeholder="e.g. LONG, SHORT" 
            class="w-full mt-1 px-4 py-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent placeholder-gray-400 uppercase"
          />
        </div>

        <!-- Quantity Field -->
        <div>
          <label for="quantity" class="block text-md font-medium text-gray-700 mb-1">
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              Quantity
            </span>
          </label>
          <input 
            v-model="quantity" 
            id="quantity" 
            type="number" 
            min="1" 
            required 
            placeholder="Enter quantity" 
            class="w-full mt-1 px-4 py-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent placeholder-gray-400"
          />
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full px-6 py-3 bg-gradient-to-r from-rose-400 to-pink-400 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:from-rose-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding...
          </span>
          <span v-else class="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
            </svg>
            Add Stock
          </span>
        </button>
      </form>

      <!-- Loading Overlay -->
      <div v-if="loading" class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
        <div class="w-16 h-16 border-4 border-rose-300 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
    </div>

    <PopupNotification ref="popupNotification" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStockStore } from '@/stores/stockStore';
import PopupNotification from '@/components/PopupNotification.vue';

const stockStore = useStockStore();

const category = ref('');
const productType = ref('');
const productSubtype = ref('');
const quantity = ref(1);
const loading = ref(false);
const popupNotification = ref(null);

const sanitizeInput = (str) => {
  return str.trim().replace(/\s+/g, ' ').toUpperCase();
};

const validateStockInput = (category, productType, productSubtype, quantity) => {
  if (!category || !productType || !productSubtype || quantity <= 0) {
    return 'Please provide valid inputs for all fields.';
  }
  return null;
};

const addStock = async () => {
  productType.value = sanitizeInput(productType.value);
  productSubtype.value = sanitizeInput(productSubtype.value);

  const error = validateStockInput(category.value, productType.value, productSubtype.value, quantity.value);
  if (error) {
    popupNotification.value.show('Validation Error', error);
    return;
  }

  loading.value = true;

  try {
    await stockStore.addStock(category.value, productType.value, productSubtype.value, quantity.value);
    category.value = '';
    productType.value = '';
    productSubtype.value = '';
    quantity.value = 1;
    popupNotification.value.show('Success!', 'Stock added successfully.');
  } catch (e) {
    popupNotification.value.show('Error!', 'Failed to add stock. Please try again.');
  } finally {
    loading.value = false;
  }
};
</script>