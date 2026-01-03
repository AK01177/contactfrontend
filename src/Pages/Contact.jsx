import React, { useEffect, useState } from 'react';
import './Contact.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/contacts";

// Validation utilities
const validatePhone = (phone) => /^\d{10}$/.test(phone);
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ContactForm Component (handles both create and edit)
const ContactForm = ({ contact = null, onClose, onSubmit }) => {
  const isEdit = !!contact;
  const [form, setForm] = useState(contact || {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });
  const [phoneErr, setPhoneErr] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phoneNumber") {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 10) {
        setForm({ ...form, [name]: digits });
        if (digits.length === 10) {
          setPhoneErr("");
        } else if (digits.length > 0) {
          setPhoneErr(`Enter ${10 - digits.length} more digit(s)`);
        } else {
          setPhoneErr("");
        }
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = () => {
    if (!validatePhone(form.phoneNumber)) {
      setPhoneErr("Phone number must be exactly 10 digits");
      return;
    }
    if (!validateEmail(form.email)) {
      alert("Please enter a valid email address");
      return;
    }
    setPhoneErr("");
    onSubmit(form);
  };

  return (
    <div className={`${isEdit ? 'edit' : 'create'}-form-container`}>
      <div className={`${isEdit ? 'edit' : 'create'}-form`}>
        <h2>{isEdit ? 'Edit' : 'Create'} Contact</h2>
        
        <label htmlFor="firstName">First Name:</label>
        <input
          type="text"
          name="firstName"
          value={form.firstName || ""}
          onChange={handleChange}
          required
        />
        
        <label htmlFor="lastName">Last Name:</label>
        <input
          type="text"
          name="lastName"
          value={form.lastName || ""}
          onChange={handleChange}
          required
        />
        
        <label htmlFor="phoneNumber">Phone Number (10 digits):</label>
        <input
          type="text"
          name="phoneNumber"
          value={form.phoneNumber || ""}
          onChange={handleChange}
          placeholder="1234567890"
          maxLength={10}
          required
        />
        {phoneErr && <span className="error-message">{phoneErr}</span>}
        
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          value={form.email || ""}
          onChange={handleChange}
          placeholder="example@email.com"
          required
        />

        <div className="button-container">
          <button 
            className={`${isEdit ? 'save' : 'create'}-button`} 
            onClick={handleSubmit}
          >
            {isEdit ? 'Save' : 'Create'}
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// API service functions
const api = {
  getAll: async () => {
    const res = await fetch(API_URL);
    return res.json();
  },
  
  create: async (data) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create contact');
    return res.json();
  },
  
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update contact');
    return res.json();
  },
  
  delete: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete contact');
    return res.json();
  }
};

// Main Contact Component
const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [editContact, setEditContact] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await api.getAll();
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      alert('Failed to load contacts');
    }
  };

  const handleCreate = async (data) => {
    try {
      await api.create(data);
      await fetchContacts();
      setShowCreate(false);
      alert('Contact added successfully');
    } catch (err) {
      console.error('Error creating contact:', err);
      alert('Failed to create contact');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await api.update(data._id, data);
      await fetchContacts();
      setEditContact(null);
      alert('Contact updated successfully');
    } catch (err) {
      console.error('Error updating contact:', err);
      alert('Failed to update contact');
    }
  };

  const handleDelete = async (contact) => {
    if (window.confirm(`Delete ${contact.firstName} ${contact.lastName}?`)) {
      try {
        await api.delete(contact._id);
        await fetchContacts();
        alert('Contact deleted successfully');
      } catch (err) {
        console.error('Error deleting contact:', err);
        alert('Failed to delete contact');
      }
    }
  };

  return (
    <>
      <div className="header">Contact Management App</div>
      
      <div className="container">
        <div className="search-bar">
          <button className="button" onClick={() => setShowCreate(true)}>
            Create Contact
          </button>
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
            {contacts.map((c) => (
              <tr key={c._id}>
                <td>{c.firstName} {c.lastName}</td>
                <td>{c.email}</td>
                <td>{c.phoneNumber}</td>
                <td>
                  <button 
                    className="update-button" 
                    onClick={() => setEditContact(c)}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button 
                    className="delete-button" 
                    onClick={() => handleDelete(c)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editContact && (
          <ContactForm 
            contact={editContact} 
            onClose={() => setEditContact(null)} 
            onSubmit={handleUpdate} 
          />
        )}
        
        {showCreate && (
          <ContactForm 
            onClose={() => setShowCreate(false)} 
            onSubmit={handleCreate} 
          />
        )}
      </div>
    </>
  );
};

export default Contact;
