-- Migration Script for LSGD and Contact Management Module

-- Create lsgd table
CREATE TABLE lsgd (
    id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    district VARCHAR(255) NOT NULL,
    block VARCHAR(255) NOT NULL,
    ward_count INT,
    status VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    PRIMARY KEY (id)
);

-- Create contacts table
CREATE TABLE contacts (
    id BINARY(16) NOT NULL,
    lsgd_id BINARY(16) NOT NULL,
    person_name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    department VARCHAR(255),
    primary_phone VARCHAR(255) NOT NULL,
    secondary_phone VARCHAR(255),
    whatsapp_number VARCHAR(255),
    email VARCHAR(255),
    remarks TEXT,
    source VARCHAR(50) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    status VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_contacts_lsgd FOREIGN KEY (lsgd_id) REFERENCES lsgd (id),
    CONSTRAINT uk_contacts_lsgd_phone UNIQUE (lsgd_id, primary_phone)
);

-- Indexes
CREATE INDEX idx_contacts_primary_phone ON contacts (primary_phone);
CREATE INDEX idx_contacts_lsgd_id ON contacts (lsgd_id);
