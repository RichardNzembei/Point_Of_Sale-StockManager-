const express = require("express");
const router = express.Router();
const firestore = require("../firebaseConfig");
const { FieldValue } = require("firebase-admin").firestore;
const admin = require("firebase-admin");
const cron = require("node-cron");

router.post("/stock", async (req, res) => {
  const { productType, productSubtype, quantity, category } = req.body;

  if (!productType || !productSubtype || typeof quantity !== "number") {
    return res.status(400).json({ error: "Invalid data: productType, productSubtype, and quantity are required" });
  }

  try {
    // Update stock
    const stockRef = firestore.collection("stock").doc(productType);
    const stockDoc = await stockRef.get();
    const productData = stockDoc.exists ? stockDoc.data() : {};

    productData[productSubtype] = (productData[productSubtype] || 0) + quantity;

    await stockRef.set(productData, { merge: true });

    // Update categories if provided
    if (category) {
      const categoryRef = firestore.collection("categories").doc(productType);
      await categoryRef.set({ category }, { merge: true });
    }

    // Log stock history
    const historyRef = firestore.collection("stock_history").doc();
    const historyData = {
      productType,
      productSubtype,
      quantity,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      action: "added",
    };
    await historyRef.set(historyData);

    // Emit WebSocket event
    req.io.emit("stock-updated", {
      productType,
      productSubtype,
      newStock: productData[productSubtype],
      category: category || (stockDoc.exists ? (await firestore.collection("categories").doc(productType).get()).data()?.category : null),
    });

    res.status(201).json({
      message: "Stock updated successfully",
      productType,
      productSubtype,
      quantity,
      category,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/stock", async (req, res) => {
  const { productType, productSubtype, quantity } = req.body;

  if (!productType || !productSubtype || typeof quantity !== "number") {
    return res.status(400).json({ error: "Invalid data: productType, productSubtype, and quantity are required" });
  }

  try {
    const stockRef = firestore.collection("stock").doc(productType);
    const stockDoc = await stockRef.get();

    if (!stockDoc.exists) {
      return res.status(404).json({ error: "Stock type not found" });
    }

    const productData = stockDoc.data();

    if (!(productSubtype in productData)) {
      return res.status(404).json({ error: "Stock subtype not found" });
    }

    const oldQuantity = productData[productSubtype];
    productData[productSubtype] = quantity;

    await stockRef.set(productData, { merge: true });

    // Log stock history
    const historyRef = firestore.collection("stock_history").doc();
    const historyData = {
      productType,
      productSubtype,
      oldQuantity,
      newQuantity: quantity,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      action: "edited",
    };
    await historyRef.set(historyData);

    // Get category for WebSocket event
    const categoryDoc = await firestore.collection("categories").doc(productType).get();
    const category = categoryDoc.exists ? categoryDoc.data().category : null;

    // Emit WebSocket event
    req.io.emit("stock-updated", {
      productType,
      productSubtype,
      newStock: productData[productSubtype],
      category,
    });

    res.status(200).json({
      message: "Stock updated successfully",
      productType,
      productSubtype,
      quantity,
      category,
    });
  } catch (error) {
    console.error("Error editing stock:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/stock", async (req, res) => {
  const { productType, productSubtype } = req.body;

  if (!productType || !productSubtype) {
    return res.status(400).json({ error: "Invalid data: productType and productSubtype are required" });
  }

  try {
    const stockRef = firestore.collection("stock").doc(productType);
    const stockDoc = await stockRef.get();

    if (!stockDoc.exists) {
      return res.status(404).json({ error: "Stock type not found" });
    }

    const productData = stockDoc.data();

    if (!(productSubtype in productData)) {
      return res.status(404).json({ error: "Stock subtype not found" });
    }

    console.log(`Deleting subtype: ${productSubtype} from product type: ${productType}`);

    await stockRef.update({ [productSubtype]: FieldValue.delete() });

    // Log stock history
    const historyRef = firestore.collection("stock_history").doc();
    const historyData = {
      productType,
      productSubtype,
      quantity: productData[productSubtype],
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      action: "deleted",
    };
    await historyRef.set(historyData);

    // Get category for WebSocket event
    const categoryDoc = await firestore.collection("categories").doc(productType).get();
    const category = categoryDoc.exists ? categoryDoc.data().category : null;

    // Emit WebSocket event
    req.io.emit("stock-updated", {
      productType,
      productSubtype,
      newStock: null,
      category,
    });

    // Delete productType from stock if empty
    const updatedStockDoc = await stockRef.get();
    if (updatedStockDoc.exists && Object.keys(updatedStockDoc.data()).length === 0) {
      await stockRef.delete();
      await firestore.collection("categories").doc(productType).delete();
      req.io.emit("stock-deleted", { productType });
    }

    res.status(200).json({
      message: "Stock subtype deleted successfully",
      productType,
      productSubtype,
    });
  } catch (error) {
    console.error("Error deleting stock:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/stock/:productType", async (req, res) => {
  const { productType } = req.params;

  if (!productType) {
    return res.status(400).json({ error: "Invalid product type" });
  }

  try {
    const stockRef = firestore.collection("stock").doc(productType);
    const stockDoc = await stockRef.get();

    if (!stockDoc.exists) {
      return res.status(404).json({ error: "Stock type not found" });
    }

    // Log stock history for each subtype
    const productData = stockDoc.data();
    for (const productSubtype in productData) {
      const historyRef = firestore.collection("stock_history").doc();
      await historyRef.set({
        productType,
        productSubtype,
        quantity: productData[productSubtype],
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        action: "deleted",
      });
    }

    await stockRef.delete();
    await firestore.collection("categories").doc(productType).delete();

    req.io.emit("stock-deleted", { productType });

    res.status(200).json({ message: "Product type deleted successfully", productType });
  } catch (error) {
    console.error("Error deleting product type:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/stock", async (req, res) => {
  try {
    // Fetch stock
    const stockSnapshot = await firestore.collection("stock").get();
    const stock = {};
    stockSnapshot.forEach((doc) => {
      stock[doc.id] = doc.data();
    });

    // Fetch categories
    const categorySnapshot = await firestore.collection("categories").get();
    const categories = {};
    categorySnapshot.forEach((doc) => {
      categories[doc.id] = doc.data().category;
    });

    res.status(200).json({ stock, categories });
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/stock/history", async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    console.log("Query range:", startOfDay.toISOString(), endOfDay.toISOString());

    const snapshot = await firestore
      .collection("stock_history")
      .where("timestamp", ">=", startOfDay)
      .where("timestamp", "<=", endOfDay)
      .orderBy("timestamp", "desc")
      .get();

    const history = snapshot.docs.map((doc) => {
      const data = doc.data();
      if (data.timestamp instanceof admin.firestore.Timestamp) {
        data.timestamp = data.timestamp.toDate().toISOString();
      }
      return { id: doc.id, ...data };
    });

    console.log("Fetched stock history for today:", history);
    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching stock history:", error);
    res.status(500).json({ error: "Server error during stock history fetching" });
  }
});

module.exports = router;