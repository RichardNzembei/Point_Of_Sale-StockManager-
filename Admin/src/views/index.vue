```vue
<template>
  <div class="container mx-auto py-8 px-4 max-w-6xl">
    <h1 class="text-lg font-bold mb-8 text-center text-rose-500 uppercase tracking-wider">
      <span class="inline-block px-6 py-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl shadow-sm">
        Main Dashboard
      </span>
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- SALES OVERVIEW (Unchanged) -->
      <div class="bg-white p-6 rounded-2xl shadow-md border border-rose-100">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-semibold text-lg text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582  Logistics: 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
            </svg>
            Sales Overview
          </h2>
          <span class="today bg-gradient-to-r from-green-100 to-emerald-50 rounded-full px-3 py-1 text-xs font-semibold text-emerald-700 shadow-inner">
            Today's Sales
          </span>
        </div>

        <div v-if="salesStore.loading" class="space-y-4">
          <div v-for="n in 3" :key="n" class="bg-rose-50 p-4 rounded-lg animate-pulse">
            <div class="h-4 bg-rose-100 rounded-full w-3/4 mb-2"></div>
            <div class="h-3 bg-rose-100 rounded-full w-1/2"></div>
          </div>
        </div>

        <div v-else-if="salesItems.length === 0" class="text-center py-8">
          <div class="inline-block p-4 bg-rose-50 rounded-full mb-3 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-gray-500 font-medium">No sales recorded for today</p>
        </div>

        <ul v-else class="space-y-3">
          <li v-for="sale in salesItems" :key="sale.id"
            class="group bg-white p-4 rounded-xl border border-rose-100 hover:border-rose-200 hover:shadow-sm transition-all duration-200 flex justify-between items-center">
            <div>
              <div class="flex items-center mb-1">
                <span class="inline-block w-2 h-2 rounded-full bg-rose-400 mr-2"></span>
                <strong class="text-gray-700 font-medium">{{ sale.productType.toUpperCase() }}</strong>
              </div>
              <p class="text-sm text-gray-600 pl-4">
                {{ sale.productSubtype.toUpperCase() }}:
                <span class="font-bold text-emerald-600 ml-1">{{ sale.quantitySold }}</span>
              </p>
            </div>
            <div class="text-xs font-medium text-gray-400 bg-rose-50 px-2 py-1 rounded-full">
              {{ formatSaleTime(sale.saleTime) }}
            </div>
          </li>
        </ul>
      </div>

      <!-- STOCK OVERVIEW -->
      <div class="bg-white p-6 rounded-2xl shadow-md border border-rose-100">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-semibold text-lg text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
            </svg>
            Stock Overview
          </h2>
          <span class="text-xs text-rose-500 bg-rose-50 px-2 py-1 rounded-full">
            {{ Object.keys(stock).length }} Product Types
          </span>
        </div>

        <!-- Category Toggle Buttons -->
        <div class="flex space-x-2 mb-6">
          <button 
            v-for="cat in availableCategories"
            :key="cat"
            @click="toggleCategory(cat)"
            :class="{ 'bg-rose-500 text-white': activeCategory === cat, 'bg-rose-100 text-rose-700': activeCategory !== cat }"
            class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Loading state for stock -->
        <div v-if="stockStore.loading" class="space-y-4">
          <div v-for="n in 2" :key="n" class="bg-rose-50 p-4 rounded-lg animate-pulse">
            <div class="h-5 bg-rose-100 rounded-full w-1/3 mb-3"></div>
            <div class="space-y-2">
              <div v-for="m in 3" :key="m" class="flex justify-between">
                <div class="h-4 bg-rose-100 rounded-full w-1/2"></div>
                <div class="h-4 bg-rose-100 rounded-full w-1/4"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="Object.keys(filteredStock).length === 0" class="text-center py-8">
          <div class="inline-block p-4 bg-rose-50 rounded-full mb-3 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p class="text-gray-500 font-medium">No stock data available</p>
          <p class="text-sm text-rose-400 mt-1">Add products to begin tracking inventory</p>
        </div>

        <ul v-else class="space-y-4">
          <li v-for="(subtypes, productType) in filteredStock" :key="productType"
            class="bg-rose-50 p-4 rounded-xl border border-rose-100 hover:border-rose-200 transition-all duration-200">
            <!-- Product Type Header -->
            <div class="flex justify-between items-center mb-3 pb-2 border-b border-rose-200">
              <h3 class="font-semibold text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {{ productType.toUpperCase() }} ({{ categories[productType] || 'UNKNOWN' }})
              </h3>
              <button @click="deleteProductType(productType)" 
                class="text-rose-500 hover:text-rose-700 transition-colors duration-200 p-1 rounded-full hover:bg-rose-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>

            <ul class="space-y-3">
              <li v-for="(quantity, productSubtype) in subtypes" :key="productSubtype" 
                class="flex justify-between items-center bg-white p-3 rounded-lg border border-rose-100">
                <div class="flex-1">
                  <span class="font-medium text-gray-700">{{ productSubtype.toUpperCase() }}</span>
                </div>
                
                <div class="flex items-center space-x-4">
                  <!-- Stock Quantity Indicator -->
                  <div class="text-right min-w-[80px]">
                    <span v-if="quantity === 0" class="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      Out of Stock
                    </span>
                    <span v-else-if="quantity < 5" class="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      Low Stock ({{ quantity }})
                    </span>
                    <span v-else class="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      In Stock ({{ quantity }})
                    </span>
                  </div>

                  <!-- Actions Dropdown -->
                  <div class="relative">
                    <button 
                      @click.stop="toggleDropdown(productType, productSubtype)"
                      :aria-expanded="dropdownVisible[`${productType}-${productSubtype}`]"
                      :aria-controls="`dropdown-${productType}-${productSubtype}`"
                      class="p-1 rounded-full hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    
                    <transition
                      enter-active-class="transition ease-out duration-100"
                      enter-from-class="transform opacity-0 scale-95"
                      enter-to-class="transform opacity-100 scale-100"
                      leave-active-class="transition ease-in duration-75"
                      leave-from-class="transform opacity-100 scale-100"
                      leave-to-class="transform opacity-0 scale-95">
                      <div 
                        v-if="dropdownVisible[`${productType}-${productSubtype}`]"
                        :id="`dropdown-${productType}-${productSubtype}`"
                        class="dropdown-menu absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-rose-200 focus:outline-none"
                      >
                        <div class="py-1">
                          <button @click.stop="editStock(productType, productSubtype)"
                            class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 w-full text-left">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button @click.stop="deleteProductSubtype(productType, productSubtype)"
                            class="flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 w-full text-left">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </transition>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <!-- Edit Stock Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          Edit Stock: {{ editingProductType.toUpperCase() }} - {{ editingProductSubtype.toUpperCase() }}
        </h3>
        <div class="mb-4">
          <label for="newQuantity" class="block text-md font-medium text-gray-700 mb-1">
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              Quantity
            </span>
          </label>
          <input 
            v-model.number="newQuantity" 
            id="newQuantity" 
            type="number" 
            min="0" 
            required 
            class="w-full mt-1 px-4 py-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
            :disabled="stockStore.loading"
          />
        </div>
        <div class="flex justify-end space-x-2">
          <button 
            @click="saveStock" 
            class="px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors duration-200 flex items-center disabled:bg-gray-300 disabled:cursor-not-allowed"
            :disabled="stockStore.loading"
          >
            <svg v-if="stockStore.loading" class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ stockStore.loading ? 'Saving...' : 'Save' }}
          </button>
          <button 
            @click="showEditModal = false" 
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200"
            :disabled="stockStore.loading"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useStockStore } from "@/stores/stockStore";
import { useSalesStore } from "@/stores/salesStore";

const stockStore = useStockStore();
const salesStore = useSalesStore();

const stock = computed(() => stockStore.stock);
const categories = computed(() => stockStore.categories);
const availableCategories = computed(() => [...new Set(Object.values(categories.value).concat("ALL"))]);
const activeCategory = ref("ALL");
const dropdownVisible = ref({});
const showEditModal = ref(false);
const editingProductType = ref("");
const editingProductSubtype = ref("");
const newQuantity = ref(0);

const salesItems = computed(() => {
  const today = new Date().setHours(0, 0, 0, 0);
  return salesStore.sales
    .filter((sale) => {
      try {
        const saleDate = new Date(sale.saleTime).setHours(0, 0, 0, 0);
        return saleDate === today;
      } catch {
        return false;
      }
    })
    .sort((a, b) => new Date(b.saleTime) - new Date(a.saleTime));
});

const filteredStock = computed(() => {
  if (activeCategory.value === "ALL") return stock.value;
  return Object.fromEntries(
    Object.entries(stock.value).filter(([productType]) => categories.value[productType] === activeCategory.value)
  );
});

const formatSaleTime = (saleTime) => {
  const options = { hour: "2-digit", minute: "2-digit", hour12: true };
  return new Date(saleTime).toLocaleTimeString(undefined, options);
};

const toggleCategory = (category) => {
  activeCategory.value = category;
};

const editStock = (productType, productSubtype) => {
  editingProductType.value = productType;
  editingProductSubtype.value = productSubtype;
  newQuantity.value = stock.value[productType]?.[productSubtype] || 0;
  showEditModal.value = true;
};

const saveStock = async () => {
  if (newQuantity.value < 0) {
    alert("Quantity cannot be negative.");
    return;
  }
  try {
    stockStore.loading = true; // Ensure loading state is set
    await stockStore.editStock(editingProductType.value, editingProductSubtype.value, newQuantity.value);
    showEditModal.value = false;
    alert("Stock updated successfully!");
  } catch (error) {
    alert(`Failed to update stock: ${error.message || "Unknown error"}`);
  } finally {
    stockStore.loading = false; // Reset loading state
  }
};

const deleteProductSubtype = async (productType, productSubtype) => {
  const confirmDelete = confirm(
    `Are you sure you want to delete the ${productSubtype.toUpperCase()} subtype from ${productType.toUpperCase()}?`
  );
  if (confirmDelete) {
    try {
      await stockStore.deleteStock(productType, productSubtype);
      alert(`${productSubtype.toUpperCase()} deleted successfully!`);
    } catch (error) {
      alert(`Failed to delete subtype: ${error.message || "Unknown error"}`);
    }
  }
};

const deleteProductType = async (productType) => {
  const confirmDelete = confirm(
    `Are you sure you want to delete the entire ${productType.toUpperCase()} product type?`
  );
  if (confirmDelete) {
    try {
      await stockStore.deleteProductType(productType);
      alert(`${productType.toUpperCase()} product type deleted successfully!`);
    } catch (error) {
      alert(`Failed to delete product type: ${error.message || "Unknown error"}`);
    }
  }
};

const toggleDropdown = (productType, productSubtype) => {
  const key = `${productType}-${productSubtype}`;
  dropdownVisible.value[key] = !dropdownVisible.value[key];
};

const closeDropdown = (event) => {
  if (!event.target.closest(".relative")) {
    dropdownVisible.value = {};
  }
};

onMounted(() => {
  document.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
});
</script>

<style scoped>
.transition-all {
  transition-property: all;
}
ul {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 #f8fafc;
}
ul::-webkit-scrollbar {
  width: 6px;
}
ul::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 3px;
}
ul::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 3px;
}
button:focus {
  outline: 2px solid #0ea5e9;
  outline-offset: 2px;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.empty-state-icon {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
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
```