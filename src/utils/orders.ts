import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore/lite";
import { dbLite } from "../store/firebaselite";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedPackage?: string;
}

export interface OrderRecord {
  id?: string;
  userId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  area?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCharge: number;
  discount: number;
  grandTotal: number;
  paymentMethod: "esewa";
  transactionCode: string;
  transactionUuid: string;
  totalAmountPaid: number;
  status: "paid";
  createdAt?: any;
}

export async function saveOrder(order: Omit<OrderRecord, "createdAt" | "id">) {
  const docRef = await addDoc(collection(dbLite, "orders"), {
    ...order,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserOrders(userId: string): Promise<OrderRecord[]> {
  const q = query(
    collection(dbLite, "orders"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderRecord) }));
}