-- Migration: create customer_feedback table
-- Run with psql or your migration tool against the project's DATABASE_URL

CREATE TABLE IF NOT EXISTS customer_feedback (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  rating INT,
  message TEXT NOT NULL,
  page TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
