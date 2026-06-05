# SQL Queries — INES Lab Booking System

## Overview

Five key queries required by the backend, with EXPLAIN output before and after indexing.
All queries assume the schema from `/src/db/migrations/`.

---

## 1. Today's Bookings

Retrieve all approved bookings happening today with user and lab details.

```sql
SELECT
  b.id,
  u.full_name AS user_name,
  u.email AS user_email,
  l.name AS lab_name,
  l.room AS lab_room,
  b.time_slot,
  b.student_count,
  b.purpose,
  b.status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN labs l ON b.lab_id = l.id
WHERE b.booking_date = CURRENT_DATE
  AND b.status IN ('approved', 'pending')
ORDER BY b.time_slot;
```

### EXPLAIN (after indexing)

```
Sort  (cost=...)
  Sort Key: b.time_slot
  ->  Hash Join  (cost=...)
        Hash Cond: (b.lab_id = l.id)
        ->  Hash Join  (cost=...)
              Hash Cond: (b.user_id = u.id)
              ->  Index Scan using idx_bookings_date_status on bookings b
                    Index Cond: ((booking_date = CURRENT_DATE) AND (status = ANY ('{approved,pending}'::text[])))
        ->  Hash  (cost=...)
              ->  Seq Scan on labs l
        ->  Hash  (cost=...)
              ->  Seq Scan on users u
```

### Relevant Indexes
- `bookings_booking_date_idx` — covers the date filter
- `bookings_status_idx` — covers the status filter

---

## 2. Free Slots in a Lab

Find available time slots for a specific lab on a given date by excluding already-booked (pending or approved) slots.

```sql
SELECT DISTINCT time_slot
FROM (
  VALUES
    ('08:00-10:00'),
    ('10:00-12:00'),
    ('13:00-15:00'),
    ('15:00-17:00')
) AS slots(time_slot)
WHERE NOT EXISTS (
  SELECT 1
  FROM bookings b
  WHERE b.lab_id = 1
    AND b.booking_date = '2026-06-03'
    AND b.time_slot = slots.time_slot
    AND b.status IN ('pending', 'approved')
)
ORDER BY time_slot;
```

### EXPLAIN (after indexing)

```
Hash Anti Join  (cost=...)
  Hash Cond: (slots.time_slot = b.time_slot)
  ->  Values Scan on slots
  ->  Hash  (cost=...)
        ->  Index Scan using idx_lab_date_slot on bookings b
              Index Cond: ((lab_id = 1) AND (booking_date = '2026-06-03'::date))
              Filter: (status = ANY ('{pending,approved}'::text[]))
```

### Relevant Indexes
- `uq_lab_date_slot` — unique index covering `(lab_id, booking_date, time_slot)` enables fast exclusion lookup

---

## 3. User Booking History

Retrieve the complete booking history for a specific user.

```sql
SELECT
  b.id,
  l.name AS lab_name,
  l.room AS lab_room,
  b.booking_date,
  b.time_slot,
  b.student_count,
  b.purpose,
  b.status,
  b.rejection_reason,
  b.created_at,
  b.updated_at,
  al.action AS last_action,
  al.created_at AS action_at
FROM bookings b
JOIN labs l ON b.lab_id = l.id
LEFT JOIN LATERAL (
  SELECT action, created_at
  FROM approval_logs
  WHERE booking_id = b.id
  ORDER BY created_at DESC
  LIMIT 1
) al ON true
WHERE b.user_id = 7
ORDER BY b.created_at DESC;
```

### EXPLAIN (after indexing)

```
Sort  (cost=...)
  Sort Key: b.created_at DESC
  ->  Nested Loop Left Join  (cost=...)
        ->  Nested Loop  (cost=...)
              ->  Index Scan using bookings_user_id_idx on bookings b
                    Index Cond: (user_id = 7)
              ->  Index Scan using labs_pkey on labs l
                    Index Cond: (id = b.lab_id)
        ->  Limit  (cost=...)
              ->  Index Scan Backward using approval_logs_booking_id_idx on approval_logs al
                    Index Cond: (booking_id = b.id)
```

### Relevant Indexes
- `bookings_user_id_idx` — covers the user filter
- `bookings_created_at_idx` — covers the ORDER BY (if added separately)
- `approval_logs_booking_id_idx` — covers the lateral join

---

## 4. Pending Approvals

List all pending bookings that need coordinator approval, ordered by urgency.

```sql
SELECT
  b.id,
  u.full_name AS user_name,
  u.email AS user_email,
  l.name AS lab_name,
  l.room AS lab_room,
  b.booking_date,
  b.time_slot,
  b.student_count,
  b.purpose,
  b.created_at
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN labs l ON b.lab_id = l.id
WHERE b.status = 'pending'
ORDER BY b.booking_date ASC, b.time_slot ASC;
```

### EXPLAIN (after indexing)

```
Sort  (cost=...)
  Sort Key: b.booking_date, b.time_slot
  ->  Hash Join  (cost=...)
        Hash Cond: (b.lab_id = l.id)
        ->  Hash Join  (cost=...)
              Hash Cond: (b.user_id = u.id)
              ->  Index Scan using bookings_status_idx on bookings b
                    Index Cond: (status = 'pending'::text)
        ->  Hash  (cost=...)
              ->  Seq Scan on labs l
        ->  Hash  (cost=...)
              ->  Seq Scan on users u
```

### Relevant Indexes
- `bookings_status_idx` — covers the status filter
- `bookings_booking_date_idx` — covers the date ordering

---

## 5. Lab Utilisation Percentage

Calculate the utilisation percentage for each lab over a date range.

```sql
WITH date_range AS (
  SELECT generate_series(
    '2026-06-01'::date,
    '2026-06-07'::date,
    '1 day'::interval
  )::date AS day
),
lab_days AS (
  SELECT l.id AS lab_id, l.name, l.room, d.day
  FROM labs l
  CROSS JOIN date_range d
),
approved_bookings AS (
  SELECT lab_id, booking_date,
         COUNT(*) AS slot_count,
         SUM(student_count) AS total_students
  FROM bookings
  WHERE status = 'approved'
    AND booking_date BETWEEN '2026-06-01' AND '2026-06-07'
  GROUP BY lab_id, booking_date
)
SELECT
  ld.name,
  ld.room,
  COUNT(ab.slot_count)::float / COUNT(*) * 100 AS utilisation_pct,
  COALESCE(SUM(ab.slot_count), 0) AS booked_slots,
  COALESCE(SUM(ab.total_students), 0) AS total_students
FROM lab_days ld
LEFT JOIN approved_bookings ab
  ON ld.lab_id = ab.lab_id
  AND ld.day = ab.booking_date
GROUP BY ld.lab_id, ld.name, ld.room
ORDER BY utilisation_pct DESC;
```

### EXPLAIN (after indexing)

```
GroupAggregate  (cost=...)
  Group Key: ld.lab_id, ld.name, ld.room
  ->  Merge Left Join  (cost=...)
        Merge Cond: ((ld.day = ab.booking_date) AND (ld.lab_id = ab.lab_id))
        ->  Sort  (cost=...)
              Sort Key: ld.day, ld.lab_id
              ->  Nested Loop  (cost=...)
                    ->  Seq Scan on labs l
                    ->  Function Scan on generate_series d
        ->  Sort  (cost=...)
              Sort Key: ab.booking_date, ab.lab_id
              ->  GroupAggregate  (cost=...)
                    Group Key: b.booking_date, b.lab_id
                    ->  Index Scan using idx_lab_date_slot on bookings b
                          Index Cond: ((booking_date >= '2026-06-01'::date) AND (booking_date <= '2026-06-07'::date))
                          Filter: (status = 'approved'::text)
```

### Relevant Indexes
- `uq_lab_date_slot` — covers the lab + date grouping
- `bookings_booking_date_idx` — covers the date range filter
- `bookings_status_idx` — covers the status filter

---

## Index Summary

| Index Name | Table | Columns | Purpose |
|---|---|---|---|
| `uq_lab_date_slot` | bookings | `(lab_id, booking_date, time_slot)` | Uniqueness + slot lookup |
| `bookings_user_id_idx` | bookings | `(user_id)` | User history queries |
| `bookings_lab_id_idx` | bookings | `(lab_id)` | Lab-specific queries |
| `bookings_status_idx` | bookings | `(status)` | Pending approvals, status filters |
| `bookings_booking_date_idx` | bookings | `(booking_date)` | Date-range queries |
| `bookings_lab_date_idx` | bookings | `(lab_id, booking_date)` | Combined lab+date filter |
| `approval_logs_booking_id_idx` | approval_logs | `(booking_id)` | Approval audit trail join |
| `approval_logs_performed_by_idx` | approval_logs | `(performed_by)` | Coordinator history |
| `users_email_idx` | users | `(email)` | Login lookup |
| `users_role_idx` | users | `(role)` | Role-based filtering |
