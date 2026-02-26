import React from 'react';

export default function AddedItems({ cart, updateQty, discountValue = 0, discountType = "percent" }) {
  // Calculate total 
  // const grandTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

 
 const discountAmt = discountType === "percent" 
    ? subtotal * (parseFloat(discountValue || 0) / 100)
    : parseFloat(discountValue || 0);

  //  GST 
  const totalGst = cart.reduce((acc, item) => {
    const itemSubtotal = item.price * item.qty;
    const itemShare = subtotal > 0 ? (itemSubtotal / subtotal) * discountAmt : 0;
    const itemTaxable = Math.max(0, itemSubtotal - itemShare);
    return acc + (itemTaxable * ((item.gst || 5) / 100));
  }, 0);

  const grandTotal = Math.max(0, subtotal - discountAmt) + totalGst;

  

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-2">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        {cart.length === 0 ? (
          <p className="text-slate-400 text-center py-4 italic text-sm font-medium">Click items on the left to add</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center font-medium text-sm bg-slate-50 p-2 rounded-lg">
              <div className="text-slate-600">
                <p className="font-semibold text-slate-800">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {/* Decrease Qty */}
                  <button 
                    onClick={() => updateQty(item.id, -1)}
                    className="w-6 h-6 flex items-center justify-center bg-white border border-slate-300 rounded hover:bg-red-50 hover:text-red-600"
                  > - </button>
                  
                  <span className="font-bold text-slate-900 w-4 text-center">{item.qty}</span>
                  
                  {/* Increase Qty */}
                  <button 
                    onClick={() => updateQty(item.id, 1)}
                    disabled={item.qty >= item.stock_qty} 
                    className={`w-6 h-6 flex items-center justify-center border rounded transition-colors ${
                      item.qty >= item.stock_qty
                        ? "bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed" 
                        : "bg-white border-slate-300 hover:bg-green-50 hover:text-green-600"
                    }`}
                    title={item.qty >= item.stock_qty ? "Out of stock" : "Add more"}
                  > + </button>
                  
                  <span className="text-xs text-black ml-1"> ₹{item.price}</span>
                 
                </div>
              </div>
              <span className="font-bold text-slate-900">₹{(item.qty * item.price).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      {/* <div className="border-t pt-4 flex justify-between items-center">
        <span className="text-slate-500 text-md font-medium">Total Amount</span>
        <span className="text-2xl font-black text-blue-600">₹{grandTotal.toFixed(2)}</span>
      </div>
    </div> */}


      <div className="border-t pt-4 space-y-2">
      <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        {discountAmt > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-bold bg-green-50 p-1 rounded">
            <span>Discount {discountType === "percent" ? `(${discountValue}%)` : ""}</span>
            <span>- ₹{discountAmt.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm text-slate-600">
          <span>Total GST </span>
          <span className="text-slate-800 font-medium">+ ₹{totalGst.toFixed(2)}</span>
        </div>


        <div className="flex justify-between items-center pt-2 border-t mt-2">
          <span className="text-slate-800 font-bold">Grand Total</span>
          <span className="text-2xl font-black text-blue-600">₹{grandTotal.toFixed(2)}</span>
        </div>
       
      </div>
    </div>
  );
}