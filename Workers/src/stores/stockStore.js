// src/stores/stockStore.js
import { defineStore } from "pinia";
import axios from "axios";
import { io } from "socket.io-client";
import debounce from "lodash/debounce";
import { reactive } from "vue";

const apiBaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://point-of-sale-stockmanager.onrender.com"
    : "http://localhost:5000";

export const useStockStore = defineStore("stock", {
  state: () => ({
    stock: reactive({}),
    categories: reactive({}),
    stockHistory: [],
    socket: null,
    loading: false,
    lastFetched: null,
    isConnected: false,
    pendingUpdates: new Set(),
    initialized: false,
  }),

  actions: {
    async initializeStore() {
      if (!this.initialized) {
        console.log("Initializing stock store...");
        await this.syncStockData();
        this.initSocket();
        this.initialized = true;
      }
    },

    initSocket() {
      if (!this.socket) {
        this.socket = io(apiBaseUrl, {
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });

        this.socket.on("stock-updated", (payload) => {
          console.log("Stock updated event received:", payload);
          this.updateStockFromSocket(payload);
        });

        this.socket.on("stock-deleted", ({ productType }) => {
          console.log("Stock deleted event received:", productType);
          if (this.stock[productType]) {
            delete this.stock[productType];
            delete this.categories[productType];
            this.cacheStockData({ stock: this.stock, categories: this.categories });
          }
        });

        this.socket.on("connect", () => {
          console.log("Connected to WebSocket server");
          this.isConnected = true;
          if (!this.lastFetched || Date.now() - this.lastFetched > 5 * 60 * 1000) {
            this.fetchStock(false);
          }
        });

        this.socket.on("disconnect", () => {
          console.log("Disconnected from WebSocket server");
          this.isConnected = false;
        });

        this.socket.on("connect_error", (err) => {
          console.error("WebSocket connection error:", err.message);
        });
      }
    },

    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.isConnected = false;
      }
    },

    updateStockFromSocket(payload) {
      if (!payload || !payload.productType || !payload.productSubtype) {
        console.error("Invalid stock-updated payload:", payload);
        setTimeout(() => this.fetchStock(false), 1000);
        return;
      }

      const { productType, productSubtype, newStock, category, updateId } = payload;

      if (updateId && this.pendingUpdates.has(updateId)) {
        console.log("Ignoring duplicate update:", updateId);
        this.pendingUpdates.delete(updateId);
        return;
      }

      if (!this.stock[productType]) {
        this.stock[productType] = reactive({});
      }

      if (category && !this.categories[productType]) {
        this.categories[productType] = category;
      }

      if (newStock === null) {
        delete this.stock[productType][productSubtype];
        if (Object.keys(this.stock[productType]).length === 0) {
          delete this.stock[productType];
          delete this.categories[productType];
        }
      } else {
        this.stock[productType] = {
          ...this.stock[productType],
          [productSubtype]: newStock,
        };
      }

      console.log("Updated stock state:", this.stock);
      this.cacheStockData({ stock: this.stock, categories: this.categories });
    },

    fetchStock: debounce(async function (force = false) {
      const cacheValidDuration = 5 * 60 * 1000;
      if (!force && this.lastFetched && Date.now() - this.lastFetched < cacheValidDuration) {
        console.log("Using recent stock data, skipping fetch");
        return;
      }

      try {
        this.loading = true;
        const response = await axios.get(`${apiBaseUrl}/api/stock`);
        Object.keys(this.stock).forEach((key) => delete this.stock[key]);
        Object.assign(this.stock, reactive(response.data.stock || {}));
        Object.keys(this.categories).forEach((key) => delete this.categories[key]);
        Object.assign(this.categories, reactive(response.data.categories || {}));
        this.lastFetched = Date.now();
        console.log("Fetched stock:", this.stock, "Categories:", this.categories);
        await this.cacheStockData({ stock: this.stock, categories: this.categories });
      } catch (error) {
        console.error("Error fetching stock:", error.response?.data || error.message);
      } finally {
        this.loading = false;
      }
    }, 500),

    async fetchStockHistory() {
      try {
        this.loading = true;
        const response = await axios.get(`${apiBaseUrl}/api/stock/history`);
        this.stockHistory = response.data;
        console.log("Fetched stock history:", this.stockHistory);
      } catch (error) {
        console.error("Error fetching stock history:", error.response?.data || error.message);
      } finally {
        this.loading = false;
      }
    },

    async addStock(category, productType, productSubtype, quantity) {
      try {
        this.loading = true;
        const updateId = `${productType}-${productSubtype}-${Date.now()}`;
        const stock = { productType, productSubtype, quantity, category, updateId };
        const response = await axios.post(`${apiBaseUrl}/api/stock`, stock);

        if (response.status === 201) {
          this.pendingUpdates.add(updateId);
          await this.fetchStockHistory();
        } else {
          console.error("Failed to add stock:", response.data);
          throw new Error("Failed to add stock");
        }
      } catch (error) {
        console.error("Error adding stock:", error.response?.data || error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async editStock(productType, productSubtype, quantity) {
      try {
        this.loading = true;
        const updateId = `${productType}-${productSubtype}-${Date.now()}`;
        const response = await axios.put(`${apiBaseUrl}/api/stock`, {
          productType,
          productSubtype,
          quantity,
          updateId,
        });

        if (response.status === 200) {
          this.pendingUpdates.add(updateId);
          await this.fetchStockHistory();
        } else {
          console.error("Failed to edit stock:", response.data);
          throw new Error("Failed to edit stock");
        }
      } catch (error) {
        console.error("Error editing stock:", error.response?.data || error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteStock(productType, productSubtype) {
      try {
        this.loading = true;
        const updateId = `${productType}-${productSubtype}-${Date.now()}`;
        const response = await axios.delete(`${apiBaseUrl}/api/stock`, {
          data: { productType, productSubtype, updateId },
        });

        if (response.status === 200) {
          this.pendingUpdates.add(updateId);
          await this.fetchStockHistory();
        } else {
          console.error("Failed to delete stock:", response.data);
          throw new Error("Failed to delete stock");
        }
      } catch (error) {
        console.error("Error deleting stock:", error.response?.data || error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteProductType(productType) {
      try {
        this.loading = true;
        await axios.delete(`${apiBaseUrl}/api/stock/${productType}`);
        console.log(`${productType} deleted successfully`);
        await this.fetchStockHistory();
      } catch (error) {
        console.error("Error deleting product type:", error.response?.data || error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteProductSubtype(productType, productSubtype) {
      try {
        this.loading = true;
        const updateId = `${productType}-${productSubtype}-${Date.now()}`;
        await axios.delete(`${apiBaseUrl}/api/stock/${productType}/${productSubtype}`, {
          data: { updateId },
        });
        this.pendingUpdates.add(updateId);
        await this.fetchStockHistory();
      } catch (error) {
        console.error("Error deleting product subtype:", error.response?.data || error.message);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cacheStockData(data) {
      if (!("caches" in window)) {
        console.warn("Cache API not supported, skipping cache");
        return;
      }
      try {
        const cache = await caches.open("stock-cache");
        const cachedResponse = new Response(JSON.stringify(data));
        await cache.put("/api/stock", cachedResponse);
        console.log("Stock and categories data cached successfully");
      } catch (error) {
        console.error("Error caching stock data:", error);
      }
    },

    async syncStockData() {
      try {
        // Check for Cache API support
        if ("caches" in window) {
          try {
            const cache = await caches.open("stock-cache");
            const cachedResponse = await cache.match("/api/stock");
            if (cachedResponse) {
              const cachedData = await cachedResponse.json();
              Object.assign(this.stock, reactive(cachedData.stock || {}));
              Object.assign(this.categories, reactive(cachedData.categories || {}));
              this.lastFetched = Date.now();
              console.log("Using cached stock data:", cachedData);
            } else {
              console.log("No cached stock data available, fetching...");
              await this.fetchStock(false);
            }
          } catch (cacheError) {
            console.error("Cache API error:", cacheError);
            await this.fetchStock(false);
          }
        } else {
          console.warn("Cache API not supported, fetching stock...");
          await this.fetchStock(false);
        }

        // Check for Service Worker and sync support
        if ("serviceWorker" in navigator && "SyncManager" in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register("sync-stock");
            console.log("Stock data sync registered in background");
          } catch (syncError) {
            console.error("Service Worker sync error:", syncError);
            // Continue without sync, as it's not critical
          }
        } else {
          console.warn("Service Worker or Background Sync not supported, skipping sync registration");
        }
      } catch (error) {
        console.error("Error syncing stock data:", error);
        await this.fetchStock(false);
      }
    },

    async handleBackgroundSync(event) {
      if (event.tag === "sync-stock") {
        console.log("Background sync triggered for stock data");
        await this.fetchStock(false);
      }
    },
  },
});