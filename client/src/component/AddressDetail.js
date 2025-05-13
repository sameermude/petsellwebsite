import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeleteRecordModal from './DeleteRecordModal';
import Swal from 'sweetalert2';

function AddressDetail({ userId }) {
    const [formData, setFormData] = useState({
        address: '',
        office: '',
        landmark: '',
        addresstype: '',
        companyId: '',
        userId: userId
    });

    const [editingAddress, setEditingAddress] = useState(null);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [deleteid, setdeleteid] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const fetchSavedAddresses = async (companyId) => {
        const type = "Address";
        if (!companyId) return;
        try {
            const response = await axios.get(process.env.REACT_APP_ADDRESS + `/api/getdata/-1/Address/${userId}`);
            setSavedAddresses(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching addresses:", error);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const companiesRes = await axios.get(process.env.REACT_APP_ADDRESS + `/api/getdata/-1/Company/${userId}`);
                setCompanies(Array.isArray(companiesRes.data) ? companiesRes.data : []);
                const addressRes = await axios.get(process.env.REACT_APP_ADDRESS + `/api/getdata/-1/Address/${userId}`);
                setSavedAddresses(Array.isArray(addressRes.data) ? addressRes.data : []);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchInitialData();
    }, []);

    const validateControl = (values) => {
        const errors = {};
        if (!values.companyId) errors.companyId = "Select a company";
        if (!values.address) errors.address = "Enter the address";
        if (!values.office) errors.office = "Enter the office";
        if (!values.addresstype) errors.addresstype = "Enter the address type";
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCompanyChange = (e) => {
        const companyId = e.target.value;
        setSelectedCompany(companyId);
        setFormData(prev => ({ ...prev, companyId, userId }));
        handleClear(companyId);
        fetchSavedAddresses(-1);
    };

    const handleSubmit = async () => {
        const type = "Address";
        const dataToSubmit = { ...formData, userId };
        const errors = validateControl(dataToSubmit);
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            try {
                if (!dataToSubmit._id) {
                    await axios.post(process.env.REACT_APP_ADDRESS + `/api/save/${type}`, dataToSubmit);
                } else {
                    await axios.put(process.env.REACT_APP_ADDRESS + `/api/update/${dataToSubmit._id}/${type}`, dataToSubmit);
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Data saved successfully.'
                });

                handleClear(selectedCompany);
                fetchSavedAddresses(-1);
            } catch (error) {
                console.error("Submit error:", error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Something went wrong.' });
            }
        } else {
            Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please check the form.' });
        }
    };

    const handleClear = (companyId = selectedCompany) => {
        setFormData({
            address: '',
            office: '',
            landmark: '',
            addresstype: '',
            companyId: companyId || '',
            userId: userId
        });
        setEditingAddress(null);
        setFormErrors({});
    };


    const handleEdit = (address) => {
        setFormData({
            address: address.address || '',
            office: address.office || '',
            landmark: address.landmark || '',
            addresstype: address.addresstype || '',
            companyId: address.companyId || '',
            _id: address._id,
            userId: userId
        });
        setSelectedCompany(address.companyId || '');
        setEditingAddress(address);
    };

    const handleDeleteConfirm = async (id) => {
        const type = "Address";
        try {
            const confirm = await Swal.fire({
                title: 'Are you sure?',
                text: 'This entry will be deleted permanently.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            });

            if (confirm.isConfirmed) {
                await axios.delete(process.env.REACT_APP_ADDRESS + `/api/delete/${id}/${type}`);
                Swal.fire('Deleted!', 'The entry has been deleted.', 'success');
                fetchSavedAddresses(-1);
                handleClear(selectedCompany);
            }
        } catch (error) {
            console.error("Delete error:", error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete.' });
        }
    };

    return (
        <div className="container mt-1">
            <div className="bg-primary text-white text-center p-2 rounded mb-4">
                <strong style={{ fontSize: '1rem' }}>Company Detail</strong>
            </div>

            <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label">Company Name</label>
                <div className="col-sm-10">
                    <select
                        className="form-select"
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                    >
                        <option value="">-- Select Company --</option>
                        {companies.map((company) => (
                            <option key={company._id} value={company._id}>
                                {company.companyname}
                            </option>
                        ))}
                    </select>
                    {formErrors.companyId && <div className="text-danger">{formErrors.companyId}</div>}
                </div>
            </div>

            <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label">Address</label>
                <div className="col-sm-10">
                    <input
                        type="text"
                        name="address"
                        className="form-control"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleChange}
                    />
                    {formErrors.address && <div className="text-danger">{formErrors.address}</div>}
                </div>
            </div>

            <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label">Address 1</label>
                <div className="col-sm-10">
                    <input
                        type="text"
                        name="office"
                        className="form-control"
                        placeholder="Address 1"
                        value={formData.office}
                        onChange={handleChange}
                    />
                    {formErrors.office && <div className="text-danger">{formErrors.office}</div>}
                </div>
            </div>

            <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label">Landmark</label>
                <div className="col-sm-10">
                    <input
                        type="text"
                        name="landmark"
                        className="form-control"
                        placeholder="Landmark"
                        value={formData.landmark}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label">Address Type</label>
                <div className="col-sm-10">
                    <input
                        type="text"
                        name="addresstype"
                        className="form-control"
                        placeholder="Address Type"
                        value={formData.addresstype}
                        onChange={handleChange}
                    />
                    {formErrors.addresstype && <div className="text-danger">{formErrors.addresstype}</div>}
                </div>
            </div>

            <div className="mb-4">
                <button className="btn btn-success me-2" onClick={handleSubmit}>Save</button>
                <button className="btn btn-secondary" onClick={() => handleClear()}>Clear</button>
            </div>

            <DeleteRecordModal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                onConfirm={handleDeleteConfirm}
            />

            <hr />
            <h5>Saved Addresses</h5>
            <div className="table-responsive shadow-sm border rounded">
                <table className="table align-middle mb-0 table-bordered border-light-subtle">
                    <thead className="table-primary text-center">
                        <tr>
                            <th className="col-company">Company</th>
                            <th className="col-address">Address</th>
                            <th className="col-office">Office</th>
                            <th className="col-type d-none d-sm-table-cell">Type</th>
                            <th className="col-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(savedAddresses) && savedAddresses.length > 0 ? (
                            savedAddresses.map((addr) => {
                                const companyName = companies.find((c) => c._id === addr.companyId)?.companyname || 'N/A';
                                return (
                                    <tr key={addr._id}>
                                        <td>{companyName}</td>
                                        <td>{addr.address}</td>
                                        <td>{addr.office}</td>
                                        <td className="d-none d-sm-table-cell">{addr.addresstype}</td>
                                        <td>
                                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleEdit(addr)}
                                                    style={{ minWidth: '70px' }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteConfirm(addr._id)}
                                                    style={{ minWidth: '70px' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center text-muted py-3">No addresses found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AddressDetail;
