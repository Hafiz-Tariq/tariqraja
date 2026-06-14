import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Plus,
  Download,
  Trash2,
  X,
  Printer,
  Check,
  Palette,
  Scissors,
  CheckCircle2,
  Clock,
  Loader2,
  Layers,
  FileText,
  DollarSign,
  TrendingUp,
  Upload,
  Settings,
  Pencil,
} from "lucide-react";
import { Order } from "./types";

export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [sidebarFilter, setSidebarFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>(" ");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selection & Modal States
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<Order | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState<boolean>(false);

  // Watermark Logo States
  const [watermarkImage, setWatermarkImage] = useState<string>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("watermarkImage") || "" : "";
  });
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(() => {
    if (typeof window === "undefined") return 0.15;
    const saved = localStorage.getItem("watermarkOpacity");
    return saved ? parseFloat(saved) : 0.15;
  });
  const [watermarkSize, setWatermarkSize] = useState<number>(() => {
    if (typeof window === "undefined") return 180;
    const saved = localStorage.getItem("watermarkSize");
    return saved ? parseInt(saved, 10) : 180;
  });

  useEffect(() => {
    if (watermarkImage) {
      localStorage.setItem("watermarkImage", watermarkImage);
    } else {
      localStorage.removeItem("watermarkImage");
    }
  }, [watermarkImage]);

  useEffect(() => {
    localStorage.setItem("watermarkOpacity", String(watermarkOpacity));
  }, [watermarkOpacity]);

  useEffect(() => {
    localStorage.setItem("watermarkSize", String(watermarkSize));
  }, [watermarkSize]);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Company Settings States
  const [companySettings, setCompanySettings] = useState({
    companyName: "FabricFlow Studios",
    companyAddress: "12 Textile Industrial Park, Sector 4\nLahore, Punjab - 54000\nPakistan",
    companyEmail: "billing@fabricflow.com",
    companyPhone: "+92 42 111 222 333",
    companyWebsite: "www.fabricflow.com"
  });

  // Settings form temp states
  const [settingsName, setSettingsName] = useState("");
  const [settingsAddress, setSettingsAddress] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsWebsite, setSettingsWebsite] = useState("");

  // New Order Form State
  const [formClient, setFormClient] = useState<string>("");
  const [formDesc, setFormDesc] = useState<string>("");
  const [formLength, setFormLength] = useState<string>("");
  const [formWidth, setFormWidth] = useState<string>("1");
  const [formFileSize, setFormFileSize] = useState<string>("");
  const [formSellRate, setFormSellRate] = useState<string>("");
  const [formPrintRate, setFormPrintRate] = useState<string>("0");
  const [formStatus, setFormStatus] = useState<"Pending" | "In Progress" | "Completed">("Pending");
  const [formServices, setFormServices] = useState<{
    fabric: boolean;
    design: boolean;
    print: boolean;
  }>({
    fabric: false,
    design: false,
    print: false,
  });

  // Delete Order Confirmation modal State
  const [deletingOrderInstance, setDeletingOrderInstance] = useState<Order | null>(null);

  // Edit Order Modal States
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editClient, setEditClient] = useState<string>("");
  const [editDesc, setEditDesc] = useState<string>("");
  const [editLength, setEditLength] = useState<string>("");
  const [editWidth, setEditWidth] = useState<string>("1");
  const [editFileSize, setEditFileSize] = useState<string>("");
  const [editSellRate, setEditSellRate] = useState<string>("");
  const [editPrintRate, setEditPrintRate] = useState<string>("0");
  const [editStatus, setEditStatus] = useState<"Pending" | "In Progress" | "Completed">("Pending");
  const [editServices, setEditServices] = useState<{
    fabric: boolean;
    design: boolean;
    print: boolean;
  }>({
    fabric: false,
    design: false,
    print: false,
  });

  // Fetch orders on load
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      if (!res.ok) {
        throw new Error("Failed to load orders from network");
      }
      const data = await res.json();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to the backend server. Verify the API is active.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings API
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setCompanySettings(data);
        setSettingsName(data.companyName);
        setSettingsAddress(data.companyAddress);
        setSettingsEmail(data.companyEmail);
        setSettingsPhone(data.companyPhone);
        setSettingsWebsite(data.companyWebsite);
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = {
        companyName: settingsName.trim(),
        companyAddress: settingsAddress.trim(),
        companyEmail: settingsEmail.trim(),
        companyPhone: settingsPhone.trim(),
        companyWebsite: settingsWebsite.trim(),
      };
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      setCompanySettings(updated);
      setIsSettingsModalOpen(false);
      triggerToast("Invoice company details updated successfully!");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to write updated company credentials.");
    }
  };

  // Inline resilient CSV parse helper supporting quotes and custom columns
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const getIndex = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));
    
    const idxInvoice = getIndex(["invoice", "inv"]);
    const idxClient = getIndex(["client", "customer", "name"]);
    const idxDesc = getIndex(["description", "desc"]);
    const idxLength = getIndex(["length", "meter", "qty"]);
    const idxSell = getIndex(["sell", "rate", "price"]);
    const idxStatus = getIndex(["status", "workflow"]);
    const idxFabric = getIndex(["fabric"]);
    const idxDesign = getIndex(["design"]);
    const idxPrint = getIndex(["print"]);
    const idxDate = getIndex(["created", "date"]);

    const items: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const rowRaw = lines[i];
      const row: string[] = [];
      let insideQuote = false;
      let entry = "";
      for (let j = 0; j < rowRaw.length; j++) {
        const char = rowRaw[j];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          row.push(entry);
          entry = "";
        } else {
          entry += char;
        }
      }
      row.push(entry);

      const client = idxClient !== -1 ? row[idxClient]?.trim() : (row[1] || "Unnamed Client");
      const desc = idxDesc !== -1 ? row[idxDesc]?.trim() : (row[2] || "");
      const length = idxLength !== -1 ? Number(row[idxLength]) || 0 : (Number(row[3]) || 0);
      const sell = idxSell !== -1 ? Number(row[idxSell]) || 0 : (Number(row[4]) || 0);
      const status = idxStatus !== -1 ? row[idxStatus]?.trim() : (row[6] || "Pending");
      const labelFabric = idxFabric !== -1 ? row[idxFabric]?.trim().toLowerCase() : "";
      const labelDesign = idxDesign !== -1 ? row[idxDesign]?.trim().toLowerCase() : "";
      const labelPrint = idxPrint !== -1 ? row[idxPrint]?.trim().toLowerCase() : "";
      const invoiceNumber = idxInvoice !== -1 ? row[idxInvoice]?.trim() : undefined;
      const createdAt = idxDate !== -1 && row[idxDate] ? new Date(row[idxDate].trim()).toISOString() : undefined;

      const services = {
        fabric: labelFabric ? (labelFabric.includes("studio") || labelFabric === "true" || labelFabric === "yes") : true,
        design: labelDesign ? (labelDesign.includes("studio") || labelDesign === "true" || labelDesign === "yes") : false,
        print: labelPrint ? (labelPrint.includes("studio") || labelPrint === "true" || labelPrint === "yes") : false
      };

      items.push({
        client,
        desc,
        length,
        sell,
        status,
        services,
        invoiceNumber,
        createdAt
      });
    }
    return items;
  };

  const handleImportCSVInBrowser = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        triggerToast("Empty file read.");
        return;
      }

      try {
        const parsedItems = parseCSV(text);
        if (parsedItems.length === 0) {
          triggerToast("No valid orders could be parsed from the selected CSV.");
          return;
        }

        const res = await fetch("/api/orders/bulk-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedItems),
        });

        if (!res.ok) {
          throw new Error("Server rejected bulk CSV import");
        }

        const updatedOrders = await res.json();
        setOrders(updatedOrders);
        triggerToast(`Successfully imported ${parsedItems.length} orders from CSV!`);
      } catch (err) {
        console.error("Import error:", err);
        triggerToast("Failed to parse and upload CSV data. Please match standard exported format.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Add order API
  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClient.trim() || !formDesc.trim()) {
      triggerToast("Please fill in both the Client Name and Description.");
      return;
    }

    const lengthVal = Number(formLength) || 0;
    const widthVal = Number(formWidth) || 1;
    const sellVal = Number(formSellRate) || 0;
    const printRateVal = Number(formPrintRate) || 0;

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: formClient.trim(),
          desc: formDesc.trim(),
          length: lengthVal,
          width: widthVal,
          fileSize: formFileSize.trim(),
          sell: sellVal,
          printRate: printRateVal,
          status: formStatus,
          services: formServices,
        }),
      });

      if (!response.ok) {
        throw new Error("Server rejected creating order");
      }

      const createdObj = await response.json();
      
      // Update local state and trigger side-effects
      setOrders((prev) => [...prev, createdObj]);
      setIsNewOrderModalOpen(false);
      triggerToast(`Order for ${formClient} created successfully.`);
      
      // Reset form fields
      setFormClient("");
      setFormDesc("");
      setFormLength("");
      setFormWidth("1");
      setFormFileSize("");
      setFormSellRate("");
      setFormPrintRate("0");
      setFormStatus("Pending");
      setFormServices({ fabric: false, design: false, print: false });
    } catch (err) {
      console.error(err);
      triggerToast("Could not append the order. Please check the network api.");
    }
  };

  const startEditingOrder = (order: Order, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingOrder(order);
    setEditClient(order.client || "");
    setEditDesc(order.desc || "");
    setEditLength(String(order.length || 0));
    setEditWidth(String(order.width !== undefined ? order.width : 1));
    setEditFileSize(order.fileSize || "");
    setEditSellRate(String(order.sell || 0));
    setEditPrintRate(String(order.printRate !== undefined ? order.printRate : 0));
    setEditStatus(order.status || "Pending");
    setEditServices({
      fabric: !!order.services?.fabric,
      design: !!order.services?.design,
      print: !!order.services?.print,
    });
    setIsEditModalOpen(true);
  };

  const handleEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    if (!editClient.trim() || !editDesc.trim()) {
      triggerToast("Please fill in both the Client Name and Description.");
      return;
    }

    const lengthVal = Number(editLength) || 0;
    const widthVal = Number(editWidth) || 1;
    const sellVal = Number(editSellRate) || 0;
    const printRateVal = Number(editPrintRate) || 0;

    try {
      const response = await fetch(`/api/orders/${editingOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: editClient.trim(),
          desc: editDesc.trim(),
          length: lengthVal,
          width: widthVal,
          fileSize: editFileSize.trim(),
          sell: sellVal,
          printRate: printRateVal,
          status: editStatus,
          services: editServices,
        }),
      });

      if (!response.ok) {
        throw new Error("Server rejected updating order");
      }

      const updatedObj = await response.json();
      
      // Update local state and trigger side-effects
      setOrders((prev) => prev.map((o) => o.id === editingOrder.id ? updatedObj : o));
      setIsEditModalOpen(false);
      setEditingOrder(null);
      triggerToast(`Order for ${editClient} updated successfully.`);
    } catch (err) {
      console.error(err);
      triggerToast("Could not update the order. Please check the network api.");
    }
  };

  // Delete order click setup (triggers state confirmation instead of blocking browser prompt)
  const askDeleteOrder = (order: Order, event: React.MouseEvent) => {
    event.stopPropagation();
    setDeletingOrderInstance(order);
  };

  const handleConfirmDeleteOrder = async () => {
    if (!deletingOrderInstance) return;
    const { id, client } = deletingOrderInstance;
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to complete deletion request");
      }

      setOrders((prev) => prev.filter((o) => o.id !== id));
      triggerToast(`Removed order for ${client}.`);
      setDeletingOrderInstance(null);
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred during deletion on the backend.");
    }
  };

  // Cycle order status API for easy workflows
  const handleCycleStatus = async (order: Order, event: React.MouseEvent) => {
    event.stopPropagation();
    const nextStatusMap: Record<string, "Pending" | "In Progress" | "Completed"> = {
      Pending: "In Progress",
      "In Progress": "Completed",
      Completed: "Pending",
    };

    const targetStatus = nextStatusMap[order.status] || "Pending";

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to cycle order status");
      }

      const updated = await response.json();
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      triggerToast(`Updated ${order.client} to ${targetStatus}`);
    } catch (err) {
      console.error(err);
      triggerToast("Status update failed on the server API.");
    }
  };

  // Filter and Search logic
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      o.client.toLowerCase().includes(q) ||
      o.desc.toLowerCase().includes(q) ||
      o.invoiceNumber.toLowerCase().includes(q);

    const matchesSidebar = sidebarFilter === "all" ? true : o.status === sidebarFilter;
    const matchesSelect = statusFilter === "all" ? true : o.status === statusFilter;

    return matchesSearch && matchesSidebar && matchesSelect;
  });

  // Calculate high-fidelity stats based on currently filtered subset
  const totalLength = filteredOrders.reduce((acc, o) => acc + o.length, 0);
  const totalRevenue = filteredOrders.reduce((acc, o) => {
    const baseSell = o.sell;
    const printRateVal = o.printRate !== undefined ? o.printRate : 0;
    const effectivePrintRate = o.services.print ? printRateVal : 0;
    return acc + o.length * (baseSell + effectivePrintRate);
  }, 0);

  // Calculation variables for active selected order bill
  const orderHeight = selectedOrderForBill ? (selectedOrderForBill.width !== undefined ? selectedOrderForBill.width : 1) : 1;
  const baseRate = selectedOrderForBill ? selectedOrderForBill.sell : 0;
  const printRateVal = selectedOrderForBill ? (selectedOrderForBill.printRate !== undefined ? selectedOrderForBill.printRate : 0) : 0;
  const effectivePrintRate = selectedOrderForBill ? (selectedOrderForBill.services.print ? printRateVal : 0) : 0;
  const billTotalAmount = selectedOrderForBill ? selectedOrderForBill.length * (baseRate + effectivePrintRate) : 0;

  // Printable and triggerable Invoice actions
  const triggerPrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      triggerToast("No visible orders to export.");
      return;
    }

    const headers = ["Invoice Number", "Client Name", "Description", "Length (m)", "Sell Price (Rs/m)", "Total Value (Rs)", "Status", "Fabric Space", "Custom Design", "Printed Finishing", "Created Date"];
    const rows = filteredOrders.map((o) => [
      o.invoiceNumber,
      o.client,
      o.desc.replace(/,/g, " "),
      o.length,
      o.sell,
      o.length * (o.sell + (o.services.print ? (o.printRate || 0) : 0)),
      o.status,
      o.services.fabric ? "Studio" : "Client Owned",
      o.services.design ? "Studio" : "Client Owned",
      o.services.print ? "Studio" : "Client Owned",
      new Date(o.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `FabricFlow_Export_${sidebarFilter}_Orders.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Orders list exported to CSV.");
  };

  // Safe service toggle helper
  const toggleFormService = (key: "fabric" | "design" | "print") => {
    setFormServices((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleEditService = (key: "fabric" | "design" | "print") => {
    setEditServices((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex select-none">
      
      {/* ─── SIDEBAR ─── */}
      <aside className="w-72 min-w-[288px] bg-white border-r border-slate-200 flex flex-col py-6 no-print shadow-sm">
        {/* LOGO BLOCK */}
        <div className="flex items-center gap-3 px-6 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-lg shadow-md shadow-indigo-600/10 text-white">
            🧵
          </div>
          <div>
            <h1 className="font-sans text-base font-extrabold tracking-tight text-indigo-700 uppercase leading-none">
              FabricFlow
            </h1>
            <p className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase mt-1">
              Billing Pro v2.0
            </p>
          </div>
        </div>

        {/* NAVIGATION SECTIONS */}
        <div className="px-3 py-6 flex-1 flex flex-col gap-6">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 block mb-3">
              ACTIVE FILTERS
            </span>
            <div className="flex flex-col gap-1">
              {[
                { label: "All Orders", filterValue: "all", icon: "📋" },
                { label: "Pending", filterValue: "Pending", icon: "🕒" },
                { label: "In Progress", filterValue: "In Progress", icon: "⚙️" },
                { label: "Completed", filterValue: "Completed", icon: "✅" },
              ].map((item) => (
                <button
                  key={item.filterValue}
                  id={`nav-${item.filterValue}`}
                  onClick={() => {
                    setSidebarFilter(item.filterValue);
                    setStatusFilter("all"); // sync
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-sans font-semibold transition-all text-left border-l-4 ${
                    sidebarFilter === item.filterValue
                      ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-extrabold"
                      : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </button>
              ))}

              <div className="border-t border-slate-100 my-2" />

              <button
                id="settings-btn"
                onClick={() => {
                  setSettingsName(companySettings.companyName);
                  setSettingsAddress(companySettings.companyAddress);
                  setSettingsEmail(companySettings.companyEmail);
                  setSettingsPhone(companySettings.companyPhone);
                  setSettingsWebsite(companySettings.companyWebsite);
                  setIsSettingsModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-sans font-semibold border-l-4 border-transparent text-slate-600 hover:bg-indigo-50 hover:text-indigo-950 hover:font-bold cursor-pointer transition-all text-left"
              >
                <span className="text-sm">⚙️</span>
                <span className="flex-1">Company Settings</span>
              </button>

              <button
                id="logo-watermark-btn"
                onClick={() => {
                  setIsLogoModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-sans font-semibold border-l-4 border-transparent text-slate-600 hover:bg-indigo-50 hover:text-indigo-950 hover:font-bold cursor-pointer transition-all text-left"
              >
                <span className="text-sm">🖼️</span>
                <span className="flex-1">Company Logo</span>
              </button>
            </div>
          </div>
        </div>

        {/* LOGGED IN USER FOOTER info */}
        <div className="p-4 mx-3 mt-auto border border-slate-100 bg-slate-50 rounded-xl flex items-center space-x-3 text-slate-900">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold font-sans">
            OP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">Operator</p>
            <p className="text-[10px] text-slate-500 truncate">pfull3725@gmail.com</p>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT RECONSTRUCTED ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 no-print">
        
        {/* TOPBAR */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="font-sans text-xl font-extrabold text-slate-800">
              {sidebarFilter === "all" ? "All Shipments & Orders" : `${sidebarFilter} Shipments`}
            </h2>
            <div className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-extrabold tracking-wide uppercase">
              {filteredOrders.length} {filteredOrders.length === 1 ? "Order" : "Orders"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Hidden input for CSV importing */}
            <input
              id="csv-import-file"
              type="file"
              accept=".csv"
              onChange={handleImportCSVInBrowser}
              className="hidden"
            />
            <button
              id="import-csv-btn"
              onClick={() => document.getElementById("csv-import-file")?.click()}
              className="px-4 py-2 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-indigo-600 hover:text-indigo-600 transition-all text-xs font-sans font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              Import CSV
            </button>
            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-indigo-600 hover:text-indigo-600 transition-all text-xs font-sans font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

          </div>
        </header>

        {/* PANEL INTERNALS */}
        <div className="p-8 flex flex-col gap-8 max-w-7xl w-full mx-auto">
          
          {/* STATS ROW (DENSITY REDUX - 'BUY PRICE' REMOVED) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            
            {/* CARD 1: Total orders */}
            <div id="stat-total-orders" className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden group hover:border-indigo-300 shadow-sm transition-all">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-indigo-600" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                ACTIVE SHIPMENTS
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-3xl font-extrabold text-slate-900">
                  {filteredOrders.length}
                </span>
                <span className="text-[10px] text-slate-500">listed order(s)</span>
              </div>
              <div className="mt-2.5 text-[10px] text-indigo-600 flex items-center gap-1 font-semibold">
                <Layers className="w-3 h-3" />
                Filtered based on current navigation view
              </div>
            </div>

            {/* CARD 2: Total length */}
            <div id="stat-total-length" className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden group hover:border-teal-500 shadow-sm transition-all">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-teal-600" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                TOTAL FABRIC LENGTH
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-3xl font-extrabold text-slate-900">
                  {totalLength.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">Meters</span>
              </div>
              <div className="mt-2.5 text-[10px] text-teal-600 flex items-center gap-1 font-semibold">
                <Scissors className="w-3 h-3" />
                Raw textile roll assignment count
              </div>
            </div>

            {/* COLUMN 3: Revenue Box & New Order Button */}
            <div className="flex flex-col gap-4">
              {/* CARD 3: Sell-price Total (Replaced Gross Profit/Cost) */}
              <div id="stat-total-revenue" className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500 shadow-sm transition-all">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-600" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  TOTAL INVOICE VALUE (REVENUE)
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-sans text-3xl font-extrabold text-emerald-600">
                    Rs {totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2.5 text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <DollarSign className="w-3 h-3" />
                  Summed valuation of services
                </div>
              </div>

              {/* NEW ORDER BUTTON BELOW THE REVENUE BOX */}
              <button
                id="new-order-btn"
                onClick={() => {
                  // Reset form fields
                  setFormClient("");
                  setFormDesc("");
                  setFormLength("");
                  setFormWidth("1");
                  setFormSellRate("");
                  setFormPrintRate("0");
                  setFormStatus("Pending");
                  setFormServices({ fabric: false, design: false, print: false });
                  setIsNewOrderModalOpen(true);
                }}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all text-xs font-sans font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" />
                New Order
              </button>
            </div>

          </div>

          {/* TABLE & CONTROLS COMPONENT */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            
            {/* TABLE CONTROLS SECTION */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap bg-white">
              <div className="flex items-center gap-3">
                <span className="font-sans text-sm font-extrabold text-slate-800">
                  Order Index
                </span>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">
                  (Click any Client row to inspect / print Invoice Bill)
                </span>
              </div>

              {/* SEARCH & FILTERS */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search query field */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-[280px] focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600/20 transition-all">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    id="table-search"
                    type="text"
                    placeholder="Search by client, item or INV#..."
                    value={searchQuery === " " ? "" : searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 w-full font-sans font-medium"
                  />
                  {searchQuery !== " " && searchQuery !== "" && (
                    <button
                      onClick={() => setSearchQuery(" ")}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status select filter */}
                <select
                  id="status-select-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-sans font-semibold px-3 py-2 cursor-pointer outline-none hover:border-slate-400 focus:border-indigo-600 transition-all"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                {/* Legend indicator */}
                <div className="hidden lg:flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200 text-[10px] text-slate-500 leading-none">
                  <span className="font-bold text-slate-400 uppercase mr-1">Legend:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    <span>Fabric</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-600" />
                    <span>Design</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Print</span>
                  </div>
                  <span className="text-[9px] text-slate-400 italic ml-1">
                    (colored=Studio, empty=Client)
                  </span>
                </div>
              </div>
            </div>

            {/* TABLE GRID AND ROWS */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-xs font-sans font-bold">Synchronizing billing records with server API...</p>
              </div>
            ) : error ? (
              <div className="py-20 flex flex-col items-center justify-center text-rose-500 px-6 text-center gap-3">
                <div className="text-2xl">⚠️</div>
                <p className="text-xs max-w-md font-sans font-bold leading-relaxed">{error}</p>
                <button
                  onClick={fetchOrders}
                  className="mt-2 px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-250 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-xl border border-slate-200">
                  📦
                </div>
                <div>
                  <p className="text-xs font-sans font-bold text-slate-800">No active textile orders matched your filters</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try resetting the search keywords or navigation sidebar selection</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75">
                      <th className="px-6 py-4 font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                        Invoice / Date
                      </th>
                      <th className="px-6 py-4 font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-4 font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center">
                        Length
                      </th>
                      <th className="px-6 py-4 font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center">
                        Width
                      </th>
                      <th className="px-6 py-4 font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center">
                        Services Assigned
                      </th>
                      <th className="px-6 py-4 font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                        Sell Rate (Fabric/Design)
                      </th>
                      <th className="px-6 py-4 font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                        Print Rate
                      </th>
                      <th className="px-6 py-4 font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-4 font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                        Workflow Status
                      </th>
                      <th className="px-6 py-4 font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const width = order.width !== undefined ? order.width : 1;
                      const baseSell = order.sell;
                      const printRateVal = order.printRate !== undefined ? order.printRate : 0;
                      const effectivePrintRate = order.services.print ? printRateVal : 0;
                      const amount = order.length * (baseSell + effectivePrintRate);
                      return (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrderForBill(order)}
                          className="group border-b border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          {/* Invoice code */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-[11px] text-slate-700 font-semibold font-mono leading-none">
                                {order.invoiceNumber}
                              </span>
                              <span className="text-[9px] text-slate-400 font-sans mt-1.5 whitespace-nowrap">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "Jun 14, 2026"}
                              </span>
                            </div>
                          </td>

                          {/* Client customer name */}
                          <td className="px-6 py-4">
                            <div className="font-sans font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {order.client}
                            </div>
                          </td>

                          {/* Order Description detail */}
                          <td className="px-6 py-4">
                            <p className="text-xs text-slate-500 max-w-[220px] truncate" title={order.desc}>
                              {order.desc}
                            </p>
                          </td>

                          {/* Length counts rewritten to L x W */}
                          <td className="px-6 py-4 text-center font-sans font-semibold text-slate-700 whitespace-nowrap">
                            {order.length} m
                          </td>

                          {/* Width counts */}
                          <td className="px-6 py-4 text-center font-sans font-semibold text-slate-700 whitespace-nowrap">
                            {width} in
                          </td>

                          {/* Services layout dots */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Fabric dot */}
                              <div
                                title={`Fabric: ${order.services.fabric ? "Provided by Studio" : "Provided by Client"}`}
                                className={`w-3 h-3 rounded-full border-2 ${
                                  order.services.fabric
                                    ? "bg-teal-600 border-teal-600"
                                    : "bg-transparent border-teal-600"
                                }`}
                              />
                              {/* Design dot */}
                              <div
                                title={`Design: ${order.services.design ? "Provided by Studio" : "Provided by Client"}`}
                                className={`w-3 h-3 rounded-full border-2 ${
                                  order.services.design
                                    ? "bg-pink-600 border-pink-600"
                                    : "bg-transparent border-pink-600"
                                }`}
                              />
                              {/* Print dot */}
                              <div
                                title={`Print: ${order.services.print ? "Provided by Studio" : "Provided by Client"}`}
                                className={`w-3 h-3 rounded-full border-2 ${
                                  order.services.print
                                    ? "bg-slate-400 border-slate-400"
                                    : "bg-transparent border-slate-400"
                                }`}
                              />
                            </div>
                          </td>

                          {/* Sell rate */}
                          <td className="px-6 py-4 font-sans font-semibold text-slate-700 text-xs whitespace-nowrap">
                            Rs {order.sell}/m²
                          </td>

                          {/* Print rate with dynamic display */}
                          <td className="px-6 py-4 font-sans font-semibold text-slate-700 text-xs whitespace-nowrap">
                            Rs {printRateVal}/m²
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 font-sans font-bold text-slate-900 text-xs whitespace-nowrap">
                            Rs {amount.toLocaleString()}
                          </td>

                          {/* Workflow status */}
                          <td className="px-6 py-4">
                            <span
                              title="Workflow status indicator"
                              className={`px-3 py-1 rounded-full text-[9px] font-sans font-extrabold uppercase tracking-wide inline-block ${
                                order.status === "Pending"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : order.status === "In Progress"
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>

                          {/* Action links */}
                          <td className="px-6 py-4 text-right no-print">
                            <div className="flex items-center justify-end gap-2 text-right">
                              <div className="flex flex-col gap-1 min-w-[72px]">
                                {/* Generate billing */}
                                <button
                                  title="Print Invoice"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrderForBill(order);
                                  }}
                                  className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-md transition-colors text-[10px] font-sans font-semibold flex items-center gap-1 cursor-pointer border border-slate-200 justify-center"
                                >
                                  <FileText className="w-3 h-3" />
                                  Bill
                                </button>

                                {/* Edit Detail */}
                                <button
                                  title="Edit order details"
                                  onClick={(e) => startEditingOrder(order, e)}
                                  className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-teal-600 rounded-md transition-colors text-[10px] font-sans font-semibold flex items-center gap-1 cursor-pointer border border-slate-200 justify-center"
                                >
                                  <Pencil className="w-3 h-3 text-slate-400" />
                                  Edit
                                </button>
                              </div>
                              
                              {/* delete record */}
                              <button
                                title="Remove Order"
                                onClick={(e) => askDeleteOrder(order, e)}
                                className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer border border-slate-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ─── MODAL CODE: DETAILED BILL/INVOICE WITH PRINT INSTRUCTIONS ─── */}
      <AnimatePresence>
        {selectedOrderForBill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#000000]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedOrderForBill(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white text-black p-8 rounded-xl max-w-2xl w-full relative shadow-2xl overflow-y-auto max-h-[90vh] font-mono select-text"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* TOP ACTIONS NOT SEEN ON ACTUAL PAPER PRINT */}
              <div className="flex justify-between items-center pb-6 border-b border-gray-200 mb-8 no-print">
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Bill Preview ready to print / export PDF
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={triggerPrint}
                    className="px-4 py-2 bg-[#7c6af7] hover:bg-[#6b5ce7] text-white rounded-lg text-xs font-sans font-extrabold flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Print & Export PDF
                  </button>
                  <button
                    onClick={() => setSelectedOrderForBill(null)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Dismiss
                  </button>
                </div>
              </div>

              {/* HIGH-FIDELITY INVOICE PAPER BODY */}
              <div className="bg-white text-black p-2 font-sans relative overflow-hidden">
                {/* WATERMARK BACKGROUND EFFECT */}
                {watermarkImage && (
                  <div
                    className="absolute inset-0 pointer-events-none flex items-center justify-center z-0"
                    style={{ opacity: watermarkOpacity }}
                  >
                    <img
                      src={watermarkImage}
                      alt="Watermark"
                      className="object-contain max-w-[85%] max-h-[85%]"
                      style={{ width: `${watermarkSize}px`, height: "auto" }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                
                {/* Optional Company Details Box */}
                {(() => {
                  const hasCompanyDetails = !!(
                    companySettings.companyName?.trim() ||
                    companySettings.companyAddress?.trim() ||
                    companySettings.companyEmail?.trim() ||
                    companySettings.companyPhone?.trim() ||
                    companySettings.companyWebsite?.trim()
                  );
                  if (!hasCompanyDetails) return null;
                  return (
                    <div className="pb-5 mb-5 border-b border-slate-200">
                      {companySettings.companyName?.trim() && (
                        <h3 className="text-xl font-black text-black tracking-tight uppercase leading-none mb-1.5">
                          {companySettings.companyName}
                        </h3>
                      )}
                      <p className="text-[9px] text-[#94a3b8] tracking-widest uppercase font-extrabold mb-2.5">
                        Textile Production Partner
                      </p>
                      <div className="text-[10px] text-slate-500 font-medium whitespace-pre-line leading-relaxed">
                        {companySettings.companyAddress?.trim() && (
                          <div className="mb-1">{companySettings.companyAddress}</div>
                        )}
                        {(companySettings.companyEmail?.trim() || companySettings.companyPhone?.trim()) && (
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                            {companySettings.companyEmail?.trim() && <div>Email: {companySettings.companyEmail}</div>}
                            {companySettings.companyPhone?.trim() && <div>Phone: {companySettings.companyPhone}</div>}
                          </div>
                        )}
                        {companySettings.companyWebsite?.trim() && (
                          <div className="text-indigo-600 mt-1 font-bold">Web: {companySettings.companyWebsite}</div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* HEADER TITLE & DATE & INVOICE NUMBER */}
                <div className="flex justify-between items-baseline mb-1">
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase block mb-0.5">
                      TEXTILE ORDER BILL
                    </span>
                    <span className="text-[10px] font-extrabold text-[#7c6af7] font-sans block">
                      Date: {selectedOrderForBill.createdAt ? new Date(selectedOrderForBill.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-slate-500 tracking-wider">
                    Invoice: {selectedOrderForBill.invoiceNumber}
                  </span>
                </div>
                <hr className="border-t border-slate-200 mb-5" />

                {/* BILLED TO */}
                <div className="mb-7">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">
                    BILLED TO
                  </p>
                  <p className="text-lg font-black text-slate-900 leading-snug">
                    {selectedOrderForBill.client}
                  </p>
                </div>

                {/* ITEM DETAILS TABLE (REPLACED WITH BEAUTIFUL LIST ACCORDING TO SCREENSHOT) */}
                <div className="flex flex-col mb-5 text-[11px]">
                  
                  {/* DESCRIPTION */}
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      DESCRIPTION
                    </span>
                    <span className="font-extrabold text-[#111214] text-right max-w-[280px]">
                      {selectedOrderForBill.desc || "Standard fabric process"}
                    </span>
                  </div>

                  {/* SERVICES */}
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      SERVICES
                    </span>
                    <span className="font-extrabold text-[#111214] text-right">
                      {(() => {
                        const sNames = [];
                        if (selectedOrderForBill.services.fabric) sNames.push("Fabric");
                        if (selectedOrderForBill.services.design) sNames.push("Design");
                        if (selectedOrderForBill.services.print) sNames.push("Print");
                        return sNames.join(", ") || "None";
                      })()}
                    </span>
                  </div>

                  {/* LENGTH */}
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      LENGTH
                    </span>
                    <span className="font-extrabold text-[#111214] text-right whitespace-nowrap">
                      {selectedOrderForBill.length} m
                    </span>
                  </div>

                  {/* WIDTH */}
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      WIDTH
                    </span>
                    <span className="font-extrabold text-[#111214] text-right whitespace-nowrap">
                      {orderHeight} in
                    </span>
                  </div>

                  {/* FILE SIZE (Optional) */}
                  {selectedOrderForBill.fileSize && (
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        FILE SIZE
                      </span>
                      <span className="font-extrabold text-[#111214] text-right whitespace-nowrap">
                        {selectedOrderForBill.fileSize}
                      </span>
                    </div>
                  )}

                  {/* FABRIC RATE */}
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      FABRIC RATE
                    </span>
                    <span className="font-extrabold text-[#111214] text-right whitespace-nowrap">
                      Rs {baseRate.toFixed(2)}
                    </span>
                  </div>

                  {/* PRINT RATE */}
                  {selectedOrderForBill.services.print && (
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        PRINT RATE
                      </span>
                      <span className="font-extrabold text-[#111214] text-right whitespace-nowrap">
                        Rs {printRateVal.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                </div>

                {/* FABRIC TOTAL */}
                <div className="flex justify-between items-center py-2 text-[11px]">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    FABRIC TOTAL
                  </span>
                  <span className="font-extrabold text-slate-900 text-right whitespace-nowrap">
                    Rs {(selectedOrderForBill.length * baseRate).toLocaleString()}
                  </span>
                </div>

                {/* PRINT TOTAL */}
                {selectedOrderForBill.services.print && (
                  <div className="flex justify-between items-center py-2 text-[11px]">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      PRINT TOTAL
                    </span>
                    <span className="font-extrabold text-slate-900 text-right whitespace-nowrap">
                      Rs {(selectedOrderForBill.length * printRateVal).toLocaleString()}
                    </span>
                  </div>
                )}

                <hr className="border-t border-slate-200 mt-4 mb-4" />

                {/* GRAND TOTAL */}
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    GRAND TOTAL
                  </span>
                  <span className="font-extrabold text-indigo-600 text-right text-base whitespace-nowrap">
                    Rs {billTotalAmount.toLocaleString()}
                  </span>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODAL CODE: PRINT SCREEN COMPONENT (DOUBLED UP TO ENSURE NATIVE INVOICE COVER) ─── */}
      {selectedOrderForBill && (
        <div className="print-only text-black bg-white p-6 font-sans select-text relative overflow-hidden">
          {/* WATERMARK BACKGROUND EFFECT FOR PRINT */}
          {watermarkImage && (
            <div
              className="absolute inset-0 pointer-events-none flex items-center justify-center z-0"
              style={{ opacity: watermarkOpacity }}
            >
              <img
                src={watermarkImage}
                alt="Watermark"
                className="object-contain max-w-[85%] max-h-[85%]"
                style={{ width: `${watermarkSize}px`, height: "auto" }}
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          
          {/* Optional Company Details Box */}
          {(() => {
            const hasCompanyDetails = !!(
              companySettings.companyName?.trim() ||
              companySettings.companyAddress?.trim() ||
              companySettings.companyEmail?.trim() ||
              companySettings.companyPhone?.trim() ||
              companySettings.companyWebsite?.trim()
            );
            if (!hasCompanyDetails) return null;
            return (
              <div className="pb-5 mb-5 border-b border-slate-200">
                {companySettings.companyName?.trim() && (
                  <h3 className="text-xl font-black text-black tracking-tight uppercase leading-none mb-1.5">
                    {companySettings.companyName}
                  </h3>
                )}
                <p className="text-[9px] text-[#94a3b8] tracking-widest uppercase font-extrabold mb-2.5">
                  Textile Production Partner
                </p>
                <div className="text-[10px] text-slate-500 font-medium whitespace-pre-line leading-relaxed">
                  {companySettings.companyAddress?.trim() && (
                    <div className="mb-1">{companySettings.companyAddress}</div>
                  )}
                  {(companySettings.companyEmail?.trim() || companySettings.companyPhone?.trim()) && (
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                      {companySettings.companyEmail?.trim() && <div>Email: {companySettings.companyEmail}</div>}
                      {companySettings.companyPhone?.trim() && <div>Phone: {companySettings.companyPhone}</div>}
                    </div>
                  )}
                  {companySettings.companyWebsite?.trim() && (
                    <div className="text-indigo-600 mt-1 font-bold">Web: {companySettings.companyWebsite}</div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* HEADER TITLE & DATE & INVOICE NUMBER */}
          <div className="flex justify-between items-baseline mb-1">
            <div className="text-left">
              <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase block mb-0.5">
                TEXTILE ORDER BILL
              </span>
              <span className="text-[10px] font-extrabold text-[#7c6af7] font-sans block">
                Date: {selectedOrderForBill.createdAt ? new Date(selectedOrderForBill.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <span className="text-[10px] font-bold font-mono text-slate-500 tracking-wider">
              Invoice: {selectedOrderForBill.invoiceNumber}
            </span>
          </div>
          <hr className="border-t border-slate-200 mb-5" />

          {/* BILLED TO */}
          <div className="mb-7">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">
              BILLED TO
            </p>
            <p className="text-lg font-black text-slate-900 leading-snug">
              {selectedOrderForBill.client}
            </p>
          </div>

          {/* ITEM DETAILS TABLE (REPLACED WITH BEAUTIFUL LIST ACCORDING TO SCREENSHOT) */}
          <div className="flex flex-col mb-5 text-[11px]">
            
            {/* DESCRIPTION */}
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                DESCRIPTION
              </span>
              <span className="font-extrabold text-[#111214] text-right max-w-[280px]">
                {selectedOrderForBill.desc || "Standard fabric process"}
              </span>
            </div>

            {/* SERVICES */}
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                SERVICES
              </span>
              <span className="font-extrabold text-[#111214] text-right">
                {(() => {
                  const sNames = [];
                  if (selectedOrderForBill.services.fabric) sNames.push("Fabric");
                  if (selectedOrderForBill.services.design) sNames.push("Design");
                  if (selectedOrderForBill.services.print) sNames.push("Print");
                  return sNames.join(", ") || "None";
                })()}
              </span>
            </div>

            {/* LENGTH */}
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                LENGTH
              </span>
              <span className="font-extrabold text-[#111214] text-right whitespace-nowrap">
                {selectedOrderForBill.length} m
              </span>
            </div>

            {/* WIDTH */}
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                WIDTH
              </span>
              <span className="font-extrabold text-[#111214] text-right whitespace-nowrap">
                {orderHeight} in
              </span>
            </div>

            {/* FILE SIZE (Optional) */}
            {selectedOrderForBill.fileSize && (
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  FILE SIZE
                </span>
                <span className="font-extrabold text-[#111214] text-right whitespace-nowrap">
                  {selectedOrderForBill.fileSize}
                </span>
              </div>
            )}

            {/* FABRIC RATE */}
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                FABRIC RATE
              </span>
              <span className="font-extrabold text-[#111214] text-right whitespace-nowrap">
                Rs {baseRate.toFixed(2)}
              </span>
            </div>

            {/* PRINT RATE */}
            {selectedOrderForBill.services.print && (
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  PRINT RATE
                </span>
                <span className="font-extrabold text-[#111214] text-right whitespace-nowrap">
                  Rs {printRateVal.toFixed(2)}
                </span>
              </div>
            )}
            
          </div>

          {/* FABRIC TOTAL */}
          <div className="flex justify-between items-center py-2 text-[11px]">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              FABRIC TOTAL
            </span>
            <span className="font-extrabold text-slate-900 text-right whitespace-nowrap">
              Rs {(selectedOrderForBill.length * baseRate).toLocaleString()}
            </span>
          </div>

          {/* PRINT TOTAL */}
          {selectedOrderForBill.services.print && (
            <div className="flex justify-between items-center py-2 text-[11px]">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                PRINT TOTAL
              </span>
              <span className="font-extrabold text-slate-900 text-right whitespace-nowrap">
                Rs {(selectedOrderForBill.length * printRateVal).toLocaleString()}
              </span>
            </div>
          )}

          <hr className="border-t border-slate-200 mt-4 mb-4" />

          {/* GRAND TOTAL */}
          <div className="flex justify-between items-center mt-3 mb-8">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              GRAND TOTAL
            </span>
            <span className="font-extrabold text-indigo-600 text-right text-base whitespace-nowrap">
              Rs {billTotalAmount.toLocaleString()}
            </span>
          </div>

          <div className="text-[9px] text-gray-500 leading-relaxed mt-10 pt-4 border-t border-dashed border-gray-300 text-center">
            <p className="font-sans font-bold text-gray-400">
              Thank you immensely for prioritizing your custom textile processing requests with us!
            </p>
          </div>
        </div>
      )}

      {/* ─── MODAL CODE: FOR COMPANY SETTINGS ENTRY ─── */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSettingsModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-xl p-6.5 w-full max-w-[480px] shadow-2xl flex flex-col gap-5 text-xs text-slate-600"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-sans text-base font-bold text-slate-800 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span>Company Invoice Settings</span>
                </h3>
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Company Name
                  </label>
                  <input
                    id="settings-name-input"
                    type="text"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                    placeholder="Optional (e.g. FabricFlow Studios)"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Company Address
                  </label>
                  <textarea
                    id="settings-address-input"
                    rows={3}
                    value={settingsAddress}
                    onChange={(e) => setSettingsAddress(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium resize-none"
                    placeholder="Optional (Physical location / city postal details)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Email Address
                    </label>
                    <input
                      id="settings-email-input"
                      type="text"
                      value={settingsEmail}
                      onChange={(e) => setSettingsEmail(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                      placeholder="Optional (billing@fabricflow.com)"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Phone Number
                    </label>
                    <input
                      id="settings-phone-input"
                      type="text"
                      value={settingsPhone}
                      onChange={(e) => setSettingsPhone(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                      placeholder="Optional (+92 42 ...)"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Website (Optional)
                  </label>
                  <input
                    id="settings-website-input"
                    type="text"
                    value={settingsWebsite}
                    onChange={(e) => setSettingsWebsite(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                    placeholder="Optional (www.fabricflow.com)"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold rounded-lg transition-all shadow-md cursor-pointer"
                  >
                    Save Details
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODAL CODE: FOR COMPANY LOGO & WATERMARK SETUP ─── */}
      <AnimatePresence>
        {isLogoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLogoModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-[500px] shadow-2xl flex flex-col gap-5 text-xs text-slate-600 animate-none"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-sans text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-lg">🖼️</span>
                  <span>Company Logo Watermark</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4.5">
                {/* 1. Drag & Drop File Upload Panel */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Upload Logo / Badge Image
                  </label>
                  
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith("image/")) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setWatermarkImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-slate-50/50 rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer relative"
                    onClick={() => document.getElementById("watermark-file-input")?.click()}
                  >
                    <input
                      id="watermark-file-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setWatermarkImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />

                    <Upload className="w-6 h-6 text-slate-400 animate-pulse" />
                    
                    <div className="mt-1">
                      <p className="font-sans font-bold text-slate-700 text-xs text-center">
                        Drag and drop your company logo here
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 text-center">
                        or click to browse from files (PNG, JPG, SVG, etc.)
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Logo Preview Block */}
                {watermarkImage ? (
                  <div className="border border-slate-100 bg-slate-50/55 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Watermark Preview
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setWatermarkImage("");
                          setWatermarkOpacity(0.15);
                          setWatermarkSize(180);
                        }}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove Logo
                      </button>
                    </div>

                    {/* Checkered pattern background for transparency representation */}
                    <div 
                      className="h-32 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden bg-white"
                      style={{
                        backgroundImage: "radial-gradient(#e2e8f0 1.2px, transparent 1.2px)",
                        backgroundSize: "12px 12px"
                      }}
                    >
                      <img
                        src={watermarkImage}
                        alt="Watermark preview"
                        className="object-contain max-h-[85%] max-w-[85%] transition-all"
                        style={{
                          opacity: watermarkOpacity,
                          width: `${watermarkSize}px`,
                        }}
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Quick Watermark Presets
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: "Subtle (10%)", opacity: 0.10, size: 200 },
                          { label: "Standard (15%)", opacity: 0.15, size: 180 },
                          { label: "Visible (25%)", opacity: 0.25, size: 160 },
                          { label: "Small Corner", opacity: 0.35, size: 100 },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setWatermarkOpacity(preset.opacity);
                              setWatermarkSize(preset.size);
                            }}
                            className="bg-white hover:bg-slate-100 border border-slate-200 rounded font-sans text-[10px] px-2 py-0.5 font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Slider Controls */}
                    <div className="grid grid-cols-2 gap-3.5 mt-2">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Opacity
                          </label>
                          <span className="font-mono text-[10px] font-bold text-slate-700">
                            {Math.round(watermarkOpacity * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="1.0"
                          step="0.05"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                          className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Size
                          </label>
                          <span className="font-mono text-[10px] font-bold text-slate-700">
                            {watermarkSize} px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="400"
                          step="10"
                          value={watermarkSize}
                          onChange={(e) => setWatermarkSize(parseInt(e.target.value, 10))}
                          className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center bg-slate-50 border border-slate-100 text-slate-400 text-[10px] p-4 rounded-xl font-medium leading-relaxed">
                    🌟 A watermark logo can stand behind your invoice text at low opacity, letting you fully brand printed work in style. Choose an image above!
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(false)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs rounded-lg transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] cursor-pointer"
                >
                  Apply & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODAL CODE: FOR APPRENTICE NEW ORDER CREATION ─── */}
      <AnimatePresence>
        {isNewOrderModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNewOrderModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-xl p-6.5 w-full max-w-[480px] shadow-2xl flex flex-col gap-5 text-xs text-slate-600"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-sans text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>＋</span> New Textile Order Record
                </h3>
                <button
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddOrder} className="flex flex-col gap-4">
                
                {/* Client & Status parameters */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Client Name
                    </label>
                    <input
                      id="form-client-input"
                      type="text"
                      placeholder="e.g. Hassan Textiles"
                      required
                      value={formClient}
                      onChange={(e) => setFormClient(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Production Status
                    </label>
                    <select
                      id="form-status-select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Description parameters */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Brief Roll Work Description
                  </label>
                  <input
                    id="form-desc-input"
                    type="text"
                    required
                    placeholder="e.g. Summer floral silk printing collection"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                  />
                </div>

                {/* Length and Rate parameter (no buy price!) */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Roll Length (meters)
                    </label>
                    <input
                      id="form-length-input"
                      type="number"
                      required
                      placeholder="e.g. 150"
                      value={formLength}
                      onChange={(e) => setFormLength(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Base Rate (Rs / meter)
                    </label>
                    <input
                      id="form-rate-input"
                      type="number"
                      required
                      placeholder="e.g. 250"
                      value={formSellRate}
                      onChange={(e) => setFormSellRate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                    />
                  </div>
                </div>

                {/* Width and Print Rate parameters */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Roll Width (inches)
                    </label>
                    <input
                      id="form-width-input"
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 54"
                      value={formWidth}
                      onChange={(e) => setFormWidth(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Print Rate (Rs / meter)
                    </label>
                    <input
                      id="form-print-rate-input"
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 120"
                      value={formPrintRate}
                      onChange={(e) => setFormPrintRate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                    />
                  </div>
                </div>

                {/* File Size parameter (Optional) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    File Size (Optional)
                  </label>
                  <input
                    id="form-file-size-input"
                    type="text"
                    placeholder="e.g. 250 MB, 1.2 GB (leave blank if none)"
                    value={formFileSize}
                    onChange={(e) => setFormFileSize(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                  />
                </div>

                {/* Services toggles selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Production Services Needed
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[
                      { icon: <Layers className="w-3.5 h-3.5" />, label: "Fabric", key: "fabric" as const, activeClass: "border-teal-600 text-teal-700 bg-teal-50" },
                      { icon: <Palette className="w-3.5 h-3.5" />, label: "Design", key: "design" as const, activeClass: "border-pink-600 text-pink-700 bg-pink-50" },
                      { icon: <Scissors className="w-3.5 h-3.5" />, label: "Print", key: "print" as const, activeClass: "border-slate-400 text-slate-700 bg-slate-100" },
                    ].map((item) => {
                      const isActive = formServices[item.key];
                      return (
                        <button
                          key={item.key}
                          type="button"
                          id={`toggle-form-${item.key}`}
                          onClick={() => toggleFormService(item.key)}
                          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg border transition-all text-[11px] font-sans font-bold cursor-pointer ${
                            isActive
                              ? item.activeClass
                              : "border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-450 bg-transparent"
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="border-t border-slate-100 pt-4 mt-1.5 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsNewOrderModalOpen(false)}
                    className="px-4 py-2 bg-transparent hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-500 font-sans font-bold rounded-lg text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-order-button"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
                  >
                    <Check className="w-4 h-4" />
                    Save Order
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODAL CODE: FOR APPRENTICE ORDER EDITING ─── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingOrder(null);
            }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-xl p-6.5 w-full max-w-[480px] shadow-2xl flex flex-col gap-5 text-xs text-slate-600"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-sans text-base font-bold text-slate-800 flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-teal-600" />
                  <span>Edit Textile Order Record</span>
                </h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingOrder(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditOrder} className="flex flex-col gap-4">
                
                {/* Client & Status parameters */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Client Name
                    </label>
                    <input
                      id="edit-client-input"
                      type="text"
                      placeholder="e.g. Hassan Textiles"
                      required
                      value={editClient}
                      onChange={(e) => setEditClient(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Production Status
                    </label>
                    <select
                      id="edit-status-select"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Description parameters */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Brief Roll Work Description
                  </label>
                  <input
                    id="edit-desc-input"
                    type="text"
                    required
                    placeholder="e.g. Summer floral silk printing collection"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                  />
                </div>

                {/* Length and Rate parameter */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Roll Length (meters)
                    </label>
                    <input
                      id="edit-length-input"
                      type="number"
                      required
                      placeholder="e.g. 150"
                      value={editLength}
                      onChange={(e) => setEditLength(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Base Rate (Rs / meter)
                    </label>
                    <input
                      id="edit-rate-input"
                      type="number"
                      required
                      placeholder="e.g. 250"
                      value={editSellRate}
                      onChange={(e) => setEditSellRate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                    />
                  </div>
                </div>

                {/* Width and Print Rate parameters */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Roll Width (inches)
                    </label>
                    <input
                      id="edit-width-input"
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 54"
                      value={editWidth}
                      onChange={(e) => setEditWidth(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Print Rate (Rs / meter)
                    </label>
                    <input
                      id="edit-print-rate-input"
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 120"
                      value={editPrintRate}
                      onChange={(e) => setEditPrintRate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                    />
                  </div>
                </div>

                {/* File Size parameter (Optional) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    File Size (Optional)
                  </label>
                  <input
                    id="edit-file-size-input"
                    type="text"
                    placeholder="e.g. 250 MB, 1.2 GB (leave blank if none)"
                    value={editFileSize}
                    onChange={(e) => setEditFileSize(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-slate-800 px-3 py-2 text-xs focus:border-indigo-600 outline-none font-sans font-medium"
                  />
                </div>

                {/* Services toggles selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Production Services Needed
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[
                      { icon: <Layers className="w-3.5 h-3.5" />, label: "Fabric", key: "fabric" as const, activeClass: "border-teal-600 text-teal-700 bg-teal-50" },
                      { icon: <Palette className="w-3.5 h-3.5" />, label: "Design", key: "design" as const, activeClass: "border-pink-600 text-pink-700 bg-pink-50" },
                      { icon: <Scissors className="w-3.5 h-3.5" />, label: "Print", key: "print" as const, activeClass: "border-slate-400 text-slate-700 bg-slate-100" },
                    ].map((item) => {
                      const isActive = editServices[item.key];
                      return (
                        <button
                          key={item.key}
                          type="button"
                          id={`toggle-edit-${item.key}`}
                          onClick={() => toggleEditService(item.key)}
                          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg border transition-all text-[11px] font-sans font-bold cursor-pointer ${
                            isActive
                              ? item.activeClass
                              : "border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-450 bg-transparent"
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="border-t border-slate-100 pt-4 mt-1.5 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingOrder(null);
                    }}
                    className="px-4 py-2 bg-transparent hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-500 font-sans font-bold rounded-lg text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="update-order-button"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
                  >
                    <Check className="w-4 h-4" />
                    Update Order
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODAL CODE: CUSTOM RESILIENT DELETE CONFIRMATION ─── */}
      <AnimatePresence>
        {deletingOrderInstance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeletingOrderInstance(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-[400px] shadow-2xl flex flex-col gap-4 text-xs text-slate-600"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-full shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-sans text-sm font-bold text-slate-800">
                    Confirm Permanent Deletion
                  </h3>
                  <p className="text-slate-500 font-sans leading-relaxed text-[11px]">
                    Are you sure you want to delete the textile order for{" "}
                    <strong className="text-slate-800 font-extrabold text-xs">
                      {deletingOrderInstance.client}
                    </strong>
                    ? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeletingOrderInstance(null)}
                  className="px-4 py-2 bg-transparent hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-500 font-sans font-bold rounded-lg text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteOrder}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-sans font-bold rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-600/15"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Record
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TOAST NOTIFIER FOR ACTIONS ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 45 }}
            className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-emerald-400 px-5 py-3 rounded-lg text-xs font-sans font-semibold tracking-wide flex items-center gap-2 shadow-2xl z-50 pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
