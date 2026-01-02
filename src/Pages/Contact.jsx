import React, { useEffect, useState } from 'react';
import './Contact.css';

const baseurl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/contacts";

// CreateForm Component
const CreateForm = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });
  const [phoneError, setPhoneError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation - only numbers, max 10 digits
    if (name === "phoneNumber") {
      const numbersOnly = value.replace(/\D/g, ""); // Remove non-digits
      if (numbersOnly.length <= 10) {
        setFormData({ ...formData, [name]: numbersOnly });
        if (numbersOnly.length === 10) {
          setPhoneError("");
        } else if (numbersOnly.length > 0) {
          setPhoneError(`Enter ${10 - numbersOnly.length} more digit(s)`);
        } else {
          setPhoneError("");
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = () => {
    if (formData.phoneNumber.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    }
    setPhoneError("");
    onCreate(formData);
  };

  return (
    <div className="create-form-container">
      <div className="create-form">
        <h2>Create Contact</h2>
        <label htmlFor="firstName">First Name:</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          required
        />
        <label htmlFor="lastName">Last Name:</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          required
        />
        <label htmlFor="phoneNumber">Phone Number (10 digits):</label>
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="1234567890"
          maxLength={10}
          required
        />
        {phoneError && <span className="error-message">{phoneError}</span>}
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />

        <div className="button-container">
          <button className="create-button" onClick={handleSubmit}>
            Create
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// EditForm Component
const EditForm = ({ contactData, onClose, onSave }) => {
  const [formData, setFormData] = useState(contactData);
  const [phoneError, setPhoneError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation - only numbers, max 10 digits
    if (name === "phoneNumber") {
      const numbersOnly = value.replace(/\D/g, ""); // Remove non-digits
      if (numbersOnly.length <= 10) {
        setFormData({ ...formData, [name]: numbersOnly });
        if (numbersOnly.length === 10) {
          setPhoneError("");
        } else if (numbersOnly.length > 0) {
          setPhoneError(`Enter ${10 - numbersOnly.length} more digit(s)`);
        } else {
          setPhoneError("");
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = () => {
    if (formData.phoneNumber.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    }
    setPhoneError("");
    onSave(formData);
  };

  return (
    <div className="edit-form-container">
      <div className="edit-form">
        <h2>Edit Contact</h2>
        <label htmlFor="firstName">First Name:</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName || ""}
          onChange={handleInputChange}
          required
        />
        <label htmlFor="lastName">Last Name:</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName || ""}
          onChange={handleInputChange}
          required
        />
        <label htmlFor="phoneNumber">Phone Number (10 digits):</label>
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber || ""}
          onChange={handleInputChange}
          placeholder="1234567890"
          maxLength={10}
          required
        />
        {phoneError && <span className="error-message">{phoneError}</span>}
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={handleInputChange}
          required
        />

        <div className="button-container">
          <button className="save-button" onClick={handleSubmit}>
            Save
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Main DataTable Component
const DataTable = () => {
  const [data, setData] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch(baseurl)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  };

  const openCreateForm = () => {
    setShowCreateForm(true);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
  };

  const openEditForm = (contactData) => {
    setEditFormData(contactData);
    setShowEditForm(true);
  };

  const closeEditForm = () => {
    setShowEditForm(false);
  };

  const handleSaveEdit = (editedData) => {
    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(editedData.phoneNumber)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }
    
    const url = `${baseurl}/${editedData._id}`;
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedData),
    };

    fetch(url, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update contact');
        }
        fetchData();
        closeEditForm();
        alert('Contact updated successfully');
      })
      .catch((error) => {
        console.error('Error updating contact:', error);
        alert('Error updating contact');
      });
  };

  const handleDelete = (contact) => {
    if (window.confirm(`Delete ${contact.firstName} ${contact.lastName}?`)) {
      fetch(`${baseurl}/${contact._id}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            fetchData();
            alert('Contact deleted successfully');
          } else {
            alert('Failed to delete contact');
          }
        })
        .catch((error) => {
          console.error('Error deleting contact:', error);
          alert('Error deleting contact');
        });
    }
  };

  const handleCreate = (newData) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newData.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    
    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newData.phoneNumber)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    fetch(baseurl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to create contact');
        }
        fetchData();
        closeCreateForm();
        alert('Contact added successfully');
      })
      .catch((error) => {
        console.error('Error creating contact:', error);
        alert('Error creating contact');
      });
  };

  return (
    <>
      <div className="header">
        Contact Management App
      </div>
      <div className="container">
        <div className="search-bar">
          <button className="button" onClick={openCreateForm}>Create Contact</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                <td>{item.firstName} {item.lastName}</td>
                <td>{item.email}</td>
                <td>{item.phoneNumber}</td>
                <td>
                  <button className="update-button" onClick={() => openEditForm(item)}>
                    Edit
                  </button>
                </td>
                <td>
                  <button className="delete-button" onClick={() => handleDelete(item)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showEditForm && (
          <EditForm contactData={editFormData} onClose={closeEditForm} onSave={handleSaveEdit} />
        )}
        {showCreateForm && <CreateForm onClose={closeCreateForm} onCreate={handleCreate} />}
      </div>
    </>
  );
};

export default DataTable;
