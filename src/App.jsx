import React, { useState } from 'react';
import { Send, MapPin, Car, DollarSign, CheckCircle, AlertTriangle, CreditCard, Phone, Globe, Calendar, Link as LinkIcon } from 'lucide-react';

export default function BookingPortal() {
  const [status, setStatus] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');
  const [reviewLink, setReviewLink] = useState('');
  const [paymentType, setPaymentType] = useState('prepaid');

  const [formData, setFormData] = useState({
    confirmationNumber: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    logoUrl: '', 
    timezone: 'America/New_York', 
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

  const supplierVal = parseFloat(formData.supplierAmount || 0);
  const agencyVal = parseFloat(formData.agencyFee || 0);
  const totalTripCost = (supplierVal + agencyVal).toFixed(2);
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
      // Connects to your live Heroku backend
      const response = await fetch('https://carrentalemailservice-c73f9b7cf7b6.herokuapp.com/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, paymentType, amountToChargeNow }),
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
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          
          <div className="flex items-center gap-3 mb-8 border-b pb-4">
            <div className="bg-blue-600 p-3 rounded-lg text-white shadow-md"><Car size={28} /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">The Rental Radar</h1>
              <p className="text-sm text-gray-500">Agent Booking Portal</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECTION 1: GUEST DETAILS */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Phone size={16}/> Customer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Confirmation #</label>
                  <input required type="text" name="confirmationNumber" value={formData.confirmationNumber} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 123456" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Guest Name</label>
                  <input required type="text" name="guestName" value={formData.guestName} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Full Legal Name" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                  <input required type="email" name="guestEmail" value={formData.guestEmail} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="client@email.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                  <input required type="tel" name="guestPhone" value={formData.guestPhone} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            {/* BRANDING / LOGO */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
               <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-2"><LinkIcon size={12}/> Company Logo URL (Optional)</label>
               <input type="url" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="https://your-website.com/logo.png" />
               <p className="text-xs text-gray-400 mt-1">Paste a link to your logo. If left blank, the text "The Rental Radar" will be used.</p>
            </div>

            {/* SECTION 2: TRIP LOGISTICS */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16}/> Trip Details
                </h3>
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-blue-600"/>
                  <select name="timezone" value={formData.timezone} onChange={handleChange} className="text-xs p-1 border border-blue-300 rounded text-blue-800 bg-white outline-none">
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Phoenix">Arizona</option>
                    <option value="Pacific/Honolulu">Hawaii</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pickup */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-blue-600 uppercase">Pick-up</span>
                  <input required type="text" name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} className="w-full p-2 border border-blue-200 rounded text-sm" placeholder="City or Airport Code" />
                  <div className="relative">
                    <Calendar size={16} className="absolute left-2 top-2.5 text-gray-400"/>
                    <input required type="datetime-local" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="w-full p-2 pl-8 border border-blue-200 rounded text-sm text-gray-700" />
                  </div>
                </div>
                
                {/* Dropoff */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-blue-600 uppercase">Drop-off</span>
                  <input required type="text" name="dropoffLocation" value={formData.dropoffLocation} onChange={handleChange} className="w-full p-2 border border-blue-200 rounded text-sm" placeholder="City or Airport Code" />
                  <div className="relative">
                    <Calendar size={16} className="absolute left-2 top-2.5 text-gray-400"/>
                    <input required type="datetime-local" name="dropoffDate" value={formData.dropoffDate} onChange={handleChange} className="w-full p-2 pl-8 border border-blue-200 rounded text-sm text-gray-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: VEHICLE INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Vehicle Category</label>
                  <select name="vehicleCategory" value={formData.vehicleCategory} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                    <option>Compact Sedan</option>
                    <option>Mid-size Sedan</option>
                    <option>Full-size Sedan</option>
                    <option>Minivan</option>
                    <option>SUV (Mid-size)</option>
                    <option>SUV (Full-size)</option>
                    <option>Convertible</option>
                    <option>Luxury</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Model (or similar)</label>
                  <input required type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="w-full p-2 border rounded" placeholder="e.g. Toyota Corolla" />
               </div>
            </div>

            {/* SECTION 4: FINANCIALS */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
               <h3 className="font-semibold text-green-800 text-sm flex items-center gap-2 mb-3"><DollarSign size={16}/> Financials</h3>
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-green-700 mb-1">Supplier Cost</label>
                    <input required type="number" step="0.01" name="supplierAmount" value={formData.supplierAmount} onChange={handleChange} className="w-full p-2 border border-green-200 rounded" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs text-green-700 mb-1">Agency Fee</label>
                    <input required type="number" step="0.01" name="agencyFee" value={formData.agencyFee} onChange={handleChange} className="w-full p-2 border border-green-200 rounded" placeholder="0.00" />
                  </div>
               </div>

               <div className="bg-white p-3 rounded border border-green-100">
                 <div className="flex gap-4 mb-3 justify-center">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="ptype" checked={paymentType === 'prepaid'} onChange={() => setPaymentType('prepaid')} className="accent-green-600"/>
                      Full Prepayment
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="ptype" checked={paymentType === 'pay_at_counter'} onChange={() => setPaymentType('pay_at_counter')} className="accent-green-600"/>
                      Pay Supplier at Counter
                    </label>
                 </div>
                 <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-2">
                    <div className="text-xs text-gray-500">Total Trip Cost: <span className="font-bold text-gray-800">${totalTripCost}</span></div>
                    <div className="text-right">
                      <div className="text-xs text-green-600 font-bold uppercase">Charge Online Now</div>
                      <div className="text-xl font-black text-green-700">${amountToChargeNow}</div>
                      {paymentType === 'pay_at_counter' && <div className="text-xs text-red-500 font-medium">Due at Counter: ${amountDueAtCounter}</div>}
                    </div>
                 </div>
               </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button type="submit" disabled={status === 'loading' || status === 'success'} className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md disabled:opacity-50 transition-all flex justify-center items-center gap-2">
              {status === 'loading' ? 'Processing...' : 'Send Contract to Client'} <Send size={18}/>
            </button>

            {/* MESSAGES */}
            {status === 'error' && <div className="bg-red-50 text-red-700 p-3 rounded flex items-center gap-2 text-sm"><AlertTriangle size={16}/> {errorMessage}</div>}
            
            {status === 'success' && (
              <div className="bg-green-50 text-green-800 p-4 rounded border border-green-200 text-center">
                <CheckCircle size={32} className="text-green-600 mx-auto mb-2"/>
                <p className="font-bold">Success! Email Sent.</p>
                <p className="text-sm">Contract link sent to {formData.guestEmail}</p>
                {reviewLink && <a href={reviewLink} target="_blank" className="text-xs text-blue-600 underline mt-2 block">Open Review Page</a>}
              </div>
            )}

          </form>
      </div>
    </div>
  );
}
