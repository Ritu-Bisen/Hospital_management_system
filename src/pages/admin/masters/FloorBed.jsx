import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Save, Bed, Building, DoorOpen, Hash } from 'lucide-react';
import supabase from '../../../SupabaseClient';

const FloorBed = () => {
  const [floorBeds, setFloorBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFloorBed, setEditingFloorBed] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    serial_no: '',
    floor: '',
    ward: '',
    room: '',
    bed: ''
  });

  // Filter state
  const [filters, setFilters] = useState({
    floor: 'all',
    ward: 'all',
    room: 'all'
  });

  // Available options (extracted from existing data)
  const [availableOptions, setAvailableOptions] = useState({
    floors: [],
    wards: [],
    rooms: []
  });

  // Fetch floor bed data
  const fetchFloorBeds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('all_floor_bed')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setFloorBeds(data || []);
      
      // Extract unique options from data
      const floors = [...new Set(data?.map(item => item.floor).filter(Boolean))];
      const wards = [...new Set(data?.map(item => item.ward).filter(Boolean))];
      const rooms = [...new Set(data?.map(item => item.room).filter(Boolean))];
      
      setAvailableOptions({
        floors: floors.sort(),
        wards: wards.sort(),
        rooms: rooms.sort()
      });
    } catch (error) {
      console.error('Error fetching floor beds:', error);
      alert('Error loading floor bed data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloorBeds();
  }, []);

  // Filter floor beds based on search and filters
  const filteredFloorBeds = floorBeds.filter(item => {
    // Apply filters
    if (filters.floor !== 'all' && item.floor !== filters.floor) return false;
    if (filters.ward !== 'all' && item.ward !== filters.ward) return false;
    if (filters.room !== 'all' && item.room !== filters.room) return false;
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.serial_no?.toLowerCase().includes(searchLower) ||
        item.floor?.toLowerCase().includes(searchLower) ||
        item.ward?.toLowerCase().includes(searchLower) ||
        item.room?.toLowerCase().includes(searchLower) ||
        item.bed?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      serial_no: '',
      floor: '',
      ward: '',
      room: '',
      bed: ''
    });
    setEditingFloorBed(null);
  };

  // Open modal for adding/editing
  const openModal = (item = null) => {
    if (item) {
      setEditingFloorBed(item);
      setFormData({
        serial_no: item.serial_no || '',
        floor: item.floor || '',
        ward: item.ward || '',
        room: item.room || '',
        bed: item.bed || ''
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Validate form
  const validateForm = () => {
    if (!formData.floor.trim()) {
      alert('Floor is required');
      return false;
    }
    
    if (!formData.ward.trim()) {
      alert('Ward is required');
      return false;
    }
    
    if (!formData.room.trim()) {
      alert('Room is required');
      return false;
    }
    
    if (!formData.bed.trim()) {
      alert('Bed number is required');
      return false;
    }
    
    // Check for duplicates (same floor, ward, room, bed)
    const duplicate = floorBeds.find(
      item => 
        item.floor === formData.floor &&
        item.ward === formData.ward &&
        item.room === formData.room &&
        item.bed === formData.bed &&
        (!editingFloorBed || item.id !== editingFloorBed.id)
    );
    
    if (duplicate) {
      alert(`Bed ${formData.bed} already exists in ${formData.floor} - ${formData.ward} - ${formData.room}`);
      return false;
    }
    
    return true;
  };

  // Save floor bed
  const saveFloorBed = async () => {
    if (!validateForm()) return;

    try {
      const floorBedData = {
        serial_no: formData.serial_no.trim() || null,
        floor: formData.floor.trim(),
        ward: formData.ward.trim(),
        room: formData.room.trim(),
        bed: formData.bed.trim()
      };

      if (editingFloorBed) {
        // Update existing floor bed
        const { error } = await supabase
          .from('all_floor_bed')
          .update(floorBedData)
          .eq('id', editingFloorBed.id);

        if (error) throw error;
        alert('Floor bed updated successfully!');
      } else {
        // Insert new floor bed
        const { error } = await supabase
          .from('all_floor_bed')
          .insert([floorBedData]);

        if (error) throw error;
        alert('Floor bed added successfully!');
      }

      fetchFloorBeds();
      closeModal();
    } catch (error) {
      console.error('Error saving floor bed:', error);
      alert('Error saving floor bed');
    }
  };

  // Delete floor bed
  const deleteFloorBed = async (id) => {
    if (!window.confirm('Are you sure you want to delete this floor bed?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('all_floor_bed')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Floor bed deleted successfully!');
      fetchFloorBeds();
    } catch (error) {
      console.error('Error deleting floor bed:', error);
      alert('Error deleting floor bed');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      floor: 'all',
      ward: 'all',
      room: 'all'
    });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Floor & Bed Management</h1>
          <p className="text-gray-600 mt-1">Manage hospital floors, wards, rooms, and beds</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <Plus size={20} />
          Add New Bed
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by serial, floor, ward, room, or bed..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Floor
            </label>
            <select
              name="floor"
              value={filters.floor}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Floors</option>
              {availableOptions.floors.map(floor => (
                <option key={floor} value={floor}>{floor}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Ward
            </label>
            <select
              name="ward"
              value={filters.ward}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Wards</option>
              {availableOptions.wards.map(ward => (
                <option key={ward} value={ward}>{ward}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Room
            </label>
            <select
              name="room"
              value={filters.room}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Rooms</option>
              {availableOptions.rooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fixed Height Scrollable Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: '500px' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bed No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFloorBeds.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || Object.values(filters).some(f => f !== 'all')
                      ? 'No floor beds found matching your criteria'
                      : 'No floor beds found. Add your first bed!'}
                  </td>
                </tr>
              ) : (
                filteredFloorBeds.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{item.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.serial_no || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-700">{item.floor || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DoorOpen size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-700">{item.ward || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Hash size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-700">{item.room || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Bed size={16} className="text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {item.bed || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal(item)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteFloorBed(item.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingFloorBed ? 'Edit Bed Details' : 'Add New Bed'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Serial No */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial Number (Optional)
                </label>
                <input
                  type="text"
                  name="serial_no"
                  value={formData.serial_no}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter serial number"
                />
              </div>

              {/* Floor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor *
                </label>
                <select
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Floor</option>
                  {availableOptions.floors.map(floor => (
                    <option key={floor} value={floor}>{floor}</option>
                  ))}
                  <option value="custom">Add New Floor...</option>
                </select>
                {formData.floor === 'custom' && (
                  <input
                    type="text"
                    value={formData.floor === 'custom' ? '' : formData.floor}
                    onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter new floor"
                    autoFocus
                  />
                )}
              </div>

              {/* Ward */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ward *
                </label>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Ward</option>
                  {availableOptions.wards.map(ward => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                  <option value="custom">Add New Ward...</option>
                </select>
                {formData.ward === 'custom' && (
                  <input
                    type="text"
                    value={formData.ward === 'custom' ? '' : formData.ward}
                    onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter new ward"
                    autoFocus
                  />
                )}
              </div>

              {/* Room */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room *
                </label>
                <select
                  name="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Room</option>
                  {availableOptions.rooms.map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                  <option value="custom">Add New Room...</option>
                </select>
                {formData.room === 'custom' && (
                  <input
                    type="text"
                    value={formData.room === 'custom' ? '' : formData.room}
                    onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter new room"
                    autoFocus
                  />
                )}
              </div>

              {/* Bed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bed Number *
                </label>
                <input
                  type="text"
                  name="bed"
                  value={formData.bed}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter bed number"
                  required
                />
              </div>

              {/* Preview */}
           
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={saveFloorBed}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 inline-flex items-center gap-2"
              >
                <Save size={18} />
                {editingFloorBed ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorBed;