import React, { useState, useEffect } from 'react';
import { Send, MapPin, Car, DollarSign, CheckCircle, AlertTriangle, Phone, Globe, Calendar, Link as LinkIcon, CreditCard, User, Mail, Hash, Briefcase, History, Trash2 } from 'lucide-react';

export default function BookingPortal() {
  // 🔴 CONFIGURATION
  const BACKEND_URL = 'https://carrentalmailpaypal-29674cf49d1b.herokuapp.com/'; 

  const [status, setStatus] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');
  const [reviewLink, setReviewLink] = useState('');
  const [paymentType, setPaymentType] = useState('prepaid');
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
  const [history, setHistory] = useState([]);

  // LOAD & CLEANUP HISTORY (30 DAYS)
  useEffect(() => {
    const rawHistory = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Filter: Keep only items newer than 30 days
    const validHistory = rawHistory.filter(item => {
        // If item has no timestamp (old version), keep it safe, otherwise check date
        return item.timestamp ? item.timestamp > thirtyDaysAgo : true;
    });

    // Update State and Storage if cleanup happened
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
  
  const amountToChargeNow = paymentType === 'prepaid' 
    ? totalTripCost 
    : agencyVal.toFixed(2);
    
  const amountDueAtCounter = paymentType === 'prepaid' 
    ? '0.00' 
    : supplierVal.toFixed(2);

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
        
        // SAVE TO HISTORY WITH TIMESTAMP
        const newRecord = {
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            guest: formData.guestName,
            conf: formData.confirmationNumber,
            amount: amountToChargeNow,
            link: result.link,
            timestamp: Date.now() // Critical for 30-day cleanup
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
        <div className="max-w-3xl mx-auto px-6 py-4">
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

      <div className="max-w-3xl mx-auto px-6 py-8">
        
        {/* === TAB 1: NEW RESERVATION === */}
        {activeTab === 'new' && (
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
                    </select>
                </div>
                </div>
                <div className="p-6 grid grid-cols-2 gap-8">
                <div className="space-y-3">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">PICK-UP</span>
                    <input required name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" placeholder="City or Airport" />
                    <input required type="datetime-local" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm text-slate-600" />
                </div>
                <div className="space-y-3">
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">DROP-OFF</span>
                    <input required name="dropoffLocation" value={formData.dropoffLocation} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" placeholder="City or Airport" />
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
