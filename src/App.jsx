import React, { useState, useEffect } from 'react';
import { Send, MapPin, Car, DollarSign, CheckCircle, AlertTriangle, Phone, Globe, Calendar, Link as LinkIcon, CreditCard, User, Mail, Hash, Briefcase, History, Trash2 } from 'lucide-react';

export default function BookingPortal() {
  // 🔴 CONFIGURATION: Replace with your actual Backend URL
  const BACKEND_URL = 'https://carrentalemailservice-c73f9b7cf7b6.herokuapp.com'; 

  const [status, setStatus] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');
  const [reviewLink, setReviewLink] = useState('');
  const [paymentType, setPaymentType] = useState('prepaid');
  const [activeTab, setActiveTab] = useState('new'); 
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const rawHistory = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const validHistory = rawHistory.filter(item => item.timestamp ? item.timestamp > thirtyDaysAgo : true);
    setHistory(validHistory);
    if (rawHistory.length !== validHistory.length) {
        localStorage.setItem('bookingHistory', JSON.stringify(validHistory));
    }
    const savedAgent = localStorage.getItem('agentName');
    if (savedAgent) setFormData(prev => ({ ...prev, agentName: savedAgent }));
  }, []);

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
    supplierName: '',
    supplierAmount: '',
    agencyFee: '',
    agentName: '',
    agentCommission: ''
  });

  const supplierVal = parseFloat(formData.supplierAmount || 0);
  const agencyVal = parseFloat(formData.agencyFee || 0);
  const totalTripCost = (supplierVal + agencyVal).toFixed(2);
  const amountToChargeNow = paymentType === 'prepaid' ? totalTripCost : agencyVal.toFixed(2);
  const amountDueAtCounter = paymentType === 'prepaid' ? '0.00' : supplierVal.toFixed(2);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'agentName') localStorage.setItem('agentName', e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    setReviewLink('');

    try {
      const response = await fetch(`${BACKEND_URL}/create-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, paymentType, amountToChargeNow }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus('success');
        setReviewLink(result.link); 
        
        const newRecord = {
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            guest: formData.guestName,
            conf: formData.confirmationNumber,
            amount: amountToChargeNow,
            link: result.link,
            timestamp: Date.now()
        };
        const updatedHistory = [newRecord, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('bookingHistory', JSON.stringify(updatedHistory));

        setTimeout(() => setStatus('idle'), 20000);
      } else {
        throw new Error(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error("Booking Error:", error);
      setStatus('error');
      setErrorMessage(error.message || "Server Error. Check API connection.");
    }
  };

  const clearHistory = () => {
      if(confirm("Are you sure you want to clear your local sales history?")) {
          setHistory([]);
          localStorage.removeItem('bookingHistory');
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2.5 rounded-lg text-white shadow-blue-200 shadow-md">
                        <Car size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">The Rental Radar</h1>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Agent Booking Console</p>
                    </div>
                </div>
                {/* TAB SWITCHER */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('new')}
                        className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        New Booking
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <History size={14}/> Sales Log (30 Days)
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* === TAB 1: NEW RESERVATION === */}
        {activeTab === 'new' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT SIDE: FORM */}
            <div className="lg:col-span-2">
               <form onSubmit={handleSubmit} className="space-y-6">

            {/* 1. AGENT INTERNAL */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-2">
                <Briefcase size={18} className="text-slate-400"/>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Agent Internal</h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-5">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Agent Name</label>
                    <input required name="agentName" value={formData.agentName} onChange={handleChange} className="w-full p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="Your Name" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Commission ($)</label>
                    <input name="agentCommission" value={formData.agentCommission} onChange={handleChange} className="w-full p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="Hidden from Client" />
                </div>
                </div>
            </div>

            {/* 2. CLIENT INFO */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-2">
                <User size={18} className="text-slate-400"/>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Client Information</h3>
                </div>
                <div className="p-6 grid gap-5">
                <div className="grid grid-cols-2 gap-5">
                    <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Confirmation #</label>
                    <input required name="confirmationNumber" value={formData.confirmationNumber} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg" placeholder="123456" />
                    </div>
                    <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Guest Name</label>
                    <input required name="guestName" value={formData.guestName} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg" placeholder="Full Legal Name" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                    <input required type="email" name="guestEmail" value={formData.guestEmail} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg" placeholder="Email Address" />
                    <input required type="tel" name="guestPhone" value={formData.guestPhone} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg" placeholder="Phone Number" />
                </div>
                </div>
            </div>

            {/* 3. TRIP DETAILS */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-slate-400"/>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Itinerary</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Globe size={14} className="text-blue-500"/>
                    <select name="timezone" value={formData.timezone} onChange={handleChange} className="text-xs bg-transparent border-none text-blue-600 font-medium cursor-pointer">
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="America/Phoenix">Arizona</option>
                    <option value="Pacific/Honolulu">Hawaii</option>
                    </select>
                </div>
                </div>
                <div className="p-6 grid grid-cols-2 gap-8">
                <div className="space-y-3">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">PICK-UP</span>
                    <input required name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" placeholder="City/Airport" />
                    <input required type="datetime-local" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm text-slate-600" />
                </div>
                <div className="space-y-3">
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">DROP-OFF</span>
                    <input required name="dropoffLocation" value={formData.dropoffLocation} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" placeholder="City/Airport" />
                    <input required type="datetime-local" name="dropoffDate" value={formData.dropoffDate} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm text-slate-600" />
                </div>
                </div>
            </div>

            {/* 4. FINANCIALS */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-2">
                <DollarSign size={18} className="text-slate-400"/>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Financials</h3>
                </div>
                <div className="p-6 space-y-6">
                <div className="col-span-2 mb-4">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Supplier Name</label>
                    <input required name="supplierName" value={formData.supplierName} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg" placeholder="e.g. Hertz, Avis" />
                </div>
                <div className="col-span-2 mb-4">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Vehicle Model</label>
                    <input required name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg" placeholder="e.g. Toyota Corolla" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                    <input required type="number" step="0.01" name="supplierAmount" value={formData.supplierAmount} onChange={handleChange} className="w-full p-2.5 border border-green-200 rounded-lg" placeholder="Supplier Cost $" />
                    <input required type="number" step="0.01" name="agencyFee" value={formData.agencyFee} onChange={handleChange} className="w-full p-2.5 border border-green-200 rounded-lg" placeholder="Agency Fee $" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => setPaymentType('prepaid')} className={`cursor-pointer border rounded-xl p-4 text-center ${paymentType === 'prepaid' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200'}`}>
                        <span className="font-bold text-sm text-slate-700">Full Prepayment</span>
                    </div>
                    <div onClick={() => setPaymentType('pay_at_counter')} className={`cursor-pointer border rounded-xl p-4 text-center ${paymentType === 'pay_at_counter' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200'}`}>
                        <span className="font-bold text-sm text-slate-700">Pay at Counter</span>
                    </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 flex justify-between items-center">
                    <div className="text-xs text-slate-500 font-bold uppercase">Total Trip: <span className="text-slate-900">${totalTripCost}</span></div>
                    <div className="text-right">
                        <span className="text-xs text-green-600 font-bold uppercase">Charge Now</span>
                        <div className="text-2xl font-black text-green-600">${amountToChargeNow}</div>
                    </div>
                </div>
                </div>
            </div>

            {/* LOGO */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-blue-600" onClick={() => document.getElementById('logoInput').classList.toggle('hidden')}>
                    <LinkIcon size={12}/> Add Custom Logo URL
                </div>
                <input id="logoInput" type="url" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="hidden mt-2 w-full p-2 text-xs border rounded text-center" placeholder="https://logo.png" />
            </div>

            {/* SUBMIT */}
            <button type="submit" disabled={status === 'loading' || status === 'success'} className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
                {status === 'loading' ? 'Generating...' : `Send Payment Link ($${amountToChargeNow})`} 
                {!status.includes('loading') && <Send size={20}/>}
            </button>

            {status === 'success' && (
                <div className="bg-green-50 text-green-800 p-6 rounded-lg text-center mt-4">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-2"/>
                <p className="font-bold">Success!</p>
                <a href={reviewLink} target="_blank" className="text-sm font-bold text-blue-600 underline">Open Link</a>
                </div>
            )}

            </form>
            </div>

            {/* RIGHT SIDE: PREVIEW */}
            <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 text-center">Customer Email Preview</h3>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden text-sm">
                        <div className="bg-blue-800 p-4 text-white text-center">
                            <div className="font-bold text-lg">THE RENTAL RADAR</div>
                            <div className="text-xs opacity-80 mt-1">CONFIRMATION #{formData.confirmationNumber || "..."}</div>
                        </div>
                        <div className="p-4 space-y-3">
                            <p className="text-gray-600">Dear {formData.guestName.split(' ')[0] || "Guest"},</p>
                            <div className="bg-gray-50 p-3 rounded border border-gray-100 text-xs space-y-2">
                                <div className="font-bold text-gray-700 border-b pb-1 mb-1">ITINERARY ({formData.timezone})</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-gray-400 font-bold uppercase" style={{fontSize: '0.65rem'}}>Pick-up</div>
                                        <div>{formData.pickupLocation || "..."}</div>
                                        <div className="text-blue-600">{formData.pickupDate ? new Date(formData.pickupDate).toLocaleString() : ""}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 font-bold uppercase" style={{fontSize: '0.65rem'}}>Drop-off</div>
                                        <div>{formData.dropoffLocation || "..."}</div>
                                        <div className="text-blue-600">{formData.dropoffDate ? new Date(formData.dropoffDate).toLocaleString() : ""}</div>
                                    </div>
                                </div>
                                <div className="border-t pt-2">
                                    <div className="text-gray-400 font-bold uppercase" style={{fontSize: '0.65rem'}}>Vehicle provided by: {formData.supplierName || "..."}</div>
                                    <div className="font-medium text-gray-800">{formData.vehicleCategory}: {formData.vehicleModel || "..."}</div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded border border-gray-100 text-xs">
                                <div className="flex justify-between"><span>Total Trip Cost:</span> <strong>${totalTripCost}</strong></div>
                                <div className="flex justify-between text-red-500 mt-1"><span>Payable to {formData.supplierName || "Supplier"}:</span> <strong>${amountDueAtCounter}</strong></div>
                                <div className="flex justify-between text-green-600 font-bold mt-2 border-t pt-2"><span>DUE NOW:</span> <span>${amountToChargeNow}</span></div>
                            </div>
                            <div className="bg-blue-600 text-white text-center py-2 rounded font-bold text-xs mt-2">
                                REVIEW CONTRACT & PAY ${amountToChargeNow}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
        )}

        {/* === TAB 2: HISTORY === */}
        {activeTab === 'history' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Last 30 Days Activity</h3>
                    <button onClick={clearHistory} className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1">
                        <Trash2 size={12}/> Clear Log
                    </button>
                </div>
                
                {history.length === 0 ? (
                    <div className="p-12 text-center">
                        <History size={48} className="text-slate-200 mx-auto mb-3"/>
                        <p className="text-slate-400 text-sm">No sales recorded on this device yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Guest</th>
                                    <th className="px-6 py-3">Conf #</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                    <th className="px-6 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 text-slate-500">
                                            <div className="font-medium text-slate-700">{item.date}</div>
                                            <div className="text-xs">{item.time}</div>
                                        </td>
                                        <td className="px-6 py-3 font-medium text-slate-900">{item.guest}</td>
                                        <td className="px-6 py-3 font-mono text-slate-500 text-xs">{item.conf}</td>
                                        <td className="px-6 py-3 text-right font-bold text-green-600">${item.amount}</td>
                                        <td className="px-6 py-3 text-center">
                                            <a href={item.link} target="_blank" className="text-blue-600 hover:text-blue-800 font-semibold text-xs">View Contract</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
}
