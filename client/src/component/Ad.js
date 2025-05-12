import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DeleteRecordModal from './DeleteRecordModal';
import './style.css'; // Custom CSS

//Created by Sameer Mude
function Ads({ userId }) {
  const value = process.env.REACT_APP_ADDRESS;
  const [companies, setCompanies] = useState([]);
  const [inidata, setInidata] = useState({ address: [], category: [], pettype: [] });
  const [savedAd, setSavedAd] = useState([]);
  const [formData, setFormData] = useState({
    companyId: '',
    categoryid: '',
    addressid: '',
    pettypeid: '',
    adtitle: '',
    addescription: '',
    images: [''],
    userId: userId
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingAd, setEditingAd] = useState(null);
  const [deleteid, setDeleteId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRefs = useRef([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const abc = process.env.REACT_APP_API_BASE_URL;

    fetchCompanies();
    GetInitialdata();
    fetchSavedAd();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, userId }));
  }, [userId]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_ADDRESS + `/api/getdata/-1/Company/${userId}`);
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const GetInitialdata = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_ADDRESS + `/api/data/all/Ad/${userId}`);
      setInidata(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSavedAd = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_ADDRESS + `/api/getdata/-1/Ad/${userId}`);
      setSavedAd(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const validateControl = (values) => {
    const errors = {};
    if (!values.adtitle.trim()) errors.adtitle = "Enter the ad title";
    if (!values.addescription.trim()) errors.addescription = "Enter the ad description";
    if (!values.companyId) errors.companyId = "Select a company";
    if (!values.pettypeid) errors.pettypeid = "Select a pet type";
    if (!values.categoryid) errors.categoryid = "Select a category";
    if (!values.addressid) errors.addressid = "Select a address";
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedImages = [...formData.images];
        updatedImages[index] = reader.result;
        setFormData({ ...formData, images: updatedImages });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImage = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({ ...formData, images: updatedImages });
    fileInputRefs.current.splice(index, 1);
  };

  const handleClear = () => {
    setFormData({
      companyId: '',
      categoryid: '',
      addressid: '',
      pettypeid: '',
      adtitle: '',
      addescription: '',
      images: [''],
      userId: userId
    });
    setEditingAd(null);
    setFormErrors({});
    fileInputRefs.current = [];
  };

  function base64ToFile(base64, filename) {
    const match = base64.match(/^data:(.*);base64,/);
    if (!match) {
      console.error("Invalid base64 string:", base64);
      return null; // or throw an error or handle differently
    }

    const mimeType = match[1]; // image/png, etc.
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);

    return new File([byteArray], filename, { type: mimeType });
  }


  const handleSubmit = async () => {
    const type = "Ad";
    const errors = validateControl(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {

        const fd = new FormData();
        fd.append('companyId', formData.companyId);
        fd.append('categoryid', formData.categoryid);
        fd.append('addressid', formData.addressid);
        fd.append('pettypeid', formData.pettypeid);
        fd.append('adtitle', formData.adtitle);
        fd.append('addescription', formData.addescription);
        fd.append('userId', formData.userId);

        formData.images.forEach((image, index) => {
          if (image) {
            if (image.startsWith('data:image')) {
              // Handle base64 images
              const mimeTypeMatch = image.match(/data:(.*);base64/);
              if (mimeTypeMatch && mimeTypeMatch[1]) {
                const mimeType = mimeTypeMatch[1];
                const file = base64ToFile(image, `image${index}.png`, mimeType);
                if (file) {
                  fd.append('images', file);
                }
              }
            } else if (image.startsWith('/uploads/')) {
              // If the image is a URL, append it directly
              fd.append('images', image);
            }
          }
        });

        if (!formData._id) {
          const res = await axios.post(process.env.REACT_APP_ADDRESS + '/api/ads', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          //await axios.post(`http://localhost:5000/api/save/${type}`, formData);
        } else {
          const res = await axios.put(process.env.REACT_APP_ADDRESS + `/api/ads1/${formData._id}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          //await axios.put(`http://localhost:5000/api/update/${formData._id}/${type}`, formData);
        }

        Swal.fire({ icon: 'success', title: 'Success', text: 'Data saved successfully.' });
        fetchSavedAd();
        handleClear();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: "An error occurred while saving the ad." });
      }
    } else {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: "Please fill all required fields." });
    }
  };

  const handleEdit = (ad) => {
    setFormData({
      companyId: ad.companyId?._id || '',
      categoryid: ad.categoryid?._id || '',
      addressid: ad.addressid?._id || '',
      pettypeid: ad.pettypeid?._id || '',
      adtitle: ad.adtitle || '',
      addescription: ad.addescription || '',
      images: ad.images || [''],
      userId: ad.userId || userId,
      _id: ad._id,
    });
    setEditingAd(ad);
  };

  const handleDelete = (ad) => {
    setDeleteId(ad._id);
    openModal();
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(process.env.REACT_APP_ADDRESS + `/api/delete/${deleteid}/Ad`);
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'Ad deleted successfully.' });
      fetchSavedAd();
    } catch (error) {
      console.error('Delete error:', error);
    }
    closeModal();
  };

  const handleCloseAd = async (adId, shouldClose) => {
    try {
      await axios.put(process.env.REACT_APP_ADDRESS + `/api/adclose/${adId}`, { adclose: shouldClose });
      Swal.fire({
        icon: 'success',
        title: shouldClose ? 'Ad Closed' : 'Ad Reopened',
        text: shouldClose ? 'Ad marked as closed.' : 'Ad reopened successfully.'
      });
      fetchSavedAd();
    } catch (error) {
      console.error('Error toggling ad status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${shouldClose ? 'close' : 'unclose'} the ad.`
      });
    }
  };

  return (
    <div className="container mt-4">
      <div className="bg-primary text-white text-center py-2 rounded mb-4">
        <strong style={{ fontSize: '1rem' }}>Ads Detail</strong>
      </div>

      {/* Selects */}
      <div className="row mb-3">
        <label className="col-sm-2 col-form-label">Company</label>
        <div className="col-sm-4">
          <select className="form-select" name="companyId" value={formData.companyId} onChange={handleChange}>
            <option value="">-- Select Company --</option>
            {companies.map((value) => (
              <option value={value._id} key={value._id}>{value.companyname}</option>
            ))}
          </select>
          {formErrors.companyId && <small className="text-danger">{formErrors.companyId}</small>}
        </div>
        <label className="col-sm-2 col-form-label text-end">Category</label>
        <div className="col-sm-4">
          <select className="form-select" name="categoryid" value={formData.categoryid} onChange={handleChange}>
            <option value="">-- Select Category --</option>
            {inidata.category.map((value) => (
              <option value={value._id} key={value._id}>{value.categoryname}</option>
            ))}
          </select>
          {formErrors.categoryid && <small className="text-danger">{formErrors.categoryid}</small>}
        </div>
      </div>

      <div className="row mb-3">
        <label className="col-sm-2 col-form-label">Address</label>
        <div className="col-sm-4">
          <select className="form-select" name="addressid" value={formData.addressid} onChange={handleChange}>
            <option value="">-- Select Address --</option>
            {inidata.address.map((value) => (
              <option value={value._id} key={value._id}>{value.addresstype}</option>
            ))}
          </select>
          {formErrors.addressid && <small className="text-danger">{formErrors.addressid}</small>}
        </div>
        <label className="col-sm-2 col-form-label text-end">Pet Type</label>
        <div className="col-sm-4">
          <select className="form-select" name="pettypeid" value={formData.pettypeid} onChange={handleChange}>
            <option value="">-- Select Pet Type --</option>
            {inidata.pettype.map((value) => (
              <option value={value._id} key={value._id}>{value.type}</option>
            ))}
          </select>
          {formErrors.pettypeid && <small className="text-danger">{formErrors.pettypeid}</small>}
        </div>
      </div>

      <div className="row mb-3">
        <label className="col-sm-2 col-form-label">Ad Title</label>
        <div className="col-sm-10">
          <input type="text" className="form-control" name="adtitle" value={formData.adtitle} onChange={handleChange} placeholder="Enter Ad Title" />
          {formErrors.adtitle && <small className="text-danger">{formErrors.adtitle}</small>}
        </div>
      </div>

      <div className="row mb-3">
        <label className="col-sm-2 col-form-label">Ad Description</label>
        <div className="col-sm-10">
          <textarea className="form-control" name="addescription" rows="3" value={formData.addescription} onChange={handleChange} placeholder="Enter Ad Description" />
          {formErrors.addescription && <small className="text-danger">{formErrors.addescription}</small>}
        </div>
      </div>

      <div className="row mb-3">
        <label className="col-sm-2 col-form-label fw-bold">Images</label>
        <div className="col-sm-10">
          {/* Image List Container */}
          <div className="d-flex flex-wrap gap-3">
            {formData.images.map((image, index) => (
              <div className="d-flex flex-column align-items-center" key={index} style={{ width: '120px' }}>
                {/* File Input */}
                <input
                  type="file"
                  accept="image/*"
                  className="form-control border-1 shadow-sm mb-2"
                  onChange={(e) => handleImageChange(e, index)}
                  ref={(el) => (fileInputRefs.current[index] = el)}
                />
                {/* Image Preview */}
                {image && (
                  <img
                    src={image.startsWith('data:image') ? image : `http://localhost:5000${image}`}
                    alt={`Preview ${index}`}
                    className="img-thumbnail rounded shadow-sm"
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                    }}
                  />
                )}
                <button
                  type="button"
                  className="btn btn-danger btn-sm mt-2"
                  onClick={() => handleRemoveImage(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {/* Add Image Button */}
          <button
            type="button"
            className="btn btn-outline-primary btn-sm mt-3"
            onClick={handleAddImage}
          >
            + Add Image
          </button>
        </div>
      </div>

      <div className="mb-4 text-start">
        <button className="btn btn-success me-2" onClick={handleSubmit}>Save</button>
        <button className="btn btn-secondary" onClick={handleClear}>Clear</button>
      </div>

      <hr />

      <h5 className="mb-3">Saved Ads</h5>
      <div className="table-responsive shadow-sm border rounded">
        <table className="table table-bordered align-middle">
          <thead className="table-primary text-center">
            <tr>
              <th>Company</th>
              <th>Category</th>
              <th>Address</th>
              <th>Pet Type</th>
              <th>Ad Title</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {savedAd.length > 0 ? (
              savedAd.map((ad) => (
                <tr key={ad._id}>
                  <td>{ad.companyId?.companyname || 'N/A'}</td>
                  <td>{ad.categoryid?.categoryname || 'N/A'}</td>
                  <td>{ad.addressid?.addresstype || 'N/A'}</td>
                  <td>{ad.pettypeid?.type || 'N/A'}</td>
                  <td>{ad.adtitle}</td>
                  <td>{ad.addescription?.slice(0, 40)}...</td>
                  <td className="text-center">
                    <button className="btn btn-success btn-sm me-2" onClick={() => handleEdit(ad)}>Edit</button>
                    <button className="btn btn-danger btn-sm me-2" onClick={() => handleDelete(ad)}>Delete</button>
                    {ad.adclose ? (
                      <button className="btn btn-warning btn-sm" onClick={() => handleCloseAd(ad._id, false)}>Unclose</button>
                    ) : (
                      <button className="btn btn-dark btn-sm" onClick={() => handleCloseAd(ad._id, true)}>Close</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted py-3">No ads found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DeleteRecordModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        onConfirm={handleDeleteConfirm}
        message="Are you sure you want to delete this ad?"
      />
    </div>
  );
}

export default Ads;
