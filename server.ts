import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "data", "orders.json");
const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

// Ensure data folder and file exists
function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

// Helper to read orders
function readOrders() {
  ensureDataFile();
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading or parsing data file:", err);
    return [];
  }
}

// Helper to write orders
function writeOrders(orders: any[]) {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing data file:", err);
  }
}

// Helper to ensure settings file exists
function ensureSettingsFile() {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
      companyName: "FabricFlow Studios",
      companyAddress: "12 Textile Industrial Park, Sector 4\nLahore, Punjab - 54000\nPakistan",
      companyEmail: "billing@fabricflow.com",
      companyPhone: "+92 42 111 222 333",
      companyWebsite: "www.fabricflow.com"
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), "utf8");
  }
}

// Helper to read settings
function readSettings() {
  ensureSettingsFile();
  try {
    const data = fs.readFileSync(SETTINGS_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading settings file:", err);
    return {
      companyName: "FabricFlow Studios",
      companyAddress: "12 Textile Industrial Park, Sector 4\nLahore, Punjab - 54000\nPakistan",
      companyEmail: "billing@fabricflow.com",
      companyPhone: "+92 42 111 222 333",
      companyWebsite: "www.fabricflow.com"
    };
  }
}

// Helper to write settings
function writeSettings(settings: any) {
  ensureSettingsFile();
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing settings file:", err);
  }
}

app.use(express.json());

// API routes FIRST
app.get("/api/settings", (req, res) => {
  const settings = readSettings();
  res.json(settings);
});

app.post("/api/settings", (req, res) => {
  try {
    const newSettings = req.body;
    writeSettings(newSettings);
    res.json(newSettings);
  } catch (e) {
    res.status(500).json({ error: "Failed to save company settings" });
  }
});

app.post("/api/orders/bulk-import", (req, res) => {
  try {
    const orders = readOrders();
    const newItems = req.body;
    if (!Array.isArray(newItems)) {
      return res.status(400).json({ error: "Invalid data format, expected array" });
    }

    let maxId = orders.reduce((max: number, o: any) => (o.id > max ? o.id : max), 0);
    const added: any[] = [];

    for (const item of newItems) {
      maxId += 1;
      const count = orders.length + added.length + 1;
      const year = new Date().getFullYear();
      const invoiceNum = item.invoiceNumber || `INV-${year}-${String(count).padStart(3, "0")}`;

      const orderToSave = {
        id: maxId,
        client: item.client || "Unnamed Client",
        desc: item.desc || "",
        length: Number(item.length) || 0,
        width: item.width !== undefined ? Number(item.width) : 1,
        fileSize: item.fileSize !== undefined ? String(item.fileSize) : "",
        sell: Number(item.sell) || 0,
        printRate: item.printRate !== undefined ? Number(item.printRate) : 0,
        services: {
          fabric: item.services?.fabric !== undefined ? !!item.services.fabric : true,
          design: item.services?.design !== undefined ? !!item.services.design : false,
          print: item.services?.print !== undefined ? !!item.services.print : false,
        },
        status: item.status || "Pending",
        createdAt: item.createdAt || new Date().toISOString(),
        invoiceNumber: invoiceNum,
      };
      added.push(orderToSave);
    }

    const updated = [...orders, ...added];
    writeOrders(updated);
    res.json(updated);
  } catch (err) {
    console.error("Bulk import failed:", err);
    res.status(500).json({ error: "Failed to perform bulk import" });
  }
});

app.get("/api/orders", (req, res) => {
  const orders = readOrders();
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  try {
    const orders = readOrders();
    const newOrder = req.body;

    // Generate unique ID and invoice number
    const maxId = orders.reduce((max: number, o: any) => (o.id > max ? o.id : max), 0);
    const orderId = maxId + 1;
    
    // Auto incrementing invoice number
    const year = new Date().getFullYear();
    const count = orders.length + 1;
    const invoiceNum = `INV-${year}-${String(count).padStart(3, "0")}`;

    const orderToSave = {
      id: orderId,
      client: newOrder.client || "Unnamed Client",
      desc: newOrder.desc || "",
      length: Number(newOrder.length) || 0,
      width: newOrder.width !== undefined ? Number(newOrder.width) : 1,
      fileSize: newOrder.fileSize !== undefined ? String(newOrder.fileSize) : "",
      sell: Number(newOrder.sell) || 0,
      printRate: newOrder.printRate !== undefined ? Number(newOrder.printRate) : 0,
      services: {
        fabric: !!newOrder.services?.fabric,
        design: !!newOrder.services?.design,
        print: !!newOrder.services?.print,
      },
      status: newOrder.status || "Pending",
      createdAt: new Date().toISOString(),
      invoiceNumber: invoiceNum,
    };

    orders.push(orderToSave);
    writeOrders(orders);
    res.status(210).json(orderToSave);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.put("/api/orders/:id", (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const updatedFields = req.body;
    let orders = readOrders();
    const index = orders.findIndex((o: any) => o.id === orderId);

    if (index === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    const o = orders[index];
    orders[index] = {
      ...o,
      ...updatedFields,
      length: updatedFields.length !== undefined ? Number(updatedFields.length) : o.length,
      width: updatedFields.width !== undefined ? Number(updatedFields.width) : (o.width !== undefined ? o.width : 1),
      sell: updatedFields.sell !== undefined ? Number(updatedFields.sell) : o.sell,
      printRate: updatedFields.printRate !== undefined ? Number(updatedFields.printRate) : (o.printRate !== undefined ? o.printRate : 0),
      // preserve critical read-only fields unless explicitly updated
      id: o.id,
      invoiceNumber: o.invoiceNumber,
      createdAt: o.createdAt || new Date().toISOString(),
    };

    writeOrders(orders);
    res.json(orders[index]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order" });
  }
});

app.delete("/api/orders/:id", (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    let orders = readOrders();
    const initialLength = orders.length;
    orders = orders.filter((o: any) => o.id !== orderId);

    if (orders.length === initialLength) {
      return res.status(404).json({ error: "Order not found" });
    }

    writeOrders(orders);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// Vite middleware configuration for serving the frontend
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production from dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FabricFlow server executing safely on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Critical server bootstrap failure:", err);
});
