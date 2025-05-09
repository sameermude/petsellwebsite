import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import './Dashboard.css';

const Dashboard = ({ userId }) => {
    const [categories, setCategories] = useState([]);
    const [isChecked, setIsChecked] = useState(false);
    const [petTypes, setPetTypes] = useState([]);
    const [ads, setAds] = useState([]);
    const [filteredAds, setFilteredAds] = useState([]);
    const [selectedPetTypeId, setSelectedPetTypeId] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedAd, setSelectedAd] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/data/alldata/Ad/${userId}`);
                const fetchedPetTypes = response.data.pettype || [];
                const fetchedCategories = response.data.category || [];

                setPetTypes(fetchedPetTypes);
                setCategories(fetchedCategories);

                if (fetchedPetTypes.length > 0) {
                    const firstPetType = fetchedPetTypes[0];
                    setSelectedPetTypeId(firstPetType._id);

                    const adResponse = await axios.get('http://localhost:5000/api/adselected', {
                        params: { pettypeid: firstPetType._id }
                    });
                    const adsData = adResponse.data || [];
                    setAds(adsData);
                    setFilteredAds(adsData);
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }

            const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
            setSearchHistory(history);
        };

        fetchData();
    }, [userId]);

    const handleCheckboxChange = (e) => {
        const newChecked = e.target.checked;
        setIsChecked(newChecked);

        if (newChecked) {
            const userAds = ads.filter(ad => ad.userId === userId);
            setFilteredAds(userAds);
        } else {
            setFilteredAds(ads);
        }
    };

    const handlePetTypeSelect = async (petTypeId) => {
        setSelectedPetTypeId(petTypeId);
        setSelectedCategoryId('');
        try {
            const response = await axios.get('http://localhost:5000/api/adselected', {
                params: { pettypeid: petTypeId }
            });
            const adsData = response.data || [];
            setAds(adsData);
            setFilteredAds(isChecked ? adsData.filter(ad => ad.userid === userId) : adsData);
        } catch (error) {
            console.error('Error fetching ads:', error);
        }
    };

    const handleCategorySelect = async (categoryId) => {
        setSelectedCategoryId(categoryId);
        try {
            const response = await axios.get('http://localhost:5000/api/adselected', {
                params: { categoryid: categoryId, pettypeid: selectedPetTypeId }
            });
            const adsData = response.data || [];
            setAds(adsData);
            setFilteredAds(isChecked ? adsData.filter(ad => ad.userid === userId) : adsData);
        } catch (error) {
            console.error('Error fetching ads:', error);
            setAds([]);
            setFilteredAds([]);
        }
    };

    const handleSearch = () => {
        if (!searchText.trim()) {
            setFilteredAds(ads);
            return;
        }

        const updatedHistory = [searchText, ...searchHistory.filter(q => q !== searchText)].slice(0, 10);
        setSearchHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

        const filtered = ads.filter(ad =>
            ad.adtitle.toLowerCase().includes(searchText.toLowerCase()) ||
            ad.addescription.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredAds(filtered);
        setSearchText('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleSuggestionClick = (text) => {
        setSearchText(text);
        setTimeout(() => handleSearch(), 0);
    };

    const handleViewAd = (ad) => {
        setSelectedAd(ad);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAd(null);
    };

    return (
        <div className="dashboard container py-4">
            {/* Search Box */}
            <div className="mb-4 position-relative">
                <div className="d-flex align-items-center gap-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search ads..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        style={{ width: '85%' }}
                    />
                    <div className="form-check m-0 d-flex align-items-center">
                        <input
                            type="checkbox"
                            className="form-check-input me-2"
                            id="customCheck1"
                            checked={isChecked}
                            onChange={handleCheckboxChange}
                        />
                        <label className="form-check-label mb-0" htmlFor="customCheck1">
                            Show Your Ads
                        </label>
                    </div>
                </div>
                {searchText && searchHistory.length > 0 && (
                    <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                        {searchHistory
                            .filter(q => q.toLowerCase().includes(searchText.toLowerCase()))
                            .map((item, idx) => (
                                <li
                                    key={idx}
                                    className="list-group-item list-group-item-action"
                                    onClick={() => handleSuggestionClick(item)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {item}
                                </li>
                            ))}
                    </ul>
                )}
            </div>

            {/* Pet Types */}
            <div className="row justify-content-center mb-2">
                {petTypes.map((pet) => (
                    <div key={pet._id} className="col-md-4 mb-3">
                        <div
                            className={`d-flex align-items-center p-2 border rounded shadow-sm pet-type-item ${selectedPetTypeId === pet._id ? 'selected' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handlePetTypeSelect(pet._id)}
                        >
                            <img
                                src={pet.image}
                                alt={pet.type}
                                className="me-3"
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div className="fw-semibold fs-5">{pet.type}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Categories */}
            <div className="row justify-content-center mb-2">
                {categories.map((cat) => (
                    <div key={cat._id} className="col-sm-6 col-md-4 col-lg-3 mb-3">
                        <div
                            className={`d-flex align-items-center p-2 border rounded shadow-sm category-card ${selectedCategoryId === cat._id ? 'selected' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleCategorySelect(cat._id)}
                        >
                            <div
                                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
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
                {filteredAds.length > 0 ? (
                    filteredAds.map((ad, idx) => {
                        const adImage = ad.images && ad.images[0] ? ad.images[0] : null;

                        return (
                            <div key={idx} className="col-md-6 col-lg-4">
                                <div className="card ad-card h-100 d-flex flex-column p-3 position-relative rounded-3">
                                    {adImage && (
                                        <img
                                            src={adImage.startsWith('data:image') ? adImage : `http://localhost:5000${adImage}`}
                                            alt="Ad Thumbnail"
                                            className="ad-card-thumbnail rounded-3"
                                        />
                                    )}
                                    <div className="card-overlay flex-grow-1 d-flex flex-column">
                                        <h5 className="mb-2">{ad.adtitle.slice(0, 25)}{ad.adtitle.length > 25 && '...'}</h5>
                                        <p className="mb-2">{ad.addescription.slice(0, 25)}{ad.addescription.length > 25 && '...'}</p>
                                        <p className="small mb-2">
                                            <strong>Company:</strong> {ad.companyId?.companyname || 'N/A'}
                                        </p>
                                        {ad.addressid && (
                                            <p className="small mb-2">
                                                <strong>Address:</strong> {ad.addressid?.addresstype || 'N/A'}
                                            </p>
                                        )}
                                        <div className="mt-auto">
                                            <button
                                                className="btn btn-outline-primary btn-sm w-100 view-ad-btn"
                                                onClick={() => handleViewAd(ad)}
                                            >
                                                View Ad
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    selectedCategoryId && (
                        <div className="text-center text-muted fst-italic">No ads found for this category.</div>
                    )
                )}
            </div>

            {/* Ad Modal */}
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
                            <div className="ad-images d-flex flex-wrap gap-2">
                                {selectedAd.images.map((image, idx) => (
                                    <img
                                        key={idx}
                                        src={image.startsWith('data:image') ? image : `http://localhost:5000${image}`}
                                        alt={`Ad Image ${idx + 1}`}
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                ))}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                        <Button variant="primary">Contact Seller</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default Dashboard;
