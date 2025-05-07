import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
//created by sameer mude code
function Company({ userId }) {
    const stylesPara1 = { color: 'red', display: 'flex', alignItems: 'center' };
    const [aboutList, setAboutList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);

    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        companyname: '',
        contactperson: '',
        aboutus: '',
        emails: [],
        contacts: [],
        userId: userId
    });

    const [emailInput, setEmailInput] = useState('');
    const [contactInput, setContactInput] = useState('');
    const [editingEmailIndex, setEditingEmailIndex] = useState(null);
    const [editingContactIndex, setEditingContactIndex] = useState(null);
    const [companyList, setCompanyList] = useState([]);
    const companyNameRef = useRef(null);

    const fetchCompanyList = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/getdata/-1/Company/${userId}`);
            setCompanyList(response.data);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    useEffect(() => {
        companyNameRef.current?.focus();
        fetchCompanyList();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateControl = (values) => {
        const errors = {};
        if (values.companyname.trim() === '') {
            errors.companyname = 'Enter the company name.';
        }
        if (!values.contacts || values.contacts.length === 0) {
            errors.contacts = 'At least one contact number is required.';
        }
        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateControl(formData);
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            try {
                let response;
                if (!formData._id) {
                    response = await axios.post(`http://localhost:5000/api/save/Company`, formData);
                    Swal.fire('Success', 'Company saved successfully.', 'success');
                } else {
                    response = await axios.put(`http://localhost:5000/api/update/${formData._id}/Company`, formData);
                    Swal.fire('Success', 'Company updated successfully.', 'success');
                }
                fetchCompanyList();
                setFormData(prev => ({ ...prev, _id: response.data._id }));
            } catch (error) {
                Swal.fire('Error', error.message || 'Something went wrong', 'error');
            }
        }
    };

    const handleView = (company) => {
        setFormData({
            _id: company._id,
            companyname: company.companyname,
            contactperson: company.contactperson,
            aboutus: company.aboutus || '',
            emails: company.emails || [],
            contacts: company.contacts || [],
        });
    };

    const handleClear = () => {
        Swal.fire({
            title: 'Clear Form?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Clear'
        }).then(result => {
            if (result.isConfirmed) {
                setFormData({
                    companyname: '',
                    contactperson: '',
                    aboutus: '',
                    emails: [],
                    contacts: [],
                    userId: userId
                });
                Clearform();
            }
        });
    };

    const Clearform = () => {
        setEmailInput('');
        setContactInput('');
        setEditingEmailIndex(null);
        setEditingContactIndex(null);
        setFormErrors({});
        companyNameRef.current?.focus();
    }

    const handleDelete = async () => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: 'This entry will be deleted permanently.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });
    
        if (confirm.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/delete/${formData._id}/Company`);
                Swal.fire('Deleted!', 'The entry has been deleted.', 'success');
    
                const res = await axios.get(`http://localhost:5000/api/getdata/-1/Company`);
                const fullList = Array.isArray(res.data) ? res.data : [];
                setAboutList(fullList);
                setFilteredList(fullList);
                fetchCompanyList();
    
                // 🔥 Reset the whole formData, not just _id
                setFormData({
                    companyname: '',
                    contactperson: '',
                    aboutus: '',
                    emails: [],
                    contacts: [],
                    userId: userId
                });
    
                Clearform(); // Clears email/contact inputs and validation
            } catch (error) {
                if (error.response && error.response.status === 400 && error.response.data.message) {
                    Swal.fire('Cannot Delete', error.response.data.message, 'warning');
                } else {
                    Swal.fire('Error!', 'An error occurred while deleting.', 'error');
                }
            }
        }
    };
    

    const handleAddEmail = () => {
        const trimmed = emailInput.trim();
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex.test(trimmed)) {
            return Swal.fire('Invalid Email', 'Please enter a valid email address.', 'warning');
        }

        const updatedEmails = [...formData.emails];
        if (editingEmailIndex !== null) {
            updatedEmails[editingEmailIndex] = trimmed;
        } else {
            if (formData.emails.includes(trimmed)) {
                return Swal.fire('Duplicate Email', 'This email is already in the list.', 'info');
            }
            updatedEmails.push(trimmed);
        }

        setFormData(prev => ({ ...prev, emails: updatedEmails }));
        setEmailInput('');
        setEditingEmailIndex(null);
    };

    const handleEditEmail = (index) => {
        setEmailInput(formData.emails[index]);
        setEditingEmailIndex(index);
    };

    const handleRemoveEmail = (index) => {
        const updatedEmails = [...formData.emails];
        updatedEmails.splice(index, 1);
        setFormData(prev => ({ ...prev, emails: updatedEmails }));
    };

    const handleAddContact = () => {
        const trimmed = contactInput.trim();
        const regex = /^[0-9]{10}$/;

        if (!regex.test(trimmed)) {
            return Swal.fire('Invalid Contact', 'Please enter a valid 10-digit number.', 'warning');
        }

        const updatedContacts = [...formData.contacts];
        if (editingContactIndex !== null) {
            updatedContacts[editingContactIndex] = trimmed;
        } else {
            if (formData.contacts.includes(trimmed)) {
                return Swal.fire('Duplicate Contact', 'This contact is already in the list.', 'info');
            }
            updatedContacts.push(trimmed);
        }

        setFormData(prev => ({ ...prev, contacts: updatedContacts }));
        setContactInput('');
        setEditingContactIndex(null);
    };

    const handleEditContact = (index) => {
        setContactInput(formData.contacts[index]);
        setEditingContactIndex(index);
    };

    const handleRemoveContact = (index) => {
        const updatedContacts = [...formData.contacts];
        updatedContacts.splice(index, 1);
        setFormData(prev => ({ ...prev, contacts: updatedContacts }));
    };

    return (
        <div className="container mt-2">
            <div className="bg-primary text-white text-center p-2 rounded mb-4">
                <strong style={{ fontSize: '1rem' }}>Company Detail</strong>
            </div>

            <div className="row mb-4 align-items-center">
                <label className="col-sm-2 col-form-label">Company Name</label>
                <div className="col-sm-10">
                    <input
                        type="text"
                        name="companyname"
                        className="form-control w-100"
                        placeholder="companyname"
                        value={formData.companyname}
                        onChange={handleChange}
                        ref={companyNameRef}
                    />
                </div>
            </div>

            {formErrors.companyname && <small style={stylesPara1}>{formErrors.companyname}</small>}

            <div className="row mb-3 align-items-center">
                <label className="col-sm-2 col-form-label">Contact Person</label>
                <div className="col-sm-10">
                    <input
                        type="text"
                        name="contactperson"
                        className="form-control w-100"
                        placeholder="Contact Person"
                        value={formData.contactperson}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="mb-3">
                <label>Add Contact Number</label>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        value={contactInput}
                        onChange={(e) => setContactInput(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleAddContact}>
                        {editingContactIndex !== null ? 'Update' : 'Add'}
                    </button>
                </div>
                {formErrors.contacts && <small style={stylesPara1}>{formErrors.contacts}</small>}
                <ul className="list-group mt-2">
                    {formData.contacts.map((num, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            {num}
                            <div>
                                <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditContact(index)}>Edit</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleRemoveContact(index)}>Remove</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mb-3">
                <label>Add Email</label>
                <div className="input-group">
                    <input
                        type="email"
                        className="form-control"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleAddEmail}>
                        {editingEmailIndex !== null ? 'Update' : 'Add'}
                    </button>
                </div>
                <ul className="list-group mt-2">
                    {formData.emails.map((email, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            {email}
                            <div>
                                <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditEmail(index)}>Edit</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleRemoveEmail(index)}>Remove</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="row mb-3 align-items-start">
                <label className="col-sm-2 col-form-label align-self-start">About us</label>
                <div className="col-sm-10">
                    <textarea
                        name="aboutus"
                        className="form-control w-100"
                        placeholder="About us"
                        rows={2}
                        value={formData.aboutus}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="mb-4 d-flex gap-2">
                <button className="btn btn-success" onClick={handleSubmit}>Save</button>
                <button className="btn btn-secondary" onClick={handleClear}>Clear</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>

            <h5 className="mt-1 mb- text-primary">Saved Companies</h5>

            <div className="row g-3">
                {companyList.length === 0 ? (
                    <div className="col-12 text-muted">No companies saved.</div>
                ) : (
                    companyList.map(company => (
                        <div className="col-md-6 col-lg-4" key={company._id}>
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div>
                                        <h6 className="card-title text-dark fw-semibold">{company.companyname}</h6>
                                        <p className="mb-1"><strong>Contact:</strong> {company.contactperson || 'N/A'}</p>
                                        <div className="d-flex gap-2 mt-2 flex-wrap">
                                            <span className="badge bg-secondary">
                                                📧 {company.emails?.length || 0} Email{company.emails?.length !== 1 ? 's' : ''}
                                            </span>
                                            <span className="badge bg-info text-dark">
                                                📞 {company.contacts?.length || 0} Contact{company.contacts?.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <button className="btn btn-sm btn-outline-primary w-100" onClick={() => handleView(company)}>
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Company;
