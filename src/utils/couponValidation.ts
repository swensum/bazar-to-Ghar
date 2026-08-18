import { dbLite } from "../store/firebaselite";
import { collection, query, where, limit, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore/lite";
export const validateCoupon = async (couponCode: string, userEmail: string) => {
  try {
    // Check if user provided email
    if (!userEmail || !userEmail.includes('@')) {
      return { valid: false, message: "Please enter a valid email address to use coupon" };
    }

    const subscribersRef = collection(dbLite, "subscribers");
    const q = query(
      subscribersRef,
      where("email", "==", userEmail),
      where("coupon_code", "==", couponCode),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { valid: false, message: "Invalid coupon code or email" };
    }

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();

    if (data.coupon_used) {
      return { valid: false, message: "This coupon has already been used" };
    }

    // Mark coupon as used
    const subscriberRef = doc(dbLite, "subscribers", docSnap.id);
    await updateDoc(subscriberRef, {
      coupon_used: true,
      coupon_used_at: serverTimestamp(),
    });

    return { 
      valid: true, 
      message: "Coupon applied successfully! 20% discount applied.", 
      discount: 20,
      discountType: "percentage"
    };
  } catch (error) {
    console.error('Coupon validation error:', error);
    return { valid: false, message: "Error validating coupon. Please try again." };
  }
};