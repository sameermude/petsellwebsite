import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap'; // Import Modal and Button from react-bootstrap
import './Dashboard.css';

const Dashboard = () => {
    const [categories, setCategories] = useState([]);
    const [petTypes, setPetTypes] = useState([]);
    const [ads, setAds] = useState([]);
    const [selectedPetTypeId, setSelectedPetTypeId] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedAd, setSelectedAd] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = "6610d2582aa846d0ac72b693";
                const response = await axios.get('http://localhost:5000/api/data/alldata/Ad/${userId}');
                const fetchedPetTypes = response.data.pettype || [];
                const fetchedCategories = response.data.category || [];

                setPetTypes(fetchedPetTypes);
                setCategories(fetchedCategories);

                // Select the first pet type and fetch its ads
                if (fetchedPetTypes.length > 0) {
                    const firstPetType = fetchedPetTypes[0];
                    setSelectedPetTypeId(firstPetType._id);

                    // Fetch ads for the first pet type with no category initially
                    const adResponse = await axios.get('http://localhost:5000/api/adselected', {
                        params: { pettypeid: firstPetType._id }
                    });
                    setAds(adResponse.data || []);
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        fetchData();
    }, []);

    const handlePetTypeSelect = (petTypeId) => {
        setSelectedPetTypeId(petTypeId);
        setSelectedCategoryId('');
        setAds([]);
    };

    const handleCategorySelect = async (categoryId) => {
        setSelectedCategoryId(categoryId);
        try {
            const response = await axios.get('http://localhost:5000/api/adselected', {
                params: { categoryid: categoryId, pettypeid: selectedPetTypeId }
            });
            setAds(response.data || []);
        } catch (error) {
            console.error('Error fetching ads:', error);
            setAds([]);
        }
    };

    const handleViewAd = (ad) => {
        setSelectedAd(ad); // Set the selected ad for modal display
        setShowModal(true); // Show the modal
    };

    const handleCloseModal = () => {
        setShowModal(false); // Close the modal
        setSelectedAd(null); // Clear selected ad
    };

    return (
        <div className="dashboard container py-4">
            {/* Pet Types */}
            <div className="row justify-content-center mb-4">
                {petTypes.map((pet) => (
                    <div key={pet._id} className="col-md-4 mb-3">
                        <div
                            className={`d-flex align-items-center p-3 border rounded shadow-sm pet-type-item ${selectedPetTypeId === pet._id ? 'selected' : ''}`}
                            style={{ cursor: 'pointer', transition: '0.3s' }}
                            onClick={() => handlePetTypeSelect(pet._id)}
                        >
                            <img
                                src={pet.image}
                                alt={pet.type}
                                className="me-3"
                                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div className="fw-semibold fs-5">{pet.type}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Categories */}
            <div className="row justify-content-center mb-4">
                {categories.map((cat) => (
                    <div key={cat._id} className="col-sm-6 col-md-4 col-lg-3 mb-3">
                        <div
                            className={`d-flex align-items-center p-3 border rounded shadow-sm category-card ${selectedCategoryId === cat._id ? 'selected' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleCategorySelect(cat._id)}
                        >
                            <div
                                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                style={{ width: '50px', height: '50px', fontSize: '18px' }}
                            >
                                {cat.categoryname[0]}
                            </div>
                            <div className="fw-medium fs-6">{cat.categoryname}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Ads */}
            <div className="row g-3">
                {ads.length > 0 ? (
                    ads.map((ad, idx) => (
                        <div key={idx} className="col-md-6 col-lg-4">
                            <div className="card ad-card p-3">
                                <h5 className="text-primary mb-2">{ad.adtitle}</h5>
                                <p className="mb-2">{ad.addescription}</p>
                                <p className="text-muted small mb-2">
                                    <strong>Company:</strong> {ad.companyId?.companyname || 'N/A'}
                                </p>
                                {/* Display Address */}
                                {ad.addressid && (
                                    <p className="text-muted small mb-2">
                                        <strong>Address:</strong> {ad.addressid?.addresstype || 'N/A'}
                                    </p>
                                )}
                                <button
                                    className="btn btn-outline-primary btn-sm mt-auto w-100"
                                    onClick={() => handleViewAd(ad)} // Open modal with selected ad
                                >
                                    View Ad
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    selectedCategoryId && (
                        <div className="text-center text-muted fst-italic">No ads found for this category.</div>
                    )
                )}
            </div>

            {/* Modal for Viewing Ad Details */}
            {selectedAd && (
                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedAd.adtitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h6>{selectedAd.addescription}</h6>
                        <p><strong>Company:</strong> {selectedAd.companyId?.companyname || 'N/A'}</p>
                        <p><strong>Address:</strong> {selectedAd.addressid?.addresstype || 'N/A'}</p>
                        {selectedAd.images && selectedAd.images.length > 0 && (
                            <div className="ad-images" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {selectedAd.images.map((image, idx) => (
                                    <img
                                        key={idx}
                                        src={image.startsWith('data:image') ? image : `http://localhost:5000${image}`}
                                        alt={`Ad Image ${idx + 1}`}
                                        className="img-fluid"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }} // Inline style for image size
                                    />
                                ))}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                        <Button variant="primary">Contact Seller</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default Dashboard;
