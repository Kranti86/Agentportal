import React, { useState } from 'react';
import { Send, MapPin, Car, DollarSign, CheckCircle, AlertTriangle, CreditCard } from 'lucide-react';

export default function BookingPortal() {
  const [status, setStatus] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');
  const [reviewLink, setReviewLink] = useState('');

  // New State for Payment Type
  const [paymentType, setPaymentType] = useState('prepaid'); // 'prepaid' or 'pay_at_counter'

  const [formData, setFormData] = useState({
    confirmationNumber: '',
    guestName: '',
    guestEmail: '',
    pickupLocation: '',
    pickupDate: '',
    dropoffLocation: '',
    dropoffDate: '',
    vehicleCategory: 'Compact Sedan',
    vehicleModel: '',
    supplierName: 'Enterprise Rent A Car',
    supplierAmount: '',
    agencyFee: ''
  });

  // Financial Calculations
  const supplierVal = parseFloat(formData.supplierAmount || 0);
  const agencyVal = parseFloat(formData.agencyFee || 0);
  const totalTripCost = (supplierVal + agencyVal).toFixed(2);

  // Determine what is charged online based on selection
  const amountToChargeNow = paymentType === 'prepaid' ? totalTripCost : agencyVal.toFixed(2);
  const amountDueAtCounter = paymentType === 'prepaid' ? '0.00' : supplierVal.toFixed(2);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    setReviewLink('');

    try {
      const response = await fetch('https://carrentalemailservice-c73f9b7cf7b6.herokuapp.com/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          paymentType, // Send the selection to the server
          amountToChargeNow // Explicitly tell server what to charge
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus('success');
        setReviewLink(result.link); 
        setTimeout(() => setStatus('idle'), 20000);
      } else {
        throw new Error(result.error || 'Failed to create booking');
      }

    } catch (error) {
      console.error("Booking Error:", error);
      setStatus('error');
      setErrorMessage(error.message || "Server Error.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <div className="bg-blue-600 p-2 rounded-lg text-white"><Car size={24} /></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">New Reservation</h1>
              <p className="text-sm text-gray-500">Generates Contract & Payment Link</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... Existing Input Fields ... */}
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" name="confirmationNumber" value={formData.confirmationNumber} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Confirmation #" />
              <input required type="text" name="guestName" value={formData.guestName} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Guest Name" />
            </div>
            <input required type="email" name="guestEmail" value={formData.guestEmail} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Guest Email" />
            
            <div className="grid grid-cols-2 gap-4">
               <input required type="text" name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Pick-up Location" />
               <input required type="text" name="dropoffLocation" value={formData.dropoffLocation} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Drop-off Location" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <input required type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Vehicle Model" />
               <input required type="number" step="0.01" name="supplierAmount" value={formData.supplierAmount} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Supplier Cost ($)" />
            </div>
             <input required type="number" step="0.01" name="agencyFee" value={formData.agencyFee} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Agency Fee ($)" />

            {/* PAYMENT TYPE TOGGLE */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><CreditCard size={18}/> Payment Mode</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="ptype" 
                    checked={paymentType === 'prepaid'} 
                    onChange={() => setPaymentType('prepaid')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">Full Prepayment</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="ptype" 
                    checked={paymentType === 'pay_at_counter'} 
                    onChange={() => setPaymentType('pay_at_counter')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">Pay Supplier at Counter</span>
                </label>
              </div>

              {/* DYNAMIC TOTALS DISPLAY */}
              <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Total Trip Cost</span>
                  <span className="font-bold text-gray-800 text-lg">${totalTripCost}</span>
                </div>
                <div className="text-right">
                  <span className="text-blue-600 block font-bold">Charge Online Now</span>
                  <span className="font-black text-blue-700 text-xl">${amountToChargeNow}</span>
                  {paymentType === 'pay_at_counter' && (
                    <span className="text-xs text-orange-600 block mt-1">Due at Counter: ${amountDueAtCounter}</span>
                  )}
                </div>
              </div>
            </div>

            {/* STATUS MESSAGES */}
            {status === 'error' && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{errorMessage}</p>}
            
            {status === 'success' && (
              <div className="bg-green-50 text-green-800 p-4 rounded border border-green-200">
                <p className="font-bold flex items-center gap-2"><CheckCircle size={18}/> Sent Successfully!</p>
                <p className="text-sm mt-1">Contract link sent to <strong>{formData.guestEmail}</strong>.</p>
                <div className="mt-2 text-xs bg-white p-2 border rounded break-all">
                   <strong>Review Link:</strong> <a href={reviewLink} target="_blank" className="text-blue-600 underline">{reviewLink}</a>
                </div>
              </div>
            )}

            <button type="submit" disabled={status === 'loading' || status === 'success'} className="w-full py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:opacity-50">
              {status === 'loading' ? 'Processing...' : `Send Contract for $${amountToChargeNow}`}
            </button>
          </form>
      </div>
    </div>
  );
}
