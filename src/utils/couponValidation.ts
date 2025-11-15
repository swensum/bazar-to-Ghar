import { supabase } from "../store/supabase";

export const validateCoupon = async (couponCode: string, userEmail: string) => {
  try {
    // Check if user provided email
    if (!userEmail || !userEmail.includes('@')) {
      return { valid: false, message: "Please enter a valid email address to use coupon" };
    }

    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', userEmail)
      .eq('coupon_code', couponCode)
      .single();

    if (error) throw error;

    if (!data) {
      return { valid: false, message: "Invalid coupon code or email" };
    }

    if (data.coupon_used) {
      return { valid: false, message: "This coupon has already been used" };
    }

    // Mark coupon as used
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ 
        coupon_used: true,
        coupon_used_at: new Date().toISOString()
      })
      .eq('email', userEmail)
      .eq('coupon_code', couponCode);

    if (updateError) throw updateError;

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