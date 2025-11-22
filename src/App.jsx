import React, { useState } from 'react';
import { Send, MapPin, Car, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';

export default function BookingPortal() {
  const [status, setStatus] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentLink, setPaymentLink] = useState('');

  // CHANGED: Default data is now EMPTY, ready for any customer
  const [formData, setFormData] = useState({
    confirmationNumber: '',
    guestName: '',
    guestEmail: '',
    pickupLocation: '',
    pickupDate: '',
    dropoffLocation: '',
    dropoffDate: '',
    vehicleCategory: 'Compact Sedan', // Default selection
    vehicleModel: '',
    supplierName: 'Enterprise Rent A Car', // Default selection
    supplierAmount: '',
    agencyFee: ''
  });

  const totalAmount = (parseFloat(formData.supplierAmount || 0) + parseFloat(formData.agencyFee || 0)).toFixed(2);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    setPaymentLink('');

    try {
      // Connects to your live Heroku server
      const response = await fetch('https://carrentalemailservice-c73f9b7cf7b6.herokuapp.com/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus('success');
        setPaymentLink(result.link);
        
        // Optional: Clear form after success so it's ready for the next customer?
        // setFormData({ ...formData, confirmationNumber: '', guestName: '', guestEmail: '' }); 
        
        setTimeout(() => setStatus('idle'), 10000);
      } else {
        throw new Error(result.error || 'Failed to create booking');
      }

    } catch (error) {
      console.error("Booking Error:", error);
      setStatus('error');
      setErrorMessage(error.message || "Server is not responding. Check API keys.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: INPUT FORM */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Car size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">New Reservation</h1>
              <p className="text-sm text-gray-500">Enter details to generate payment link & email.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Guest Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Confirmation #</label>
                <input required type="text" name="confirmationNumber" value={formData.confirmationNumber} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 123456789" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Guest Name</label>
                <input required type="text" name="guestName" value={formData.guestName} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Full Name" />
              </div>
            </div>
            
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Guest Email</label>
                <input required type="email" name="guestEmail" value={formData.guestEmail} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="guest@example.com" />
            </div>

            {/* Locations & Dates */}
            <div className="p-4 bg-blue-50 rounded-lg space-y-3 border border-blue-100">
              <h3 className="font-semibold text-blue-800 text-sm flex items-center gap-2"><MapPin size={16}/> Trip Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-blue-600 mb-1">Pick-up</label>
                  <input required type="text" name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} className="w-full p-2 border border-blue-200 rounded text-sm mb-2" placeholder="City, State" />
                  <input required type="datetime-local" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="w-full p-2 border border-blue-200 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-blue-600 mb-1">Drop-off</label>
                  <input required type="text" name="dropoffLocation" value={formData.dropoffLocation} onChange={handleChange} className="w-full p-2 border border-blue-200 rounded text-sm mb-2" placeholder="City, State" />
                  <input required type="datetime-local" name="dropoffDate" value={formData.dropoffDate} onChange={handleChange} className="w-full p-2 border border-blue-200 rounded text-sm" />
                </div>
              </div>
            </div>

            {/* Vehicle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Vehicle Category</label>
                  <select name="vehicleCategory" value={formData.vehicleCategory} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                    <option>Compact Sedan</option>
                    <option>Mid-size Sedan</option>
                    <option>Minivan</option>
                    <option>SUV</option>
                    <option>Luxury</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Model (or similar)</label>
                  <input required type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="w-full p-2 border rounded" placeholder="e.g. Toyota Corolla" />
               </div>
            </div>

            {/* Financials */}
            <div className="p-4 bg-green-50 rounded-lg space-y-3 border border-green-100">
               <h3 className="font-semibold text-green-800 text-sm flex items-center gap-2"><DollarSign size={16}/> Payment Split</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-green-700 mb-1">Supplier Amount ($)</label>
                    <input required type="number" step="0.01" name="supplierAmount" value={formData.supplierAmount} onChange={handleChange} className="w-full p-2 border border-green-200 rounded" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs text-green-700 mb-1">Agency Fee ($)</label>
                    <input required type="number" step="0.01" name="agencyFee" value={formData.agencyFee} onChange={handleChange} className="w-full p-2 border border-green-200 rounded" placeholder="0.00" />
                  </div>
               </div>
               <div className="flex justify-between items-center pt-2 border-t border-green-200">
                  <span className="text-sm font-medium text-green-800">Total to Charge:</span>
                  <span className="text-xl font-bold text-green-700">${totalAmount}</span>
               </div>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-3">
              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-2">
                  <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Submission Failed</p>
                    <p className="text-xs">{errorMessage}</p>
                  </div>
                </div>
              )}

              {status === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <span className="font-bold text-sm">Success! Email Sent.</span>
                  </div>
                  <p className="text-xs text-green-700 mb-2">
                    Payment link created and email sent to <strong>{formData.guestEmail}</strong>.
                  </p>
                  {paymentLink && (
                    <div className="text-xs break-all bg-white p-2 border border-green-200 rounded">
                      <strong>Stripe Link:</strong> <a href={paymentLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">{paymentLink}</a>
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                disabled={status === 'loading' || status === 'success'}
                className={`w-full py-3 px-6 rounded-lg font-bold text-white flex justify-center items-center gap-2 transition-all shadow-md ${
                  status === 'success' ? 'bg-green-600 cursor-default' : status === 'loading' ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {status === 'loading' ? 'Creating Link...' : status === 'success' ? 'Sent Successfully' : 'Create Payment Link & Send Email'}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="hidden lg:block bg-gray-200 p-4 rounded-xl border border-gray-300 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
          <h2 className="text-sm font-bold text-gray-500 uppercase mb-3 tracking-wider text-center">Customer Email Preview</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden text-sm leading-relaxed h-full max-h-[800px] overflow-y-auto transform scale-95 origin-top">
            {/* PREVIEW CONTENT UPDATES DYNAMICALLY AS YOU TYPE */}
            <div className="bg-blue-50 p-6 border-b border-blue-100">
               <h2 className="text-blue-800 text-xl font-bold">Reservation Pending</h2>
               <p className="text-gray-600 mt-1"><strong>Confirmation:</strong> {formData.confirmationNumber || "PENDING"}</p>
               <p className="text-gray-600"><strong>Guest:</strong> {formData.guestName || "Guest Name"}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <p>Dear {formData.guestName ? formData.guestName.split(' ')[0] : "Guest"},</p>
              <p>Thank you for choosing <strong>LF Tours Rent a Car</strong>.</p>

              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                 <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                       <div className="text-xs text-gray-500 uppercase font-bold">Pick-up</div>
                       <div>{formData.pickupLocation || "..."}</div>
                       <div className="text-blue-600 font-medium">{formData.pickupDate ? new Date(formData.pickupDate).toLocaleString() : "..."}</div>
                    </div>
                    <div>
                       <div className="text-xs text-gray-500 uppercase font-bold">Drop-off</div>
                       <div>{formData.dropoffLocation || "..."}</div>
                       <div className="text-blue-600 font-medium">{formData.dropoffDate ? new Date(formData.dropoffDate).toLocaleString() : "..."}</div>
                    </div>
                 </div>
                 <div className="border-t pt-3 mt-2">
                    <div className="text-xs text-gray-500 uppercase font-bold">Vehicle</div>
                    <div className="font-medium">{formData.vehicleCategory}: {formData.vehicleModel || "..."} (or similar)</div>
                 </div>
              </div>

              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                 <div className="flex justify-between font-bold text-gray-800 border-t pt-2">
                   <span>TOTAL DUE</span>
                   <span>${totalAmount}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
