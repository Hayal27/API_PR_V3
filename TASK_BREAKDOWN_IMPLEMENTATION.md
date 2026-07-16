# Task Breakdown Feature - Backend Implementation Summary

## Overview
I've successfully implemented the backend support for the hierarchical task breakdown feature (Monthly Tasks → Weekly Tasks) for specific objective details.

## Database Changes

### New Tables Created

#### 1. `monthly_tasks`
Stores monthly task information linked to specific objective details.

**Columns:**
- `monthly_task_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `specific_objective_detail_id` (INT, FOREIGN KEY)
- `name` (VARCHAR(255)) - Task name
- `weight` (DECIMAL(5,2)) - Weight percentage for reporting
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes:**
- Primary key on `monthly_task_id`
- Index on `specific_objective_detail_id`
- Index on `weight` for performance

**Constraints:**
- Foreign key to `specific_objective_details` with CASCADE delete/update

#### 2. `weekly_tasks`
Stores weekly task information linked to monthly tasks.

**Columns:**
- `weekly_task_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `monthly_task_id` (INT, FOREIGN KEY)
- `name` (VARCHAR(255)) - Task name
- `weight` (DECIMAL(5,2)) - Weight percentage for reporting
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes:**
- Primary key on `weekly_task_id`
- Index on `monthly_task_id`
- Index on `weight` for performance

**Constraints:**
- Foreign key to `monthly_tasks` with CASCADE delete/update

## Backend Controller Updates

### Modified: `planDtailedController.js`

The `addspecificObjectiveDetails` function has been enhanced to:

1. **Accept tasks array** in the request payload
2. **Insert monthly tasks** after creating the specific objective detail
3. **Insert weekly tasks** for each monthly task
4. **Handle errors gracefully** - if task insertion fails, the detail is still created

**Data Flow:**
```
Frontend sends:
{
  specific_objective: [{
    ...existing fields...,
    tasks: [
      {
        name: "Month 1 Plan",
        weight: 25,
        weeklyTasks: [
          { name: "Week 1 Task", weight: 25 },
          { name: "Week 2 Task", weight: 25 },
          ...
        ]
      },
      ...
    ]
  }]
}
```

**Backend processes:**
1. Creates specific_objective_detail → gets `detail_id`
2. For each monthly task:
   - Inserts into `monthly_tasks` → gets `monthly_task_id`
   - For each weekly task:
     - Inserts into `weekly_tasks` with `monthly_task_id`

## Files Created/Modified

### Created:
1. `/backend/models/datase/task_breakdown_tables.sql` - SQL schema
2. `/backend/scripts/create_task_tables.js` - Migration script
3. `/backend/scripts/migrate_task_breakdown.js` - Alternative migration script

### Modified:
1. `/backend/controllers/planDtailedController.js` - Added task insertion logic

## Migration Status

✅ **Tables successfully created** in the database using:
```bash
node scripts/create_task_tables.js
```

## Testing the Feature

### Frontend Payload Example:
```javascript
{
  specific_objective: [{
    specific_objective_id: 123,
    specific_objective_detailname: "Test Detail",
    // ...other required fields...
    tasks: [
      {
        name: "January Activities",
        weight: 33.33,
        weeklyTasks: [
          { name: "Week 1: Planning", weight: 25 },
          { name: "Week 2: Execution", weight: 25 },
          { name: "Week 3: Review", weight: 25 },
          { name: "Week 4: Reporting", weight: 25 }
        ]
      },
      {
        name: "February Activities",
        weight: 33.33,
        weeklyTasks: [
          { name: "Week 1: Implementation", weight: 50 },
          { name: "Week 2-4: Monitoring", weight: 50 }
        ]
      }
    ]
  }]
}
```

### Backend Response:
```javascript
{
  message: "Specific objective details added successfully.",
  insertIds: [detail_id]
}
```

## Future Enhancements

### Recommended:
1. **Fetch API** - Create endpoints to retrieve tasks:
   - `GET /api/monthly-tasks/:detail_id`
   - `GET /api/weekly-tasks/:monthly_task_id`

2. **Update/Delete APIs** - Allow modification of tasks:
   - `PUT /api/monthly-tasks/:id`
   - `DELETE /api/monthly-tasks/:id`
   - Similar for weekly tasks

3. **Weight Validation** - Add server-side validation:
   - Ensure monthly task weights sum to 100%
   - Ensure weekly task weights sum to 100% per month

4. **Reporting Queries** - Create aggregation queries:
   - Calculate weighted progress
   - Generate quarterly reports based on task completion

## Notes

- **Cascade Deletion**: When a specific objective detail is deleted, all associated monthly and weekly tasks are automatically deleted
- **Weight Storage**: Weights are stored as DECIMAL(5,2) allowing values from 0.00 to 999.99
- **Timestamps**: Both tables automatically track creation and update times
- **Error Handling**: If task insertion fails, the main detail is still created (graceful degradation)

## Status: ✅ COMPLETE

The backend is now fully configured to accept and store hierarchical task breakdown data. The frontend can immediately start sending task data with the existing form implementation.
