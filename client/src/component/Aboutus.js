import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
//created by Sameer Mude for code as on todate abc 28-04-2025
//comment new as on date from here
function Aboutus() {
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [formData, setFormData] = useState({ description: '', _id: '' });
    const [formErrors, setFormErrors] = useState({});
    const [aboutList, setAboutList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const companiesRes = await axios.get(process.env.REACT_APP_ADDRESS + `/api/getdata/-1/Company`);
                setCompanies(companiesRes.data);

                const aboutRes = await axios.get(process.env.REACT_APP_ADDRESS + `/api/getdata/-1/Aboutus`);
                const list = Array.isArray(aboutRes.data) ? aboutRes.data : [];
                setAboutList(list);
                setFilteredList(list);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchInitialData();
    }, []);

    const fetchAboutList = (companyId, list = aboutList) => {
        if (companyId === '') {
            setFilteredList([...list]);
        } else {
            const filtered = list.filter(entry => entry.companyId === companyId);
            setFilteredList(filtered);
        }
    };

    const handleCompanyChange = (e) => {
        const companyId = e.target.value;
        setSelectedCompanyId(companyId);
        clearForm();
        fetchAboutList(companyId);
    };

    const validateControl = (values) => {
        const errors = {};
        if (!values.description || values.description.trim() === '') {
            errors.description = 'Enter the About Us.';
        }
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        const type = 'Aboutus';
        const errors = validateControl(formData);
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const payload = {
            description: formData.description,
            companyId: selectedCompanyId
        };

        try {
            if (!formData._id) {
                await axios.post(process.env.REACT_APP_ADDRESS + `/api/save/${type}`, payload);
            } else {
                await axios.put(process.env.REACT_APP_ADDRESS + `/api/update/${formData._id}/${type}`, payload);
            }

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Data saved successfully.'
            });
            await loadlist();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while saving.'
            });
            console.error(error);
        }
    };

    const loadlist = async () => {
        try {
            const updatedRes = await axios.get(process.env.REACT_APP_ADDRESS + `/api/getdata/-1/Aboutus`);
            const newList = Array.isArray(updatedRes.data) ? [...updatedRes.data] : [];
            setAboutList(newList);
            fetchAboutList(selectedCompanyId, newList);
            clearForm();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (entry) => {
        setFormData({
            description: entry.description,
            _id: entry._id
        });
        setSelectedCompanyId(entry.companyId);
    };

    const handleDelete = async (id) => {
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
                await axios.delete(process.env.REACT_APP_ADDRESS + `/api/delete/${id}/Aboutus`);
                Swal.fire('Deleted!', 'The entry has been deleted.', 'success');
                await loadlist();
            } catch (error) {
                console.error('Error deleting entry:', error);
                Swal.fire('Error!', 'An error occurred while deleting.', 'error');
            }
        }
    };

    const clearForm = () => {
        setFormData({ description: '', _id: '' });
        setFormErrors({});
    };

    return (
        <div className="container mt-4">
            <div className="bg-primary text-white text-center py-2 rounded">
                <strong style={{ fontSize: '1rem' }}>About Us Detail</strong>
            </div>

            {/* Inline Form Fields */}
            <div className="row align-items-center mt-4 mb-3">
                <label className="col-sm-2 col-form-label">Company Name</label>
                <div className="col-sm-10">
                    <select
                        className="form-select"
                        value={selectedCompanyId}
                        onChange={handleCompanyChange}
                    >
                        <option value="">-- Select Company --</option>
                        {companies.map((company) => (
                            <option key={company._id} value={company._id}>
                                {company.companyname}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="row align-items-center mb-3">
                <label className="col-sm-2 col-form-label">About Us</label>
                <div className="col-sm-10">
                    <textarea
                        name="description"
                        className="form-control"
                        placeholder="Enter About Us"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={!selectedCompanyId}
                    />
                    {formErrors.description && (
                        <small className="text-danger">{formErrors.description}</small>
                    )}
                </div>
            </div>

            {/* Buttons */}
            <div className="mb-4 text-Start">
                <button className="btn btn-success me-2" onClick={handleSubmit} disabled={!selectedCompanyId}>
                    Save
                </button>
                <button className="btn btn-secondary" onClick={clearForm}>
                    Clear
                </button>
            </div>

            <hr className="my-4" />

            {/* Saved Entries Table */}
            <h5 className="mb-3">Saved Entries</h5>
            <div className="table-responsive shadow-sm border rounded">
                <table className="table align-middle mb-0 table-bordered border-light-subtle">
                    <thead className="table-primary text-center">
                        <tr>
                            <th style={{ width: '25%' }}>Company</th>
                            <th style={{ width: '50%' }}>About Us (First 40 Chars)</th>
                            <th style={{ width: '25%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredList.length > 0 ? (
                            filteredList.map((entry) => {
                                const companyName = companies.find((c) => c._id === entry.companyId)?.companyname || 'N/A';
                                return (
                                    <tr key={entry._id}>
                                        <td>{companyName}</td>
                                        <td>{entry.description?.slice(0, 40)}...</td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn btn-success btn-sm" onClick={() => handleEdit(entry)}>
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(entry._id)}
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
                                <td colSpan="3" className="text-center text-muted py-3">
                                    No entries found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Aboutus;
