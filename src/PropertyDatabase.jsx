import React, { useState, useEffect } from 'react';
import { Search, Home, MapPin, Bed, Bath, Square, IndianRupee, Plus, Edit2, Trash2, X, Save } from 'lucide-react';

const PropertyDatabase = () => {
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('apartment');
  const [formLocation, setFormLocation] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStatus, setFormStatus] = useState('available');
  const [formBedrooms, setFormBedrooms] = useState('');
  const [formBathrooms, setFormBathrooms] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFeatures, setFormFeatures] = useState('');
  const [formAvailableFrom, setFormAvailableFrom] = useState('');
  const [formIsRental, setFormIsRental] = useState(false);

  // API Configuration - n8n webhooks with CORS proxy
  const CORS_PROXY = 'https://corsproxy.io/?';
  const API_CONFIG = {
    GET_ALL: CORS_PROXY + 'https://n8n-nikki-j977.onrender.com/webhook/a4fe9fac-7c6d-4ca1-8de0-83c240fa7ec5',
    ADD_PROPERTY: CORS_PROXY + 'https://n8n-nikki-j977.onrender.com/webhook/411ba450-22c1-46e9-8eca-272d1b101d26',
    UPDATE_PROPERTY: CORS_PROXY + 'https://n8n-nikki-j977.onrender.com/webhook/5a94a757-311c-4b99-82c6-6f72b5c1f898',
    DELETE_PROPERTY: CORS_PROXY + 'https://n8n-nikki-j977.onrender.com/webhook/a10b094c-bcb8-493f-b74d-4eed90276286'
  };

  // Load properties on mount
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_CONFIG.GET_ALL);
      const data = await response.json();
      
      console.log('API Response:', data); // Debug log
      
      // Handle different response formats
      if (data.properties) {
        setProperties(data.properties);
      } else if (Array.isArray(data)) {
        setProperties(data);
      } else {
        console.error('Unexpected response format:', data);
        setProperties([]);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      // Keep existing properties on error
    }
    setLoading(false);
  };

  const formatPrice = (price, isRental) => {
    if (isRental) {
      return `₹${parseInt(price).toLocaleString('en-IN')}/month`;
    }
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  };

  const filteredProperties = properties.filter(prop => {
    const matchesType = selectedType === 'all' || prop.type === selectedType;
    const matchesSearch = 
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const resetForm = () => {
    setFormId('');
    setFormTitle('');
    setFormType('apartment');
    setFormLocation('');
    setFormPrice('');
    setFormStatus('available');
    setFormBedrooms('');
    setFormBathrooms('');
    setFormArea('');
    setFormDescription('');
    setFormFeatures('');
    setFormAvailableFrom('');
    setFormIsRental(false);
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setFormId(`PROP${String(properties.length + 1).padStart(3, '0')}`);
    setShowForm(true);
  };

  const openEditForm = (property) => {
    setFormId(property.id);
    setFormTitle(property.title);
    setFormType(property.type);
    setFormLocation(property.location);
    setFormPrice(String(property.price));
    setFormStatus(property.status);
    setFormBedrooms(String(property.bedrooms));
    setFormBathrooms(String(property.bathrooms));
    setFormArea(String(property.area));
    setFormDescription(property.description);
    setFormFeatures(property.features);
    setFormAvailableFrom(property.availableFrom);
    setFormIsRental(property.isRental);
    setEditingId(property.id);
    setShowForm(true);
    setSelectedProperty(null);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSaveProperty = async () => {
    setLoading(true);
    
    const propertyData = {
      id: formId,
      title: formTitle,
      type: formType,
      location: formLocation,
      price: parseInt(formPrice),
      status: formStatus,
      bedrooms: parseInt(formBedrooms) || 0,
      bathrooms: parseInt(formBathrooms) || 0,
      area: parseInt(formArea) || 0,
      description: formDescription,
      features: formFeatures,
      availableFrom: formAvailableFrom,
      isRental: formIsRental
    };

    try {
      const url = editingId ? API_CONFIG.UPDATE_PROPERTY : API_CONFIG.ADD_PROPERTY;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData)
      });
      
      // Reload data from server
      await loadProperties();
      alert(editingId ? 'Property updated successfully!' : 'Property added successfully!');
    } catch (error) {
      console.error('Error saving property:', error);
      // Fallback: update local state
      if (editingId) {
        setProperties(properties.map(p => p.id === editingId ? propertyData : p));
        alert('Property updated locally (API error)');
      } else {
        setProperties([...properties, propertyData]);
        alert('Property added locally (API error)');
      }
    }

    setLoading(false);
    closeForm();
  };

  const handleDeleteProperty = async (propertyId) => {
    setLoading(true);
    
    try {
      await fetch(API_CONFIG.DELETE_PROPERTY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: propertyId })
      });
      
      // Reload data from server
      await loadProperties();
      alert('Property deleted successfully!');
    } catch (error) {
      console.error('Error deleting property:', error);
      // Fallback: update local state
      setProperties(properties.filter(p => p.id !== propertyId));
      alert('Property deleted locally (API error)');
    }
    
    setSelectedProperty(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Imperial Estates - Property Database</h1>
              <p className="text-gray-600">Manage your property listings</p>
            </div>
            <button
              onClick={openAddForm}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
            >
              <Plus size={20} />
              Add Property
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by property ID, title, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="apartment">Apartments</option>
              <option value="villa">Villas</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
        </div>

        {/* Property Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <div
              key={property.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">{property.title}</h3>
                    <p className="text-blue-100 text-sm">{property.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    property.status === 'available' ? 'bg-green-500 text-white' :
                    property.status === 'sold' ? 'bg-red-500 text-white' :
                    'bg-yellow-500 text-white'
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin size={16} className="mr-2 text-blue-500" />
                  <span className="text-sm">{property.location}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-2xl font-bold text-gray-800">
                    <IndianRupee size={24} className="text-green-600" />
                    <span>{formatPrice(property.price, property.isRental)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {property.bedrooms > 0 && (
                    <div className="flex items-center text-gray-600">
                      <Bed size={16} className="mr-1 text-blue-500" />
                      <span className="text-sm">{property.bedrooms} BHK</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Bath size={16} className="mr-1 text-blue-500" />
                    <span className="text-sm">{property.bathrooms} Bath</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Square size={16} className="mr-1 text-blue-500" />
                    <span className="text-sm">{property.area} sqft</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedProperty(property)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => openEditForm(property)}
                    className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteProperty(property.id)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Home size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Property Detail Modal */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedProperty(null)}>
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{selectedProperty.title}</h2>
                <p className="text-blue-100">{selectedProperty.id}</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Location</p>
                    <p className="font-semibold">{selectedProperty.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Price</p>
                    <p className="font-semibold text-green-600 text-xl">{formatPrice(selectedProperty.price, selectedProperty.isRental)}</p>
                  </div>
                  {selectedProperty.bedrooms > 0 && (
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Bedrooms</p>
                      <p className="font-semibold">{selectedProperty.bedrooms} BHK</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Bathrooms</p>
                    <p className="font-semibold">{selectedProperty.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Area</p>
                    <p className="font-semibold">{selectedProperty.area} sqft</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Available From</p>
                    <p className="font-semibold">{selectedProperty.availableFrom}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-2">Description</p>
                  <p className="text-gray-700">{selectedProperty.description}</p>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-2">Features & Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.features.split(',').map((feature, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {feature.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { openEditForm(selectedProperty); }}
                    className="flex-1 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
                  >
                    Edit Property
                  </button>
                  <button 
                    onClick={() => setSelectedProperty(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-3xl w-full my-8">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white rounded-t-lg">
                <h2 className="text-2xl font-bold">{editingId ? 'Edit Property' : 'Add New Property'}</h2>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property ID</label>
                    <input
                      type="text"
                      value={formId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      value={formBedrooms}
                      onChange={(e) => setFormBedrooms(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      value={formBathrooms}
                      onChange={(e) => setFormBathrooms(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft)</label>
                    <input
                      type="number"
                      value={formArea}
                      onChange={(e) => setFormArea(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
                    <input
                      type="date"
                      value={formAvailableFrom}
                      onChange={(e) => setFormAvailableFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma separated)</label>
                    <input
                      type="text"
                      value={formFeatures}
                      onChange={(e) => setFormFeatures(e.target.value)}
                      placeholder="Swimming Pool, Gym, Parking, Security"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formIsRental}
                        onChange={(e) => setFormIsRental(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">This is a rental property</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t flex gap-3">
                <button
                  onClick={handleSaveProperty}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Save Property
                </button>
                <button
                  onClick={closeForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDatabase
