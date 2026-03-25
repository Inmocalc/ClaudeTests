-- APS Train System Database Schema
-- PostgreSQL Database Schema for Production Orders

-- Drop existing tables if recreating
DROP TABLE IF EXISTS production_orders CASCADE;

-- Production Orders Table
CREATE TABLE production_orders (
  id VARCHAR(50) PRIMARY KEY,
  model_type VARCHAR(10) NOT NULL,
  due_date DATE NOT NULL,
  priority INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT check_status CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT check_priority CHECK (priority > 0),
  CONSTRAINT check_model_type CHECK (model_type IN ('A', 'B', 'C'))
);

-- Indexes for performance
CREATE INDEX idx_orders_status ON production_orders(status);
CREATE INDEX idx_orders_due_date ON production_orders(due_date);
CREATE INDEX idx_orders_model_type ON production_orders(model_type);
CREATE INDEX idx_orders_priority ON production_orders(priority);
CREATE INDEX idx_orders_created_at ON production_orders(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_production_orders_updated_at
BEFORE UPDATE ON production_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO production_orders (id, model_type, due_date, priority, status, created_at) VALUES
  ('ORD-001', 'A', CURRENT_DATE + INTERVAL '10 days', 1, 'pending', CURRENT_TIMESTAMP),
  ('ORD-002', 'B', CURRENT_DATE + INTERVAL '12 days', 2, 'pending', CURRENT_TIMESTAMP),
  ('ORD-003', 'C', CURRENT_DATE + INTERVAL '15 days', 3, 'pending', CURRENT_TIMESTAMP),
  ('ORD-004', 'A', CURRENT_DATE + INTERVAL '8 days', 4, 'pending', CURRENT_TIMESTAMP),
  ('ORD-005', 'B', CURRENT_DATE + INTERVAL '20 days', 5, 'pending', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Comments
COMMENT ON TABLE production_orders IS 'Production orders for train manufacturing';
COMMENT ON COLUMN production_orders.id IS 'Unique order identifier';
COMMENT ON COLUMN production_orders.model_type IS 'Train model type: A, B, or C';
COMMENT ON COLUMN production_orders.due_date IS 'Target completion date';
COMMENT ON COLUMN production_orders.priority IS 'Order priority (lower number = higher priority)';
COMMENT ON COLUMN production_orders.status IS 'Current order status';
COMMENT ON COLUMN production_orders.created_at IS 'Order creation timestamp';
COMMENT ON COLUMN production_orders.updated_at IS 'Last update timestamp';
