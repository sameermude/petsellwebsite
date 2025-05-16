import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import './Dashboard.css';
import { FaStop, FaMicrophone } from 'react-icons/fa';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

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
    const [showSellerForm, setshowSellerForm] = useState(false);
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();
    const [isVoiceInput, setIsVoiceInput] = useState(false);

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            alert('Browser does not support speech recognition.');
            return;
        }

        if (!listening && transcript) {
            setIsVoiceInput(true);
            resetTranscript();
            // Trigger the search function
            handleSearch(transcript);
            setSearchText(transcript);
        }
    }, [listening, transcript]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(process.env.REACT_APP_ADDRESS + `/api/data/alldata/Ad/${userId}`);
                const fetchedPetTypes = response.data.pettype || [];
                const fetchedCategories = response.data.category || [];

                setPetTypes(fetchedPetTypes);
                setCategories(fetchedCategories);

                if (fetchedPetTypes.length > 0) {
                    const firstPetType = fetchedPetTypes[0];
                    setSelectedPetTypeId(firstPetType._id);

                    const adResponse = await axios.get(process.env.REACT_APP_ADDRESS + '/api/adselected', {
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
            const response = await axios.get(process.env.REACT_APP_ADDRESS + '/api/adselected', {
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
            const response = await axios.get(process.env.REACT_APP_ADDRESS + '/api/adselected', {
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

    const handleSearch = (query) => {
        const searchQuery = query || searchText;
        if (!searchQuery.trim()) {
            setFilteredAds(ads);
            return;
        }

        const updatedHistory = [searchQuery, ...searchHistory.filter(q => q !== searchQuery)].slice(0, 10);
        setSearchHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

        const filtered = ads.filter(ad =>
            ad.adtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ad.addescription.toLowerCase().includes(searchQuery.toLowerCase())
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

    const handleCloseModalSeller = () => {
        setshowSellerForm(false);
        setSelectedAd(null);
    };

    const handleCloseModalShowSeller = () => {
        setShowModal(false);
    };

    const contactSeller = () => {
        handleCloseModalShowSeller();
        setshowSellerForm(true);
    }

    return (
        <div className="dashboard container py-4">
            {/* Search Box */}
            <div className="mb-4 position-relative">
                <div className="d-flex align-items-center gap-2">
                    <input
                        type="text"
                        name="search"
                        value={searchText}
                        onChange={(e) => {
                            setIsVoiceInput(false);
                            setSearchText(e.target.value);
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Search..."
                        autoComplete="off"
                        spellCheck="false"
                        // optionally add this to disable password managers or other autofill
                        autoCorrect="off"
                        autoCapitalize="off"
                        style={{ flex: '1 1 250px', minWidth: '200px' }}
                    />
                    <button
                        style={{ border: 'none' }}
                        onClick={() => {
                            if (listening) {
                                SpeechRecognition.stopListening();
                            } else {
                                resetTranscript();
                                SpeechRecognition.startListening({ continuous: false });
                            }
                        }}
                        className="btn btn-secondary"
                    >
                        {listening ? <FaStop /> : <FaMicrophone />}
                    </button>

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
                {searchText && !isVoiceInput && searchHistory.length > 0 && (
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

            <div className="pet-type-bar d-flex justify-content-between flex-wrap flex-md-nowrap gap-2 mb-3">
                {petTypes.map((pet) => (
                    <div
                        key={pet._id}
                        className={`d-flex align-items-center flex-grow-1 justify-content-start p-2 border rounded shadow-sm pet-type-item ${selectedPetTypeId === pet._id ? 'selected' : ''}`}
                        style={{ cursor: 'pointer', minWidth: 0 }}
                        onClick={() => handlePetTypeSelect(pet._id)}
                    >
                        <img
                            src={pet.image}
                            alt={pet.type}
                            className="me-2"
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div className="text-truncate fw-semibold fs-6">{pet.type}</div>
                    </div>
                ))}
            </div>

            <div className="pet-type-bar d-flex justify-content-center flex-wrap gap-2 mb-3">
                {categories.map((cat) => (
                    <div
                        key={cat._id}
                        className={`d-flex align-items-center justify-content-start p-2 border rounded shadow-sm pet-type-item w-auto ${selectedCategoryId === cat._id ? 'selected' : ''}`}
                        style={{ cursor: 'pointer', minWidth: 0 }}
                        onClick={() => handleCategorySelect(cat._id)}
                    >
                        <div
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        >
                            {cat.categoryname[0]}
                        </div>
                        <div className="text-truncate fw-semibold fs-6">{cat.categoryname}</div>
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
                                            src={adImage.startsWith('data:image') ? adImage : process.env.REACT_APP_ADDRESS + `${adImage}`}
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
                        <p><strong>Address:</strong> {selectedAd.addressid?.address || 'N/A'}</p>
                        {selectedAd.images && selectedAd.images.length > 0 && (
                            <div className="ad-images d-flex flex-wrap gap-2">
                                {selectedAd.images.map((image, idx) => (
                                    <img
                                        key={idx}
                                        src={image.startsWith('data:image') ? image : process.env.REACT_APP_ADDRESS + `${image}`}
                                        alt={`Ad Image ${idx + 1}`}
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                ))}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                        <Button variant="primary" onClick={contactSeller}>Contact Seller</Button>
                    </Modal.Footer>
                </Modal>
            )}
            {/*Seller Form*/}
            {
                showSellerForm && selectedAd && (
                    <Modal show={showSellerForm} onHide={handleCloseModalSeller} dialogClassName="custom-modal"
                        animation={true}>
                        <Modal.Header closeButton>
                            <Modal.Title>{selectedAd.companyId?.companyname}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p><strong>Address :</strong> {selectedAd.addressid?.addresstype}</p>
                            <p><strong>Address Type :</strong> {selectedAd.addressid?.address}</p>
                            <p>
                                <strong>Email :</strong>{' '}
                                {selectedAd.companyId?.emails?.map((email, index) => (
                                    <span key={index}>
                                        {email}{index < selectedAd.companyId.emails.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </p>
                            <p>
                                <strong>Tel No :</strong>{' '}
                                {selectedAd.companyId?.contacts?.map((contacts
                                ) => (
                                    <span>
                                        {contacts}
                                    </span>
                                ))}
                            </p>

                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModalSeller}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                )
            }
        </div>
    );
};

export default Dashboard;
