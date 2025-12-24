import React, { useState } from 'react';
import axios from 'axios';

const AddOfficeStaff = ({ onSuccess }) => {
  const [officeStaff, setOfficeStaff] = useState({
    name: '',
    email: '',
    password: '',
    mobileNumber: '',
    adharUid: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === 'phoneNumber') {
      value = value.replace(/\D/g, '');
    }
    setOfficeStaff({ ...officeStaff, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: undefined });
  };

  const validate = () => {
    const errs = {};
    if (!officeStaff.name.trim()) errs.name = 'Name is required';
    if (!officeStaff.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.[\w-]+$/.test(officeStaff.email.trim())) errs.email = 'Enter a valid email';
    if (!officeStaff.password) errs.password = 'Password is required';
    else if (officeStaff.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!officeStaff.mobileNumber.trim()) errs.mobileNumber = 'Mobile number is required';
    else if (!/^\d{10}$/.test(officeStaff.mobileNumber.trim())) errs.mobileNumber = 'Enter a valid 10-digit phone number';
    if (!officeStaff.adharUid.trim()) errs.adharUid = 'adhar is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const token = localStorage.getItem("jwtToken");
      const apiUrl = process.env.REACT_APP_API_URL;

      const payload = {
        name: officeStaff.name.trim(),
        email: officeStaff.email.trim().toLowerCase(),
        password: officeStaff.password,
        mobileNumber: officeStaff.mobileNumber.trim(),
        adharUid: officeStaff.adharUid.trim(),
      };

      await axios.post(
        `${apiUrl}admin/add-staff`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMessage("Staff added successfully!");
      setError('');
      setOfficeStaff({
        name: '',
        email: '',
        password: '',
        userType: 'OFFICE_STAFF',
        mobileNumber: '',
        adharUid: ''
      });
      setErrors({});

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      const status = err && err.response ? err.response.status : undefined;
      const data = err && err.response ? err.response.data : undefined;
      const serverMessage =
        (typeof data === 'string' ? data : (data && (data.message || data.error || data.detail))) ||
        (err && err.message) ||
        'Failed to add STAFF';

      // Global error
      setError(serverMessage);
      setSuccessMessage('');

      // Field-level hints for duplicates (409 or message hints)
      const duplicateHints = ['duplicate', 'already exists', 'already registered', 'exists'];
      const msgLower = typeof serverMessage === 'string' ? serverMessage.toLowerCase() : '';
      const isDuplicate = status === 409 || duplicateHints.some((h) => msgLower.includes(h));

      if (isDuplicate) {
        const fieldUpdates = { ...errors };
        if (msgLower.includes('phone') || msgLower.includes('mobile')) {
          fieldUpdates.mobileNumber = serverMessage;
        }
        if (msgLower.includes('email')) {
          fieldUpdates.email = serverMessage;
        }
        setErrors(fieldUpdates);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Add OFFICE_STAFF</h2>

      {successMessage && <p className="text-green-600">{successMessage}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <input
          type="text"
          name="name"
          value={officeStaff.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
        />
        {errors.name && <p className="error-text">{errors.name}</p>}
        <input
          type="email"
          name="email"
          value={officeStaff.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        {errors.email && <p className="error-text">{errors.email}</p>}
        <input
          type="password"
          name="password"
          value={officeStaff.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        {errors.password && <p className="error-text">{errors.password}</p>}

        <input
          type="tel"
          name="mobileNumber"
          value={officeStaff.mobileNumber}
          onChange={handleChange}
          placeholder="Mobile Number"
          required
          inputMode="numeric"
          maxLength={10}
          onInvalid={(e) => e.target.setCustomValidity('')}
          onInput={(e) => e.currentTarget.setCustomValidity('')}
        />
        {errors.mobileNumber && <p className="error-text">{errors.phoneNumber}</p>}
        <textarea
          name="adharUid"
          value={officeStaff.adharUid}
          onChange={handleChange}
          placeholder="AdharUid"
          required
        />
        {errors.adharUid && <p className="error-text">{errors.adharUid}</p>}
        <div className="form-actions full-width">
          <button
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOfficeStaff;
