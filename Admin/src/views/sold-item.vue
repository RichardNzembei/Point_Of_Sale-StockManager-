<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-lg font-semibold mb-6 text-center text-rose-600">Sell Product</h1>
    <div class="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto border border-gray-200">
      <div v-if="stockStore.loading || Object.keys(stockStore.stock).length === 0">
        <div class="text-center py-8">
          <div class="inline-block p-4 bg-rose-50 rounded-full mb-3 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-rose-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 0116 0 8 8 0 01-16 0zm8-8a8 8 0 00-8 8" />
            </svg>
          </div>
          <p class="text-gray-600 font-medium">{{ stockStore.loading ? 'Loading stock data...' : 'No stock data available' }}</p>
          <p v-if="!stockStore.loading" class="text-sm text-rose-400 mt-1">Add products to begin selling</p>
        </div>
      </div>

      <div v-else>
        <form @submit.prevent="sellProduct" aria-label="Sell Product Form" class="space-y-6">
          <!-- Category -->
          <div>
            <label for="category" class="block text-sm font-medium text-gray-800">
              Category
              <span class="text-xs text-gray-500">(Filter products by category)</span>
            </label>
            <select
              v-model="activeCategory"
              id="category"
              class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rose-400 focus:border-rose-400 text-gray-700 bg-white"
              @change="resetSelections"
            >
              <option value="ALL">All Categories</option>
              <option v-for="category in availableCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <!-- Product Type -->
          <div>
            <label for="productType" class="block text-sm font-medium text-gray-800">Product Type</label>
            <select
              v-model="selectedProductType"
              id="productType"
              class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rose-400 focus:border-rose-400 text-gray-700 bg-white"
              @change="resetProductSubtype"
            >
              <option value="" disabled>Select Product Type</option>
              <option v-for="type in Object.keys(filteredStock)" :key="type" :value="type">
                {{ type }} ({{ stockStore.categories[type] || 'UNKNOWN' }})
              </option>
            </select>
          </div>

          <!-- Product Subtype -->
          <div v-if="selectedProductType">
            <label for="productSubtype" class="block text-sm font-medium text-gray-800">Product Subtype</label>
            <select
              v-model="selectedProductSubtype"
              id="productSubtype"
              class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rose-400 focus:border-rose-400 text-gray-700 bg-white"
              @change="resetQuantity"
            >
              <option value="" disabled>Select Product Subtype</option>
              <option
                v-for="(quantity, subtype) in filteredStock[selectedProductType]"
                :key="subtype"
                :value="subtype"
              >
                {{ subtype }} (Available: {{ quantity }})
              </option>
            </select>
          </div>

          <!-- Quantity -->
          <div v-if="selectedProductSubtype">
            <label for="quantity" class="block text-sm font-medium text-gray-800">Quantity</label>
            <input
              v-model.number="quantityToSell"
              id="quantity"
              type="number"
              min="1"
              :max="filteredStock[selectedProductType]?.[selectedProductSubtype] || 0"
              @input="validateQuantity"
              class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rose-400 focus:border-rose-400 text-gray-700 bg-white"
            />
            <p class="text-sm text-gray-500 mt-1">
              Available: {{ filteredStock[selectedProductType]?.[selectedProductSubtype] || 0 }}
            </p>
          </div>

          <!-- Error Message -->
          <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full py-2 px-4 bg-rose-500 text-white font-medium rounded-md hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            :disabled="loading || !selectedProductType || !selectedProductSubtype || quantityToSell <= 0"
          >
            {{ loading ? "Processing..." : "Sell Product" }}
          </button>
        </form>

        <!-- Success Message -->
        <div v-if="showSuccess" class="mt-4 text-green-600 text-center font-medium">
          Product sold successfully and sale logged!
        </div>
      </div>

      <PopupNotification ref="popupNotification" />
    </div>
  </div>
</template>

<!-- src/views/SellProduct.vue -->
<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import { useSalesStore } from "@/stores/salesStore";
import { useStockStore } from "@/stores/stockStore";
import PopupNotification from "@/components/PopupNotification.vue";

const salesStore = useSalesStore();
const stockStore = useStockStore();

const activeCategory = ref("ALL");
const selectedProductType = ref("");
const selectedProductSubtype = ref("");
const quantityToSell = ref(0);
const errorMessage = ref("");
const loading = ref(false);
const showSuccess = ref(false);

const popupNotification = ref(null);

const availableCategories = computed(() =>
  [...new Set(Object.values(stockStore.categories))].sort()
);

const filteredStock = computed(() => {
  if (activeCategory.value === "ALL") return stockStore.stock;
  return Object.fromEntries(
    Object.entries(stockStore.stock).filter(
      ([productType]) => stockStore.categories[productType] === activeCategory.value
    )
  );
});

onMounted(() => {
  salesStore.initSocket();
  stockStore.socket?.on("stock-updated", () => {
    console.log("Stock updated in real time");
  });
  salesStore.socket?.on("sale-updated", async () => {
    console.log("Sales updated in real time");
  });
});

onUnmounted(() => {
  stockStore.disconnectSocket();
  salesStore.disconnectSocket();
});

const resetSelections = () => {
  selectedProductType.value = "";
  selectedProductSubtype.value = "";
  quantityToSell.value = 0;
  errorMessage.value = "";
};

const resetProductSubtype = () => {
  selectedProductSubtype.value = "";
  quantityToSell.value = 0;
  errorMessage.value = "";
};

const resetQuantity = () => {
  quantityToSell.value = 0;
  errorMessage.value = "";
};

const validateQuantity = () => {
  const maxStock = filteredStock.value[selectedProductType.value]?.[selectedProductSubtype.value] || 0;
  if (quantityToSell.value < 1) quantityToSell.value = 1;
  if (quantityToSell.value > maxStock) quantityToSell.value = maxStock;
};

const sellProduct = async () => {
  errorMessage.value = "";
  showSuccess.value = false;
  loading.value = true;

  try {
    if (!selectedProductType.value || !selectedProductSubtype.value || quantityToSell.value <= 0) {
      throw new Error("Please select a valid product, subtype, and quantity.");
    }

    const availableStock = filteredStock.value[selectedProductType.value]?.[selectedProductSubtype.value];
    if (!availableStock || quantityToSell.value > availableStock) {
      throw new Error("Stock quantity is not sufficient.");
    }

    const productType = selectedProductType.value;
    const productSubtype = selectedProductSubtype.value;
    const quantity = quantityToSell.value;

    await salesStore.addSaleToBackend(productType, productSubtype, quantity);

    activeCategory.value = "ALL";
    selectedProductType.value = "";
    selectedProductSubtype.value = "";
    quantityToSell.value = 0;

    nextTick(() => {
      if (popupNotification.value) {
        popupNotification.value.show(
          `Sold ${quantity} pieces of ${productType.toUpperCase()}`,
          `You have successfully sold ${quantity} units of ${productSubtype.toUpperCase()}.`
        );
      }
    });

    showSuccess.value = true;
  } catch (error) {
    errorMessage.value = error.message || "An unexpected error occurred.";
  } finally {
    loading.value = false;
  }
};
</script>

<!-- Template remains unchanged -->

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>